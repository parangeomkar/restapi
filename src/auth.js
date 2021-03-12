const model = require('./model.js');
const db = require('./db');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

// get question model
const User = model.User;

function loginUser(data) {
	return new Promise((resolve, reject) => {
		db.getData({ _user_email: data.email }, User)
			.then(res => {
				if (res.data) {
					const accessToken = jwt.sign({ uid: res.data[0]._user_id }, "tsetrevelc-twj-terces", { expiresIn: "1h" }),
						localToken = jwt.sign({ uid: res.data[0]._user_id }, "tsetrevelc-twj-lacol", { expiresIn: "1h" }),
						refreshToken = jwt.sign({ uid: res.data[0]._user_id }, "tsetrevelc-twj", { expiresIn: "10d" });

					resolve({ accessToken, refreshToken, localToken, authSuccess: true, user: res.data[0]._user_email });
				} else {
					resolve({ authFailed: true });
				}
			})
			.catch(err => reject(err));
	});
}

function createUser(data) {
	return new Promise((resolve, reject) => {
		db.getData({ _user_email: data.email }, User)
			.then(res => {
				if (res.data) {
					resolve({ userExists: true });
				} else {
					const user = {
						_user_id: uuidv4(),
						_user_email: data.email,
						_user_pass: data.pass
					}
					saveUser(user)
						.then(res => resolve({ success: true }))
						.catch(err => reject(err))
				}
			})
			.catch(err => reject(err));
	});
}

function saveUser(data) {
	return db.saveData(data, User)
		.then(res => res)
		.catch(err => err);
}

function refreshToken(data) {
	return new Promise((resolve, reject) => {
		try {
			const decoded = jwt.verify(data.refreshToken, "tsetrevelc-twj", null),
				accessToken = jwt.sign({ uid: decoded.uid }, "tsetrevelc-twj-terces", { expiresIn: "1h" }),
				localToken = jwt.sign({ uid: decoded.uid }, "tsetrevelc-twj-lacol", { expiresIn: "1h" }),
				refreshToken = data.refreshToken;
			resolve({ accessToken, refreshToken, localToken });
		} catch (error) {
			console.trace(error)
			reject({ message: "token expired", loginRequired: true });
		}
	});
}


module.exports.createUser = createUser;
module.exports.loginUser = loginUser;
module.exports.refreshToken = refreshToken;