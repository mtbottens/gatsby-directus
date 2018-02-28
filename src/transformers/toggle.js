export default {
    test: (columnData) => {
        return columnData.ui === 'toggle';
    },

    transform: async ({
        value,
    }) => {
        return {
            type: 'basic',
            value: !!value
        };
    }
};