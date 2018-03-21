import { buildEntry, digest, createNodeId, getTable, dependentNodeQueue, upperCase } from '../../transform';

export default {
    test: (columnData) => {
        return columnData.ui === 'many_to_many';
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
        const relatedEntryIds = value.data.map(relatedEntry => relatedEntry.id);
        const relatedEntries = getTable(value.meta.table).entries.filter(relatedEntry => relatedEntryIds.indexOf(relatedEntry.id) > -1);

        const entryNodes = [];
        for (let entry of relatedEntries) {
            const entryNode = await buildEntry({
                tableName: `${tableName}__${value.meta.table}`,
                foreignTableReference: value.meta.table,
                entry
            });
            entryNodes.push(entryNode);
        }
        
        return {
            node: {},
            value: entryNodes
        };
    }
};