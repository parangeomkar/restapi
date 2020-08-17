const mongoose = require('mongoose');
const uri = 'mongodb+srv://ctadmin:K9kbnqDfHyBB4aln@clevertest.xd7d6.gcp.mongodb.net/ctexamdb?retryWrites=true&w=majority';
const model = require('./model.js');
const Question = model.Question;
const gcsApi = require('../helpers/google-cloud-storage');

// mongoose.connect(uri, {
// 	useNewUrlParser: true,
// 	useUnifiedTopology: true
// }).then(() => {
// 	console.log('MongoDB Connected...');
// }).catch(err => console.log(err));

let count = 0;

const buckets = [
	["assets-8c595.appspot.com", "storage_a", "_asset1_"],
	// ["staging.assets-8c595.appspot.com", "storage_a","_asset2_"],
	// ["fourth-tiger-286019.appspot.com", "storage_b","_asset3_"],
	// ["staging.fourth-tiger-286019.appspot.com", "storage_b","_asset4_"]
]

async function createQuestion(data) {
	let fileCount = 0;
	return new Promise((resolve, reject) => {
		data.fileList.forEach(async (key) => {
			fileName = Buffer.from(new Date().toISOString()).toString('base64') + "user" + key + ".jpg";
			await gcsApi.uploadToGCS(data[key], fileName, buckets[count][0], buckets[count][1])
				.then(res => {
					console.log("uploaded");
					fileCount++;
				})
				.catch(err => {
					console.log(err);
					reject(err)
				});
			count++;
			if (count > (buckets.length - 1)) count = 0;

			if (fileCount == buckets.length) {
				// const question = new Question({
				// 	_id: new mongoose.Types.ObjectId(),
				// 	_date_created: Date.now(),
				// 	_last_accessed: Date.now()
				// });

				// question.save();
			}
		});
		if (count > (buckets.length - 1)) count = 0;
	});
}


process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

function cleanup() {
	mongoose.connection.close(function () {
		console.log('Mongoose disconnected on app termination');
		process.exit(0);
	});
};

module.exports.createQuestion = createQuestion;