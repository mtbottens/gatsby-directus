import crypto from 'crypto';
import _ from 'lodash';

import markdown from './transformers/markdown';
import toggle from './transformers/toggle';
import image from './transformers/image';
import manyToMany from './transformers/relation/many-to-many';

/**
 * Returns string with first letter uppercased
 * 
 * @param  {String} str 
 */
const upperCase = str => 
    str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Converts a string into a digest for Gatsby to interpret
 * 
 * @param {String} str 
 */
const digest = str =>
    crypto
        .createHash(`md5`)
        .update(str)
        .digest(`hex`);

/** Prevent these fields from directus overriding gatsby internal nodes */        
const RESTRICTED_NODE_FIELDS = [
    `id`,
    `children`,
    `parent`,
    `fields`,
    `internal`,
];

/** Prefix for directus node types */
const NODE_ID_PREFIX = `Directus`;

/**
 * Converts any number of arguments into a gatsby node id or type
 * 
 * @param  {String[]} ...identifiers
 */
const createNodeId = (...identifiers) => {
    let nodeId = '';

    for (let identifier of identifiers) {
        nodeId += `__${identifier}`;
    }

    // Strip out extra prefixes due to crappy code on my part
    nodeId = nodeId.replace(`${NODE_ID_PREFIX}`, '').replace(/____/g, '__').replace(/^__/, '');
    nodeId = `${NODE_ID_PREFIX}__${nodeId}`;

    return nodeId;
};

/** Global to assist in table data lookup */
let AllTransformerTables;
let transformers = [markdown, toggle, image, manyToMany];
const dependentNodeQueue = [];

const transformer = async ({ currentTables, allTables }) => {
    if (allTables) {
        AllTransformerTables = allTables;
    }

    const transformerData = {};

    for (let table of currentTables) {
        const tableData = await buildTable({
            table
        });

        transformerData[table.name] = tableData;
    }

    return transformerData;
};

const buildTable = async ({ table }) => {
    const tableRows = table.entries.slice();

    const entries = [];

    for (let entry of tableRows) {
        const entryData = await buildEntry({
            tableName: table.name,
            entry
        });

        entries.push(entryData);
    }

    return entries;
};

const buildEntry = async ({ tableName, entry, foreignTableReference, parentOverride }) => {
    const basicFields = {};
    const complexFields = {};
    const entryId = createNodeId(upperCase(tableName), entry.id);
    const entryType = createNodeId(upperCase(tableName));

    let directusEntry = {
        id: entryId,
        parent: parentOverride || `__source__`,
        children: [],
        internal: {
            type: entryType
        }
    };

    const validColumnNames = Object.keys(entry).filter(key => RESTRICTED_NODE_FIELDS.indexOf(key) === -1);

    for (let columnName of validColumnNames) {
        const columnData = lookupColumnData({
            tableName: foreignTableReference || tableName,
            columnName
        });
        const value = entry[columnName];

        const columnTransformer = _.find(transformers, function(transformer) {
            return transformer.test(columnData);
        });

        if (columnTransformer) {
            const transformedNode = await columnTransformer.transform({
                tableName,
                entryId,
                entryType,
                columnData,
                value,
                entry,
                foreignTableReference,
                directusEntry
            });

            if (transformedNode.type === 'complex') {
                dependentNodeQueue.push(transformedNode.node);
                directusEntry.children = directusEntry.children.concat([transformedNode.node.id]);
                complexFields[`${columnName}___NODE`] = transformedNode.node.id;
            } else {
                basicFields[columnName] = transformedNode.value;
            }
        } else {
            basicFields[columnName] = value;
        }
    }

    directusEntry = { ...complexFields, ...basicFields, ...directusEntry };
    directusEntry.internal.contentDigest = digest(JSON.stringify(directusEntry));
    
    return directusEntry;
};

const getTable = (tableName) => {
    const table = _.find(AllTransformerTables, {
        table_name: tableName
    });
    if (table && table.id) {
        return table;
    } else {
        throw new Error(`Table: "${tableName}" does not exist`);
    }
};

const lookupColumnData = ({ tableName, columnName }) => {
    const table = getTable(tableName);

    if (table) {
        return _.find(table.columns.data, {id: columnName});
    }

    return false;
};

let programDirectory;
let siteUrl;

const setProgramDirectory = (dir) => {
    programDirectory = dir;
}
const setSiteUrl = (url) => {
    siteUrl = url;
}

export { setProgramDirectory, setSiteUrl, programDirectory, siteUrl, transformer, getTable, buildEntry, digest, createNodeId, upperCase, dependentNodeQueue };
