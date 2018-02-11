export default {
    test: (columnData) => {
        return columnData.ui === 'markdown';
    },

    transform: async ({
        table,
        entity,
        directusEntity,
        validKey,
        value,
        createNodeId,
        digest
    }) => {
        const node = {
            id: createNodeId(table.name, entity.id, validKey),
            parent: directusEntity.id,
            children: [],
            [validKey]: value,
            internal: {
                type: validKey,
                mediaType: `text/markdown`,
                content: value,
                contentDigest: digest(value)
            }
        };
        
        return node;
    }
};