const { Storage } = require('@google-cloud/storage');
var stream = require('stream');

const storage_a = new Storage({
    projectId: "assets-8c595",
    keyFilename: __dirname + "/assets-8c595-ff1b9c7a1af9.json"
})

const storage_b = new Storage({
    projectId: "fourth-tiger-286019",
    keyFilename: __dirname + "/fourth-tiger-286019-844feb8bf0db.json"
})


const uploadToGCS = (fileData, fileName, bucketName, storageName) => {
    return new Promise((resolve, reject) => {
        let bucket = {};
        switch (storageName) {
            case "storage_a":
                bucket = storage_a.bucket(bucketName);
                break;
            case "storage_b":
                bucket = storage_b.bucket(bucketName);
                break;
            default:
                reject("Storage not defined!")
                break;
        }
        const file = bucket.file(fileName);

        var bufferStream = new stream.PassThrough();
        bufferStream.end(Buffer.from(fileData, "base64"));
        bufferStream.pipe(file.createWriteStream({
            metadata: {
                contentType: 'image/jpeg'
            },
            public: true
        }))
            .on('error', function (err) {
                console.error(err);
                reject(err);
            })
            .on('finish', function () {
                resolve(fileName);
            });
    });
};

module.exports.uploadToGCS = uploadToGCS;