import {transformer} from '../transform-new'
import simpleData from './data/simple-data.json'
import markdownData from './data/markdown-data.json'
import toggleData from './data/toggle-data.json'

describe(`Processes Data From Directus CMS`, () => {
    it(`passes`, () => {
        expect(true).toBeTruthy()
    })

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

    it (`Properly Processes Toggle Complex Fields`, async () => {
        let transformedData = await transformer({
            currentTables: toggleData,
            allTables: toggleData
        })
        for (let entry of transformedData['test_table']) {
            if (entry.id === 'DirectusTransformNew__Test_table__1') {
                expect(entry.toggle).toBeTruthy();
            } else {
                expect(entry.toggle).toBeFalsy();
            }
        }
        expect(transformedData).toMatchSnapshot();
    })
})