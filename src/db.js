const mongoose = require('mongoose');
const uri = 'mongodb+srv://ctadmin:K9kbnqDfHyBB4aln@clevertest.xd7d6.gcp.mongodb.net/ctexamdb?retryWrites=true&w=majority';


// connect to db
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.trace('MongoDB Connected...');
}).catch(err => console.trace(err));


function getData(query, model) {
    return new Promise(async (resolve, reject) => {
        await model.find({ ...query }, (err, res) => {
            if (res && res[0]) {
                resolve({ data: res, success: true, error: err });
            } else {
                resolve({ message: "No data found!", success: true, error: err });
            }
        })
            .catch(error => {
                reject(new Error({ message: "Error Occuered!", error }));
            });
    });
}



function deleteData(query, model) {
    return new Promise(async (resolve, reject) => {
        if (!query._q_id) {
            reject(new Error("Methodd not allowed!"));
        }

        await model.deleteOne({ _q_id: query._q_id }, (err, res) => {
            if (res.deletedCount > 0) {
                resolve({ message: "Successfuly deleted one record!", success: true, error: err });
            } else {
                resolve({ message: "No record to delete!", success: false, error: new Error("record not found") });
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
            _date_created: Date.now()
        });

        try {
            const result = await instance.save();
            resolve(result);
        } catch (err) {
            console.trace(err);
            reject(err);
        }
    });
}

function updateData(data, model) {
    return new Promise(async (resolve, reject) => {
        data._last_accessed = Date.now();
        delete data._id;

        model.findOneAndUpdate({ _q_id: data._q_id }, data, { useFindAndModify: false, upsert: true }, function (err, res) {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
}

// close mongodb connection
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);


function cleanup() {
    mongoose.connection.close(function () {
        console.trace('Mongoose disconnected on app termination');
        process.exit(0);
    });
};

// exports
module.exports.getData = getData;
module.exports.saveData = saveData;
module.exports.deleteData = deleteData;
module.exports.updateData = updateData;