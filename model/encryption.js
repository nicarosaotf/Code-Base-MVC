//----Modules and configuration----//
require('dotenv').config();
const crypto = require("crypto");

const algorithm = "aes-256-cbc"; //Using AES encryption
let key = crypto.createHash('sha256').update(String(process.env.EKEY)).digest('base64').substr(0, 32);
const iv = crypto.randomBytes(16);

const encrypt = (data) => {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(data);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return JSON.stringify({ iv: iv.toString("hex"), encryptedData: encrypted.toString("hex") });
};

const decrypt = (encrypted) => {
  const encryption = JSON.parse(encrypted);
  const iv = Buffer.from(String(encryption.iv), "hex");
  const encryptedText = Buffer.from(String(encryption.encryptedData), "hex");
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

module.exports = {
  encrypt,
  decrypt
};