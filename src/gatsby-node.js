import _ from 'lodash';
import fs from 'fs-extra';
import fetchData from './fetch';
import request from 'request';
import Colors from 'colors';
import crypto from 'crypto';

const getNodeTypeNameForTable = name =>
  name.charAt(0).toUpperCase() + name.slice(1);

const digest = str =>
  crypto
    .createHash(`md5`)
    .update(str)
    .digest(`hex`)

const RESTRICTED_NODE_FIELDS = [
  `id`,
  `children`,
  `parent`,
  `fields`,
  `internal`,
]

const downloadAndMoveToCache = async (url, localFile) => {
  fs.ensureFileSync(localFile);
  const fileContents = fs.readFileSync(localFile, 'utf8');
  if (fileContents) {
    return true;
  } else {
    console.log(`Syncing Image from Directus: ${url}`.cyan);
    let returnVal = false;
    await new Promise((resolve, reject) => {
      request.head(url, (error, response, body) => {
        request(url).pipe(fs.createWriteStream(localFile)).on('close', () => {
          console.log(`Image successfully downloaded, Local Path: ${localFile}`.cyan)
          returnVal = true;
          resolve('success');
        }).on('error', reject);
      });
    });
    return returnVal;
  }
};

const apiVersion = '1.1';

const sourceNodes = async (
  { boundActionCreators, store },
  { url, accessToken }
) => {
  const program = store.getState().program;
  const {
    createNode
  } = boundActionCreators;

  // Strip trailing slashes
  const formattedUrl = url.replace(/\/$/, '') + `/api/${apiVersion}/`;

  let currentTables = await fetchData({
    url: formattedUrl,
    accessToken
  });

  for (let table of currentTables) {
    const vanillaFields = {};
    const complexFields = {};

    const entries = table.entries.slice();
    delete table.entries;

    for (let tableRow of entries) {
      const directusItem = {
        id: `Directus__${getNodeTypeNameForTable(table.name)}__${tableRow.id}`,
        parent: `__source__`,
        children: [],
        internal: {
          type: `Directus__${getNodeTypeNameForTable(table.name)}`
        }
      };

      const validKeys = _.filter(Object.keys(tableRow), (key) => {
        return RESTRICTED_NODE_FIELDS.indexOf(key) === -1;
      })
      for (let validKey of validKeys) {
        const columnData = _.find(table.columns.data, {id: validKey});
        const value = tableRow[validKey];
        if (columnData.ui === 'markdown') {
          const mdNode = {
            id: `Directus__${getNodeTypeNameForTable(table.name)}__${tableRow.id}__${validKey}`,
            parent: directusItem.id,
            children: [],
            [validKey]: value,
            internal: {
              type: validKey,
              mediaType: `text/markdown`,
              content: value,
              contentDigest: digest(value)
            }
          }
          createNode(mdNode)
          directusItem.children = directusItem.children.concat([mdNode.id]);
          complexFields[`${validKey}___NODE`] = mdNode.id
        } else if (columnData.ui === 'single_file' && columnData.related_table === 'directus_files') {
          let imageUrlOnServer = `${url}${value.data.url}`;
          let localImagePath = `${program.directory}/.cache/directus${value.data.url}`;
          let success = downloadAndMoveToCache(imageUrlOnServer, localImagePath);
          let fileName = value.data.name.replace(/\..*?$/, '');
          let fileType = value.data.name.replace(/.*\./, '');
          let mimeType = `image/${fileType}`

          const imageNode = {
            id: `Directus__${getNodeTypeNameForTable(table.name)}__${tableRow.id}__${validKey}`,
            parent: directusItem.id,
            children: [],
            absolutePath: localImagePath,
            extension: 'jpg',
            name: value.data.name.replace(/\..*?$/, ''),
            internal: {
              type: validKey,
              mediaType: mimeType,
              content: `${url}${value.data.url}`,
              contentDigest: digest(localImagePath)
            }
          };
          createNode(imageNode);
          directusItem.children = directusItem.children.concat([imageNode.id]);
          complexFields[`${validKey}___NODE`] = imageNode.id
        } else {
          vanillaFields[validKey] = value;
        }
      }

      directusItem = {...complexFields, ...vanillaFields, ...directusItem}

      // Get content digest of node.
      const directusContentDigest = digest(JSON.stringify(directusItem))

      directusItem.internal.contentDigest = directusContentDigest
      createNode(directusItem);
    }
  }

  return;
}

export { sourceNodes }
