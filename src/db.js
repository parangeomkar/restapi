const mongoose = require('mongoose');
const uri = 'mongodb+srv://ctadmin:K9kbnqDfHyBB4aln@clevertest.xd7d6.gcp.mongodb.net/ctexamdb?retryWrites=true&w=majority';
const model = require('./model.js');


// connect to DB
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB Connected...');
}).catch(err => console.log(err));


async function getUserDetails(query) {
    var data = {};
    await model.userTable.find({
        ...query
    }, function (err, res) {
        res[0] ? data = res[0].toJSON() : data = { error: "No data found!", status: 200 };
    })
        .catch(error => {
            data = error;
        });
    return data;
}


// exports
module.exports.getUserDetails = getUserDetails;