const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

const ObjectId = mongodb.ObjectId;

class User {
    constructor(name, email, cart, id) {
        this.name = name;
        this.email = email;
        this.cart = cart; // { items: [] }
        this._id = id;
    }

    save() {
        return getDb().collection('users').insertOne(this);
    }

    async getCart() {
        const itemIds = this.cart.items.map((i) => i.productId);
        try {
            const products = await getDb()
                .collection('products')
                .find({ _id: { $in: itemIds } })
                .toArray();

            if (products.length !== itemIds.length) {
                await getDb()
                    .collection('users')
                    .updateOne(
                        { _id: new ObjectId(this._id) },
                        {
                            $set: {
                                cart: {
                                    items: products.map((p) => {
                                        return {
                                            productId: p._id,
                                            quantity: this.cart.items.find(
                                                (i) => i.productId.toString() === p._id.toString()
                                            ).quantity,
                                        };
                                    }),
                                },
                            },
                        }
                    );
            }

            return products.map((p) => {
                return {
                    ...p,
                    quantity: this.cart.items.find(
                        (i) => i.productId.toString() === p._id.toString()
                    ).quantity,
                };
            });
        } catch (err) {
            console.log(err);
        }
    }

    addToCart(product) {
        const cartItems = [...this.cart.items];
        const index = this.cart.items.findIndex(
            (cp) => cp.productId.toString() === product._id.toString()
        );

        index >= 0
            ? (cartItems[index].quantity = this.cart.items[index].quantity + 1)
            : cartItems.push({ productId: new ObjectId(product._id), quantity: 1 });

        return getDb()
            .collection('users')
            .updateOne({ _id: new ObjectId(this._id) }, { $set: { cart: { items: cartItems } } });
    }

    deleteItemFromCart(id) {
        const cartItems = [...this.cart.items].filter(
            (i) => i.productId.toString() !== id.toString()
        );
        return getDb()
            .collection('users')
            .updateOne({ _id: new ObjectId(this._id) }, { $set: { cart: { items: cartItems } } });
    }

    async addOrder() {
        try {
            const order = {
                items: await this.getCart(),
                user: {
                    _id: new ObjectId(this._id),
                    name: this.name,
                },
            };
            await getDb().collection('orders').insertOne(order);
            return getDb()
                .collection('users')
                .updateOne({ _id: new ObjectId(this._id) }, { $set: { cart: { items: [] } } });
        } catch (err) {
            console.log(err);
        }
    }

    getOrders() {
        return getDb()
            .collection('orders')
            .find({ 'user._id': new ObjectId(this._id) })
            .toArray();
    }

    static findById(id) {
        return getDb()
            .collection('users')
            .findOne({ _id: new ObjectId(id) });
    }
}

module.exports = User;
