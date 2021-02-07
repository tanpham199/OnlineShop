const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

const ObjectId = mongodb.ObjectId;

class Product {
    constructor(title, price, imageUrl, description, id, userId) {
        this.title = title;
        this.price = price;
        this.imageUrl = imageUrl;
        this.description = description;
        this._id = id ? new ObjectId(id) : null;
        this.userId = userId;
    }

    save() {
        return this._id
            ? getDb()
                  .collection('products')
                  .updateOne({ _id: new ObjectId(this._id) }, { $set: this }) // this is an object
            : getDb().collection('products').insertOne(this);
    }

    static fetchAll() {
        return getDb().collection('products').find().toArray(); // find returns a cursor (an object to loop through collection step by step), not a promise
    }

    static findById(id) {
        return getDb()
            .collection('products')
            .findOne({ _id: new ObjectId(id) });
        // .find({ _id: new mongodb.ObjectID(id) })
        // .next(); // only care about the first (which is also only) element that matches
    }

    static deleteById(id) {
        return getDb()
            .collection('products')
            .deleteOne({ _id: new ObjectId(id) });
    }
}

module.exports = Product;
