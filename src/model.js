const mongoose = require('mongoose');

var user_schema = new mongoose.Schema({
    _user_id: String,
    _user_pass: String,
    _date_created: Number,
    _is_deleted: Boolean,
    _last_login: Boolean
}, {
    collection: "clevertest_users"
});

var question_schema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    _q_type: String,
    _p_marks: Number,
    _n_marks: Number,
    _q: Object,
    _op_1: Object,
    _op_2: Object,
    _op_3: Object,
    _op_4: Object,
    _p_tol: Number,
    _n_tol: Number,
    _num_ans: String,
    _q_ans: Object,
    _date_created: Number,
    _last_accessed: Number
}, {
    collection: "clevertest_questions"
});

// create collection models
module.exports.User = mongoose.model('user', user_schema);
module.exports.Question = mongoose.model('question', question_schema);