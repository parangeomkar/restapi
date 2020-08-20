const model = require('../model.js');
const gcsApi = require('../../helpers/google-cloud-storage');
const db = require('../db');
const { v4: uuidv4 } = require('uuid');


// get question model
const Question = model.Question;

//  cycle through buckets with count
let count = 0;

// gcs buckets
const buckets = [
    ["assets-8c595.appspot.com", "storage_a", "http://actugpeqip.cloudimg.io/v7/_static1_/"],
    ["staging.assets-8c595.appspot.com", "storage_a", "http://actugpeqip.cloudimg.io/v7/_static2_/"],
    ["fourth-tiger-286019.appspot.com", "storage_b", "http://ahubrfchio.cloudimg.io/v7/_static3_/"],
    ["staging.fourth-tiger-286019.appspot.com", "storage_b", "http://ahubrfchio.cloudimg.io/v7/_static4_/"],
]




/* get question start */

function getQuestion(data){
    return db.getData(data, Question)
    .then(res => res)
    .catch(err => err);
}

/* get question end */





/* get question start */

function deleteQuestion(data){
    return db.deleteData(data, Question)
    .then(res => res)
    .catch(err => err);
}

/* get question end */






/* Create Question Start */
function createQuestion(data) {
    // number of uploaded files
    let fileCount = 0;

    // set question id
    data._q_id = uuidv4();

    return new Promise((resolve, reject) => {
        // check if files are present
        if (data.fileList !== undefined && typeof data.fileList == "object" && data.fileList.length > 0) {
            let copyData = { ...data };

            copyData = JSON.stringify(deleteImageFromReq(copyData));

            // check if files to upload is greater than 5
            if (data.fileList.length > 5) {
                reject(new Error("You are not allowed to do that!"));
            }

            // iterate file list to check for request tamper
            data.fileList.forEach((key) => {
                // reject if custom key is injected
                if (key !== "_q_image" && key !== "_op_1_image" && key !== "_op_2_image" && key !== "_op_3_image" && key !== "_op_4_image") {
                    reject(new Error("File data tampered!"));
                    delete data.fileList;
                }

                // reject if key is present without file
                if (!data[key] || data[key] == "" || data[key] == null || data[key] == undefined) {
                    reject(new Error("File count is not equal to files!"));
                    delete data.fileList;
                }

                // reject if image url placeholder is missing
                if (copyData.indexOf("$$" + key + "$$") == -1) {
                    reject(new Error("File names tampered!"));
                    delete data.fileList;
                }
            });

            // check if still files are present
            if (data.fileList != undefined) {
                const fileName = data._q_id;
                let fileArray = {};

                // iterate file list and upload to GCP
                data.fileList.forEach(async (key) => {

                    count++;
                    if (count > (buckets.length - 1)) count = 0;

                    // store current count to be used inside then()
                    fileArray[key] = count;

                    await gcsApi.uploadToGCS(data[key], fileName + key + ".jpg", buckets[count][0], buckets[count][1])
                        .then(res => {
                            const c = fileArray[key];

                            // replace image placeholder with url
                            data = JSON.stringify(data);
                            data = JSON.parse(data.replace('$$' + key + '$$', buckets[c][2] + fileName + key + ".jpg"));
                            fileCount++;

                            // check if all images have been uploaded
                            if (fileCount == data.fileList.length) {
                                // save to db after uploading all files
                                console.log("Saving question with file");
                                saveQuestion(data)
                                    .then(res => resolve(res))
                                    .catch(err => reject(err));
                            }
                        })
                        .catch(err => {
                            console.log(err);
                            reject(err);
                        });
                });
            } else {
                // reject if request is tampered
                reject("File count is not equal to files. Could not save!");
            }
        } else {
            // save to db if there are no files
            console.log("Saving question without file");
            saveQuestion(data)
                .then(res => resolve(res))
                .catch(err => reject(err));
        }
    });
}


// save question in database
function saveQuestion(data) {
    // sanitize unwanted data
    data = sanitizeData(data);

    return db.saveData(data, Question)
        .then(res => res)
        .catch(err => err);
}

// remove any unwanted data to store in DB
function sanitizeData(data) {

    // allowed keys
    let validKeys = ['_q_id', '_q_type', '_p_marks', '_n_marks', '_q', '_op_1', '_op_2', '_op_3', '_op_4', '_p_tol', '_n_tol', '_num_ans', '_q_ans'];

    // remove files and file list form question data
    data = deleteImageFromReq(data);

    //check for base64 injection
    Object.keys(data).forEach((key) => {
        // validate keys against allowed keys
        if (data[key] == null || data[key] === "" || validKeys.indexOf(key) == -1) {
            delete data[key];
            return;
        }

        // remove tampered image data if set base64
        if (data[key] && data[key].ops) {
            data[key].ops.forEach((item, index) => {
                if ((item.insert !== undefined && item.insert.image !== undefined) && (typeof item.insert.image == "string" && item.insert.image.indexOf(';base64,') > -1 || item.insert.image.length > 300)) {
                    delete data[key].ops[index].insert;
                }
            });
        }
    });
    return data;
}

function deleteImageFromReq(data) {
    delete data.fileList;
    delete data._q_image;
    delete data._op_1_image;
    delete data._op_2_image;
    delete data._op_3_image;
    delete data._op_4_image;
    return data;
}

/* Create Question End */

module.exports.createQuestion = createQuestion;
module.exports.getQuestion = getQuestion;
module.exports.deleteQuestion = deleteQuestion;