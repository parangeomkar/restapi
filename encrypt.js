const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
let key = 'MySuperSecretKey';
var fs = require('fs');

key = crypto.createHash('sha256').update(String(key)).digest('base64').substr(0, 32);

const encrypt = (buffer) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const result = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);
    return result;
};

try {
    const data = [
        [fs.readFileSync('./asset1.json'), 'encrypted_asset1.json'],
        [fs.readFileSync('./asset2.json'), 'encrypted_asset2.json']
    ]
	data.map(item => {
		const encrypted = encrypt(item[0]);
		fs.writeFile(item[1], encrypted.toString('base64'), function (err) {
		  if (err) throw err;
		  console.log('Saved!');
		});
	})
} catch (error) {
    console.trace(error);
}


