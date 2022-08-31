//----Modules and configuration----//
require('dotenv').config();
const request = require('request-promise-native');
const pool = require('./postgres')

const REDIRECT_URI = ``; //Here goes your redirect url

const refreshAccessToken = async (portalID) => {
    const data = await pool.readOAuth(portalID);
    const refreshTokenProof = {
        grant_type: 'refresh_token',
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        refresh_token: data[0].refresh_token
    };
    //console.log('refreshTokenProof', refreshTokenProof);
    return await exchangeForTokens(refreshTokenProof);
};

const getAccessToken = async (portalID) => {
    const data = await pool.readOAuth(portalID);
    const currentTime = Date.now();
    const timeDifference = currentTime - parseInt(data[0].time_token);
    //console.log('timeDifference', timeDifference);
    if (timeDifference > 1799999) {
        console.log('Refreshing expired access token');
        return await refreshAccessToken(portalID);
    }

    return { token: data[0].access_token, portalID };
};

const isAuthorized = async (portalID) => {
    const data = await pool.readOAuth(portalID);
    console.log(data.length);
    if (data.length > 0) {
        return data[0].refresh_token ? true : false;
    } else {
        return false;
    }

};

const infoUsers = async (portalId) => {
    const { token } = await getAccessToken(portalId);
    const users = await request.get('https://api.hubapi.com/crm/v3/owners/?limit=100', {
        'auth': {
            'bearer': token
        }
    });
    const info = JSON.parse(users);
    const accountsInfo = [];

    info.results.forEach(result => accountsInfo.push({
        'accountId': result.userId,
        'accountName': `${result.firstName} ${result.lastName}`,
    }));

    const response = {
        'actionType': 'ACCOUNTS_FETCH',
        'response': {
            'accounts': accountsInfo
        },
        'message': null
    }

    return response;
}

const exchangeForTokens = async (exchangeProof) => {
    try {
        //console.log('exchangeProof', exchangeProof);

        const responseBody = await request.post('https://api.hubapi.com/oauth/v1/token', {
            form: exchangeProof
        });

        const tokens = JSON.parse(responseBody);

        const accountDetails = await request.get('https://api.hubapi.com/account-info/v3/details', {
            'auth': {
                'bearer': tokens.access_token
            }
        });

        const portalID = JSON.parse(accountDetails).portalId;

        try {
            const data = await pool.readOAuth(portalID);
            if (data.length > 0) {
                console.log('Update');
                await pool.updateOAuth(portalID, tokens.access_token, tokens.refresh_token);
            } else {
                console.log('Insert');
                await pool.insertOAuth(portalID, tokens.access_token, tokens.refresh_token);
            }
            //console.log('       > Received an access token and refresh token');
            return { token: tokens.access_token, portalID };
        } catch (error) {
            console.error(error);
        }
    } catch (e) {
        console.error(`       > Error exchanging ${exchangeProof.grant_type} for access token`);
        return { token: JSON.parse(e.response.body), portalID: null };
    }
};

module.exports = {
    infoUsers,
    exchangeForTokens,
    isAuthorized,
    getAccessToken
}