import { buildEntry, digest, createNodeId } from '../transform';

export default {
    test: (columnData) => {
        return columnData.ui === 'markdown';
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
        if (!value) {
            return {
                value
            };
        }

        const node = {
            id: createNodeId(entryId, columnData.id),
            parent: directusEntry.id,
            children: [],
            internal: {
                type: createNodeId(tableName, columnData.id),
                mediaType: `text/markdown`,
                content: value,
                contentDigest: digest(value)
            }
        };
        
        return {
            type: 'complex',
            node,
            value
        };
    }
};