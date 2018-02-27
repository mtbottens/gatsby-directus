export default {
    test: (columnData) => {
        return columnData.ui === 'many_to_many' && columnData.type === 'ALIAS';
    },

    transform: async ({
        table,
        entity,
        directusEntity,
        validKey,
        value,
        createNodeId,
        digest,
        lookupColumnData,
        buildTable,
        getTable,
        createNode,
        url,
        program
    }) => {
        const columnData = lookupColumnData(table.name, validKey);
        const entries = await buildTable({
            table: getTable(columnData.relationship.related_table),
            createNode,
            url,
            program
        });

        const node = {
            id: createNodeId(table.name, entity.id, validKey),
            parent: directusEntity.id,
            children: entries.map(entry => entry.id),
            internal: {
                type: validKey,
                content: JSON.stringify(value),
                contentDigest: digest(JSON.stringify(value))
            }
        };
        
        return node;
    }
};