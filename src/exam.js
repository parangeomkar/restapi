const mongoose = require('mongoose');
const uri = 'mongodb+srv://ctadmin:K9kbnqDfHyBB4aln@clevertest.xd7d6.gcp.mongodb.net/ctexamdb?retryWrites=true&w=majority';
const model = require('./model.js');
const Question = model.Question;
const gcsApi = require('../helpers/google-cloud-storage');
const { v4: uuidv4 } = require('uuid');

mongoose.connect(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true
}).then(() => {
	console.log('MongoDB Connected...');
}).catch(err => console.log(err));

let count = 0;

const buckets = [
	["assets-8c595.appspot.com", "storage_a", "http://actugpeqip.cloudimg.io/v7/_static1_/"],
	["staging.assets-8c595.appspot.com", "storage_a", "http://actugpeqip.cloudimg.io/v7/_static2_/"],
	["fourth-tiger-286019.appspot.com", "storage_b", "http://ahubrfchio.cloudimg.io/v7/_static3_/"],
	["staging.fourth-tiger-286019.appspot.com", "storage_b", "http://ahubrfchio.cloudimg.io/v7/_static4_/"],
]

async function createQuestion(data) {
	let fileCount = 0;

	// set question id
	data._q_id = uuidv4();

	return new Promise((resolve, reject) => {
		if (data.fileList.length > 0) {
			let copyData = { ...data };
			copyData = JSON.stringify(deleteImageFromReq(copyData));

			if (data.fileList.length > 5) {
				reject(new Error("You are not allowed to do that!"));
			}

			data.fileList.forEach(async (key) => {
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

			if (data.fileList) {
				const fileName = data._q_id;
				let fileArray = {};

				data.fileList.forEach(async (key) => {
					count++;
					if (count > (buckets.length - 1)) count = 0;

					fileArray[key] = count;

					await gcsApi.uploadToGCS(data[key], fileName + key + ".jpg", buckets[count][0], buckets[count][1])
						.then(res => {
							delete data[key];

							const c = fileArray[key];

							// replace image placeholder with url
							data = JSON.stringify(data);
							data = JSON.parse(data.replace('$$' + key + '$$', buckets[c][2] + fileName + key + ".jpg"));
							fileCount++;

							// check if all images have been uploaded
							if (fileCount == data.fileList.length) {
								// save to db
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

			// save to db
			console.log("Saving question without file");
			saveQuestion(data)
				.then(res => resolve(res))
				.catch(err => reject(err));
		}
	});
}

function saveQuestion(data) {
	const dat = validateQuestion(data);

	return new Promise(async (resolve, reject) => {
		const question = new Question({
			_id: new mongoose.Types.ObjectId(),
			...dat,
			_date_created: Date.now(),
			_last_accessed: Date.now()
		});

		try {
			const result = await question.save();
			resolve(result);
		} catch (err) {
			console.log(err);
			reject(err.message);
		}
	});
}

function validateQuestion(data) {
	let validKeys = ['_q_id', '_q_type', '_p_marks', '_n_marks', '_q', '_op_1', '_op_2', '_op_3', '_op_4', '_p_tol', '_n_tol', '_num_ans', '_q_ans'];

	data = deleteImageFromReq(data);

	//check for base64 injection
	Object.keys(data).forEach((key) => {
		if (data[key] == null || data[key] === "" || validKeys.indexOf(key) == -1) {
			delete data[key];
			return;
		}

		if (data[key] && data[key].ops) {
			data[key].ops.forEach((item, index) => {
				if (item.insert && item.insert.image && typeof item.insert.image == "string" && item.insert.image.indexOf(';base64,') > -1) {
					delete data[key].ops[index].insert.image;
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

// close mongodb connection
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

function cleanup() {
	mongoose.connection.close(function () {
		console.log('Mongoose disconnected on app termination');
		process.exit(0);
	});
};

module.exports.createQuestion = createQuestion;