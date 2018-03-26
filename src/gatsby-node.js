import fetchData from './fetch';
import { transformer, dependentNodeQueue, setProgramDirectory, setSiteUrl } from './transform';
import _ from 'lodash';

const apiVersion = '1.1';

const sourceNodes = async (
    { boundActionCreators, store },
    { url, accessToken }
) => {
    const program = store.getState().program;
    setProgramDirectory(program.directory);
    setSiteUrl(url);
    const {
        createNode
    } = boundActionCreators;

    // Strip trailing slashes
    const formattedUrl = url.replace(/\/$/, '') + `/api/${apiVersion}/`;

    let allTables = await fetchData({
        url: formattedUrl,
        accessToken
    });

    const transformerData = await transformer({
        allTables,
        currentTables: allTables,
        createNode,
    });

    const createNodeQueue = _.flatten(transformerData.dependentNodeQueue.concat(Object.values(transformerData.data)));
    const createdNodes = {};

    while (createNodeQueue.length !== 0) {
        const currentNode = createNodeQueue.shift();
        let shouldCreateNode = true;
        for (let child of currentNode.children) {
            if (!createdNodes[child]) {
                console.log(`Queuing Node: ${currentNode.id} due to missing ${child}`);
                shouldCreateNode = false;
                break;
            }
        }
        if (shouldCreateNode) {
            createdNodes[currentNode.id] = true;
            createNode(currentNode);
        } else {
            createNodeQueue.push(currentNode);
        }
    }

    return;
}

export { sourceNodes }
