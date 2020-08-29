const questionModule = require("./modules/questionModule");

async function addQuestion(data) {
	return await questionModule.createQuestion(data).then(res => res).catch(err => err);
}


async function patchQuestion(data) {
	return await questionModule.patchQuestion(data).then(res => res).catch(err => err);
}


async function getQuestion(data) {
	console.trace(data)
	return await questionModule.getQuestion(data).then(res => res).catch(err => err);
}


async function deleteQuestion(data) {
	return await questionModule.deleteQuestion(data).then(res => res).catch(err => err);
}

module.exports.addQuestion = addQuestion;
module.exports.getQuestion = getQuestion;
module.exports.deleteQuestion = deleteQuestion;
module.exports.patchQuestion = patchQuestion;