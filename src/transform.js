import crypto from 'crypto';
import _ from 'lodash';
import Colors from 'colors';
import markdown from './transformers/markdown';
import image from './transformers/image';

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
    let nodeId = `${NODE_ID_PREFIX}`;

    for (let identifier of identifiers) {
        nodeId += `__${identifier}`;
    }

    return nodeId;
};

/** Array of transformer objects used to convert data to corrent types */
const transformers = [markdown, image];

const transformer = ({ url, program, currentTables, createNode }) => {
    let entitiesCreated = 0;
    let EntityTypesArray = [];

    for (let table of currentTables) {
        // For fields that require no additional processing
        const basicFields = {};
        // For fields that need processing, ie. Adding mime/types for transformer plugins
        const complexFields = {};
        // Gets each entity from the table
        const entries = table.entries.slice();
        delete table.entries;

        for (let entity of entries) {
            const entityId = createNodeId(upperCase(table.name), entity.id);
            const entityType = createNodeId(upperCase(table.name));

            // Create a node for this entity
            const directusEntity = {
                id: entityId,
                parent: `__source__`,
                children: [],
                internal: {
                    type: entityType
                }
            };

            // Remove conflicting fields
            const validKeys = _.filter(Object.keys(entity), (key) => {
                return RESTRICTED_NODE_FIELDS.indexOf(key) === -1;
            });

            // Loop through each valid key and transform them into basic or complex nodes
            for (let validKey of validKeys) {
                const columnData = _.find(table.columns.data, { id: validKey });
                const value = entity[validKey];

                const columnTransformer = _.find(transformers, function(transformer) {
                    return transformer.test(columnData);
                });

                if (columnTransformer) {
                    const node = columnTransformer.transform({
                        url,
                        program,
                        table,
                        entity,
                        directusEntity,
                        validKey,
                        value,
                        createNodeId,
                        digest,
                    });
                    createNode(node);
                    directusEntity.children = directusEntity.children.concat([node.id]);
                    complexFields[`${validKey}___NODE`] = node.id;
                } else {
                    basicFields[validKey] = value;
                }
            }

            directusEntity = { ...complexFields, ...basicFields, ...directusEntity};
            directusEntity.internal.contentDigest = digest(JSON.stringify(directusEntity));
            createNode(directusEntity);

            // Stats for console
            if (EntityTypesArray.indexOf(entityType) === -1) EntityTypesArray.push(entityType);
            entitiesCreated++;
        }
    }

    // Output generation stats to console
    console.log(`Directus Entity Types Processed: ${EntityTypesArray.length}`.blue);
    console.log(`Directus Entities Created: ${entitiesCreated}`.blue);
};

export { transformer };