const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = async (req, res, next) => {
    try {
        const products = await Product.findAll();
        res.render('shop/product-list', {
            prods: products,
            pageTitle: 'All Products',
            path: '/products',
        });
    } catch (err) {
        console.log(err);
    }
};

exports.getProduct = async (req, res, next) => {
    try {
        // const product = await Product.findAll({ where: { id: req.params.productId } }); // product would be an array now
        const product = await Product.findByPk(req.params.productId);
        res.render('shop/product-detail', {
            product: product,
            pageTitle: product.title,
            path: '/products',
        });
    } catch (err) {
        console.log(err);
    }
};

exports.getIndex = async (req, res, next) => {
    try {
        const products = await Product.findAll();
        res.render('shop/index', {
            prods: products,
            pageTitle: 'Shop',
            path: '/',
        });
    } catch (err) {
        console.log(err);
    }
};

exports.getCart = async (req, res, next) => {
    try {
        const cart = await req.user.getCart();
        const products = await cart.getProducts();
        res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Your Cart',
            products: products,
        });
    } catch (err) {
        console.log(err);
    }
};

exports.postCart = async (req, res, next) => {
    const prodId = req.body.productId;
    try {
        const cart = await req.user.getCart();
        const products = await cart.getProducts({ where: { id: prodId } });
        let product = products.length > 0 ? products[0] : undefined;
        let newQuantity = 1;
        if (product) {
            // ...
        }
        product = await Product.findByPk(prodId);
        await cart.addProduct(product, { through: { quantity: newQuantity } });
        res.redirect('/cart');
    } catch (err) {
        console.log(err);
    }
};

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId, (product) => {
        Cart.deleteProduct(prodId, product.price);
        res.redirect('/cart');
    });
};

exports.getOrders = (req, res, next) => {
    res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
    });
};

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        path: 'checkout',
        pageTitle: 'Checkout',
    });
};
