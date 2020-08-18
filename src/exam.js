const questionModule = require("./modules/questionModule");

async function addQuestion(data) {
	return await questionModule.createQuestion(data).then(res => res).catch(err => err);
}

async function getQuestion(data) {
	return await questionModule.getQuestion(data).then(res => res).catch(err => err);
}


async function getAllQuestion(data) {
	return await questionModule.getAllQuestion(data).then(res => res).catch(err => err);
}

module.exports.addQuestion = addQuestion;