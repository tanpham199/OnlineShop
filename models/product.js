const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class Product {
    constructor(title, price, imageUrl, description) {
        this.title = title;
        this.price = price;
        this.imageUrl = imageUrl;
        this.description = description;
    }

    async save() {
        try {
            return await getDb().collection('products').insertOne(this);
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

    static async findById(prodId) {
        try {
            return await getDb()
                .collection('products')
                .find({ _id: new mongodb.ObjectID(prodId) })
                .next();
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = Product;
