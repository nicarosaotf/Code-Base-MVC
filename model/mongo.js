require('dotenv').config();
const mongoose = require('mongoose');
const encryption = require('./encryption');

const authSchema = new mongoose.schema.Schema({
    portalID: String,
    encryptedToken: String,
    encryptedRefreshToken: String,
    timeStamp: Number
});

const AuthDocument = mongoose.model('AuthDocument', authSchema);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL);

        console.log('MongoDB connected!!');
    } catch (err) {
        console.log('Failed to connect to MongoDB', err);
    }
};

const insertOAuth = async (portalID, access_token, refresh_token) => {
    try {
        connectDB();

        const timeStamp = Date.now();
        const encryptedToken = encryption.encrypt(access_token);
        const encryptedRefreshToken = encryption.encrypt(refresh_token);
        const authCode = new AuthDocument({portalID: portalID, encryptedToken: encryptedToken, encryptedRefreshToken: encryptedRefreshToken , timeStamp: timeStamp});
        const insertToken = await authCode.save();
        console.log('insertToken', insertToken);

    } catch (error) {
        console.error(error);
    }
}

const readOAuth = async (portalID) => {
    try {
        connectDB();
        const data = await authSchema.findOne({portalID: portalID});

        if (data) {
            data.access_token = await encryption.decrypt(data.access_token);
            data.refresh_token = await encryption.decrypt(data.refresh_token);
        }
        return data;
    } catch (error) {
        console.error(error);
    }
}

const updateOAuth = async (portalID, access_token, refresh_token) => {
    try {
        connectDB();
        const timeStamp = Date.now();
        const encryptedToken = encryption.encrypt(access_token);
        const encryptedRefreshToken = encryption.encrypt(refresh_token);
        const update = {encryptedToken: encryptedToken, encryptedRefreshToken: encryptedRefreshToken , timeStamp: timeStamp};
        const updateToken = await AuthDocument.findOneAndUpdate(portalID, update);
        //console.log('updateToken', updateToken);
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    insertOAuth,
    readOAuth,
    updateOAuth
}