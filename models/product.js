const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class Product {
    constructor(title, price, imageUrl, description, id) {
        this.title = title;
        this.price = price;
        this.imageUrl = imageUrl;
        this.description = description;
        this._id = id ? new mongodb.ObjectID(id) : null;
    }

    async save() {
        try {
            return this._id
                ? await getDb()
                      .collection('products')
                      .updateOne({ _id: new mongodb.ObjectID(this._id) }, { $set: this }) // this is an object
                : await getDb().collection('products').insertOne(this);
        } catch {
            console.log(err);
        }
    }

    static async fetchAll() {
        try {
            return await getDb().collection('products').find().toArray(); // find returns a cursor (an object to loop through collection step by step), not a promise
        } catch (err) {
            console.log(err);
        }
    }

    static async findById(id) {
        try {
            return await getDb()
                .collection('products')
                .find({ _id: new mongodb.ObjectID(id) })
                .next();
        } catch (err) {
            console.log(err);
        }
    }

    static async deleteById(id) {
        try {
            return await getDb()
                .collection('products')
                .deleteOne({ _id: new mongodb.ObjectID(id) });
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = Product;
