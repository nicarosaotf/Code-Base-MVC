require('dotenv').config();
const { Pool } = require('pg');
const encryption = require('./encryption');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const insertOAuth = async (portalID, access_token, refresh_token) => {
    try {
        const client = await pool.connect();
        const timeStamp = Date.now();
        const encryptedToken = encryption.encrypt(access_token);
        const encryptedRefreshToken = encryption.encrypt(refresh_token);
        const insertToken = await client.query(`Insert into authorized_accounts values(${portalID}, '${encryptedToken}', '${encryptedRefreshToken}', '${timeStamp}')`);
        console.log('insertToken', insertToken);
        client.release();
    } catch (error) {
        console.error(error);
    }
}

const readOAuth = async (portalID) => {
    try {
        const client = await pool.connect();
        const data = await client.query(`Select * from authorized_accounts where account_id = ${portalID}`);
        client.release();
        if (data.rows[0]) {
            data.rows[0].access_token = await encryption.decrypt(data.rows[0].access_token);
            data.rows[0].refresh_token = await encryption.decrypt(data.rows[0].refresh_token);
        }
        return data.rows;
    } catch (error) {
        console.error(error);
    }
}

const updateOAuth = async (portalID, access_token, refresh_token) => {
    try {
        const client = await pool.connect();
        const timeStamp = Date.now();
        const encryptedToken = encryption.encrypt(access_token);
        const encryptedRefreshToken = encryption.encrypt(refresh_token);
        const updateToken = await client.query(`Update authorized_accounts SET access_token = '${encryptedToken}', refresh_token = '${encryptedRefreshToken}', time_token = '${timeStamp}' Where account_id = ${portalID}`);
        //console.log('updateToken', updateToken);
        client.release();
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    insertOAuth,
    readOAuth,
    updateOAuth
}