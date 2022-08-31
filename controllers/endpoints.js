//----Modules and configuration----//
const oauth = require('./oauth-controller');
const hubspot = require('../model/hubspot');

//Endpoints

const getAccountsUsers = async (req, res) => {
    const { portalId } = req.body;
    try {
        const usersInfo = await hubspot.infoUsers(portalId);
        res.json(usersInfo);
    } catch (e) {
        e.message === 'HTTP request failed'
            ? console.error(JSON.stringify(e.response, null, 2))
            : console.error(e)
        }
    }
    
const authorizedAccount = async (req, res) => {
    const portalId = req.params.portalID;

    try {
        const authorized = await oauth.isAuthorized(portalId);
        //console.log(authorized)
        res.status(200).send(authorized);
    } catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
}

module.exports = {
    getAccountsUsers,
    authorizedAccount
}