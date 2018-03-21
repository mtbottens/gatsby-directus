import fs from 'fs-extra';
import request from 'request';
import Colors from 'colors';
import { programDirectory, siteUrl, buildEntry, digest, createNodeId } from '../transform';

/**
 * Downloads file from directus server to file system
 * 
 * @param {*} url 
 * @param {*} localFile 
 */
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

export default {
    test: (columnData) => {
        console.log(columnData);
        return columnData.ui === 'single_file' && columnData.related_table === 'directus_files';
    },

    transform: async ({
        tableName,
        entryId,
        entryType,
        columnData,
        value,
        entry,
        foreignTableReference,
        directusEntry
    }) => {
        let imageUrlOnServer = `${siteUrl}${value.data.url}`;
        let localImagePath = `${programDirectory}/.cache/directus${value.data.url}`;
        await downloadAndMoveToCache(imageUrlOnServer, localImagePath);
        /** TODO: Better way to get name and mimetype for the file */
        let fileName = value.data.name.replace(/\..*?$/, '');
        let fileType = value.data.name.replace(/.*\./, '');
        let mimeType = `image/${fileType}`;

        const node = {
            id: createNodeId(entryId, columnData.id),
            parent: directusEntry.id,
            children: [],
            absolutePath: localImagePath,
            extension: fileType,
            name: fileName,
            internal: {
                type: createNodeId(tableName, columnData.id),
                mediaType: mimeType,
                content: imageUrlOnServer,
                contentDigest: digest(localImagePath)
            }
        };

        return {
            node,
            type: 'complex',
            value: value
        };
    }
};