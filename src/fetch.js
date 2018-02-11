import { RemoteInstance } from 'directus-sdk-javascript';

const fetcher = async ({ accessToken, url }) => {
  const client = new RemoteInstance({ url, accessToken });

  // Fetch all tables
  const allTableData = await client.getTables({});

  // Construct tables tableData
  let currentTables = [];
  await Promise.all(allTableData.data.map(async (table) => {
    const tableData = await client.getTable(table.name);
    const tableEntries = await client.getItems(table.name);
    tableData.data.entries = tableEntries.data;
    currentTables.push(tableData.data);
  }));

  return currentTables;
};

export { fetcher as default };
