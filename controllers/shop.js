const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = async (req, res, next) => {
    try {
        const products = await Product.find();
        res.render('shop/product-list', {
            prods: products,
            pageTitle: 'All Products',
            path: '/products',
            isAuthenticated: req.session.isLoggedIn,
        });
    } catch (err) {
        console.log(err);
    }
};

exports.getProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.productId);
        res.render('shop/product-detail', {
            product: product,
            pageTitle: product.title,
            path: '/products',
            isAuthenticated: req.session.isLoggedIn,
        });
    } catch (err) {
        console.log(err);
    }
};

exports.getIndex = async (req, res, next) => {
    try {
        const products = await Product.find();
        res.render('shop/index', {
            prods: products,
            pageTitle: 'Shop',
            path: '/',
            isAuthenticated: req.session.isLoggedIn,
        });
    } catch (err) {
        console.log(err);
    }
};

exports.getCart = async (req, res, next) => {
    try {
        const user = await req.user.populate('cart.items.productId').execPopulate(); // execPopulate so that it returns a promise
        res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Your Cart',
            products: user.cart.items,
            isAuthenticated: req.session.isLoggedIn,
        });
    } catch (err) {
        console.log(err);
    }
};

exports.postCart = async (req, res, next) => {
    try {
        const product = await Product.findById(req.body.productId);
        await req.user.addToCart(product);
        res.redirect('/cart');
    } catch (err) {
        console.log(err);
    }
};

exports.postCartDeleteProduct = async (req, res, next) => {
    try {
        await req.user.removeFromCart(req.body.productId);
        res.redirect('/cart');
    } catch (err) {
        console.log(err);
    }
};

exports.getOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ 'user.userId': req.user._id });
        res.render('shop/orders', {
            path: '/orders',
            pageTitle: 'Your Orders',
            orders: orders,
            isAuthenticated: req.session.isLoggedIn,
        });
    } catch (err) {
        console.log(err);
    }
};

exports.postOrder = async (req, res, next) => {
    try {
        const user = await req.user.populate('cart.items.productId').execPopulate();
        const products = user.cart.items.map((i) => {
            return { product: { ...i.productId._doc }, quantity: i.quantity }; // spread operator and _doc to make sure we get the full info
        });
        const order = new Order({
            user: {
                name: user.name,
                userId: user,
            },
            products: products,
        });
        await order.save();
        await user.clearCart();
        return res.redirect('/orders');
    } catch (err) {
        console.log(err);
    }
};
