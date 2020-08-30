const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const fs = require('fs');

let key = 'MySuperSecretKey';
key = crypto.createHash('sha256').update(String(key)).digest('base64').substr(0, 32);

const decrypt = (encrypted) => {
    const iv = encrypted.slice(0, 16);
    encrypted = encrypted.slice(16);
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    const result = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return result;
};

try {
    console.log("Decrypting files...");
    const data = [
        [fs.readFileSync(__dirname + '/encrypted_asset1.json'), __dirname + '/decrypted_asset1.json'],
        [fs.readFileSync(__dirname + '/encrypted_asset2.json'), __dirname + '/decrypted_asset2.json']
    ]
    module.exports = () => {
        data.map(item => {
            let decrypted = decrypt(Buffer.from(item[0].toString(), 'base64'));
            fs.writeFile(item[1], decrypted.toString(), function (err) {
                if (err) throw err;
                console.log('Saved!');
            });
        })
    }
} catch (error) {
    console.trace(error);
}


