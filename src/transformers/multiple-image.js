import { buildEntry, digest, createNodeId, getTable, dependentNodeQueue, upperCase } from '../transform';
import imageTransformer from './image';

export default {
    test: (columnData) => {
        return columnData.ui === 'multiple_files' && columnData.related_table === 'directus_files';
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
        let images = [],
            dependentNodes = [],
            idx = 0;

        for (let image of value.data) {
            let entry = {
                id: createNodeId(entryId, columnData.id, idx),
                parent: directusEntry.id,
                children: [],
                internal: {
                    type: entryType
                }
            };

            let transformedNode = await imageTransformer.transform({
                tableName,
                entryId,
                entryType,
                columnData,
                value: {data: image},
                entry,
                foreignTableReference,
                directusEntry: entry
            });
            transformedNode.node.id = `${transformedNode.node.id}__${idx}__source`;
            entry.children = entry.children.concat([transformedNode.node.id]);
            entry[`image___NODE`] = transformedNode.node.id;
            dependentNodes.push(transformedNode.node);
            entry.internal.contentDigest = digest(JSON.stringify(entry));
            images.push(entry);
            idx++;
        }

        return {
            node: {},
            value: images,
            dependentNodes
        };
    }
};