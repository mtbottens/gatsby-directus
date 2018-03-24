import { buildEntry, digest, createNodeId, getTable, dependentNodeQueue, upperCase } from '../../transform';

export default {
    test: (columnData) => {
        return columnData.ui === 'many_to_one';
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
        const relatedEntryId = value.data.id;
        const relatedEntry = getTable(value.meta.table).entries.filter(relatedEntry => relatedEntry.id === relatedEntryId);

        const node = await buildEntry({
            tableName: `${tableName}__${value.meta.table}`,
            foreignTableReference: value.meta.table,
            entry: relatedEntry[0]
        });

        return {
            type: 'complex',
            node,
            value
        }
    }
};