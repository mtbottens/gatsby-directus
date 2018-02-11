import fetchData from './fetch';
import { transformer } from './transform';

const apiVersion = '1.1';

const sourceNodes = async (
    { boundActionCreators, store },
    { url, accessToken }
) => {
    const program = store.getState().program;
    const {
        createNode
    } = boundActionCreators;

    // Strip trailing slashes
    const formattedUrl = url.replace(/\/$/, '') + `/api/${apiVersion}/`;

    let currentTables = await fetchData({
        url: formattedUrl,
        accessToken
    });

    transformer({
        url,
        accessToken,
        program,
        currentTables,
        createNode
    });

    return;
}

export { sourceNodes }
