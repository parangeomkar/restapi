const questionModule = require("./modules/questionModule");

async function addQuestion(data) {
	return await questionModule.createQuestion(data).then(res => res).catch(err => err);
}

async function getQuestion(data) {
	return await questionModule.getQuestion(data).then(res => {
		delete res._id;
		delete res._v;
		delete res._last_accessed;
		return res
	}).catch(err => err);
}

module.exports.addQuestion = addQuestion;
module.exports.getQuestion = getQuestion;