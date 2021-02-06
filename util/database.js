const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = async (callback) => {
    try {
        const client = await MongoClient.connect(
            'mongodb+srv://tan:a@cluster0.b8khd.mongodb.net/shop?retryWrites=true&w=majority',
            {
                useUnifiedTopology: true,
            }
        );
        _db = client.db();
        callback();
    } catch (err) {
        throw err;
    }
};

const getDb = () => {
    if (_db) return _db;
    throw 'No database found!';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
