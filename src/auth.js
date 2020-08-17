const mongoose = require('mongoose');
const uri = 'mongodb+srv://ctadmin:K9kbnqDfHyBB4aln@clevertest.xd7d6.gcp.mongodb.net/ctexamdb?retryWrites=true&w=majority';
const model = require('./model.js');


async function loginUser(body) {
	var data = {};

	await model.User.find({
		_user_id: body.email,
		_user_pass: body.pass
	}, function (err, res) {
		if (res[0]) {
			data: res[0]._user_id
		} else {
			throw ({ error: "Invalid Credentials!", status: 200 });
		}
	}).catch(err => {
		throw (err)
	});
}

async function createUser(body) {
	var data = {};
	var alreadyExists = false;
	const User = new model.User({
		_user_id: body.email,
		_user_pass: body.pass,
		_date_created: Date.now()
	});

	await model.User.find({
		_user_id: body.email
	}, function (err, res) {
		if (res[0]) alreadyExists = true;
	}).catch(err => {
		throw (err)
	});

	if (!alreadyExists) {
		data = await User.save()
			.then(res => res._user_id)
			.catch(err => {
				throw (err)
			});
	} else {
		throw ({ error: "User Already Exists!", status: 200 });
	}
	return data;
}

module.exports.createUser = createUser;