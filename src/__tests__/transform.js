import {transformer} from '../transform'
import simpleData from './data/simple-data.json'
import markdownData from './data/markdown-data.json'
import toggleData from './data/toggle-data.json'
import manyToOneData from './data/many-to-one-data.json'
import manyToManyData from './data/many-to-many-data.json'

describe(`Processes Data From Directus CMS`, () => {
    it(`Properly Builds Simple Tables`, async () => {
        let transformedData = await transformer({
            currentTables: simpleData,
            allTables: simpleData
        });
        expect(transformedData).toMatchSnapshot();
    })

    it(`Properly Processes Markdown Complex Fields`, async () => {
        let transformedData = await transformer({
            currentTables: markdownData,
            allTables: markdownData
        })
        expect(transformedData).toMatchSnapshot();
    })

    it(`Properly Processes Toggle Complex Fields`, async () => {
        let transformedData = await transformer({
            currentTables: toggleData,
            allTables: toggleData
        })
        for (let entry of transformedData.data['test_table']) {
            if (entry.id === 'Directus__Test_table__1') {
                expect(entry.toggle).toBeTruthy();
            } else {
                expect(entry.toggle).toBeFalsy();
            }
        }
        expect(transformedData).toMatchSnapshot();
    })

    it(`Properly Processes Many to One or One to Many Relationships`, async () => {
        let transformedData = await transformer({
            currentTables: manyToOneData,
            allTables: manyToOneData
        });
        // manyToOneData also contains markdown for nested complex fields
        expect(transformedData).toMatchSnapshot();
    })

    it(`Propery Processes Many to Many Relationships`, async () => {
        let transformedData = await transformer({
            currentTables: manyToManyData,
            allTables: manyToManyData
        });
        expect(transformedData).toMatchSnapshot();
    })
})