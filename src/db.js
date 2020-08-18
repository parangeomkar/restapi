const mongoose = require('mongoose');
const uri = 'mongodb+srv://ctadmin:K9kbnqDfHyBB4aln@clevertest.xd7d6.gcp.mongodb.net/ctexamdb?retryWrites=true&w=majority';


// connect to db
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB Connected...');
}).catch(err => console.log(err));


function getData(query, model) {
    return new Promise(async (resolve, reject) => {
        await model.find({ ...query }, (err, res) => {
            if (res[0]) {
                resolve({ data: res[0].toJSON(), success: true, error: err });
            } else {
                resolve({ message: "No data found!", data: {}, success: false, error: err });
            }
        })
            .catch(error => {
                reject(new Error({ message: "Error Occuered!", error }));
            });
    });
}


function saveData(data, model) {
    return new Promise(async (resolve, reject) => {
        const instance = new model({
            _id: new mongoose.Types.ObjectId(),
            ...data,
            _date_created: Date.now(),
            _last_accessed: Date.now()
        });

        try {
            const result = await instance.save();
            resolve(result);
        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
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

// exports
module.exports.getData = getData;
module.exports.saveData = saveData;