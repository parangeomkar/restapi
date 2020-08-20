const mongoose = require('mongoose');

var user_schema = new mongoose.Schema({
    _user_id: String,
    _user_pass: String,
    _date_created: Number,
    _is_deleted: Boolean,
    _last_login: Boolean
}, {
    collection: "clevertest_user"
});

var question_schema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    _q_id: String,
    _q_type: { type: String, required: true },
    _p_marks: { type: Number, required: true },
    _n_marks: { type: Number, required: true },
    _q: { type: Object, required: true },
    _op_1: Object,
    _op_2: Object,
    _op_3: Object,
    _op_4: Object,
    _p_tol: Number,
    _n_tol: Number,
    _has_file: Boolean,
    _num_ans: Number,
    _q_ans: Array,
    _date_created: Number,
    _last_accessed: Number
}, {
    collection: "clevertest_question"
});

// create collection models
module.exports.User = mongoose.model('user', user_schema);
module.exports.Question = mongoose.model('question', question_schema);