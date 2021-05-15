const fs = require('fs');
const PDFDocument = require('pdfkit');
const path = require('path');
const Product = require('../models/product');
const Order = require('../models/order');

const ITEMS_PER_PAGE = 2;

exports.getProducts = async (req, res, next) => {
    try {
        const page = +req.query.page || 1;
        const totalItems = await Product.find().countDocuments();
        res.render('shop/product-list', {
            prods: await Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE),
            pageTitle: 'Products',
            path: '/products',
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            currentPage: page,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.productId);
        res.render('shop/product-detail', {
            product: product,
            pageTitle: product.title,
            path: '/products',
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getIndex = async (req, res, next) => {
    try {
        const page = +req.query.page || 1;
        const totalItems = await Product.find().countDocuments();
        res.render('shop/index', {
            prods: await Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE),
            pageTitle: 'Shop',
            path: '/',
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            currentPage: page,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getCart = async (req, res, next) => {
    try {
        const user = await req.user.populate('cart.items.productId').execPopulate(); // execPopulate so that it returns a promise
        res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Your Cart',
            products: user.cart.items,
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.postCart = async (req, res, next) => {
    try {
        const product = await Product.findById(req.body.productId);
        await req.user.addToCart(product);
        res.redirect('/cart');
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.postCartDeleteProduct = async (req, res, next) => {
    try {
        await req.user.removeFromCart(req.body.productId);
        res.redirect('/cart');
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ 'user.userId': req.user._id });
        res.render('shop/orders', {
            path: '/orders',
            pageTitle: 'Your Orders',
            orders: orders,
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
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
                email: user.email,
                userId: user,
            },
            products: products,
        });
        await order.save();
        await user.clearCart();
        return res.redirect('/orders');
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getInvoice = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order || order.user.userId.toString() !== req.user._id.toString()) {
            return next(new Error(!order ? 'No order found.' : 'Unauthorized.'));
        }
        const fileName = 'invoice-' + req.params.orderId + '.pdf';
        const filePath = path.join('data', 'invoices', fileName);

        const pdf = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=' + fileName);
        pdf.pipe(fs.createWriteStream(filePath));
        pdf.pipe(res);
        pdf.fontSize(26).text('Invoice', { underline: true });
        pdf.fontSize(14).text('--------------------');
        let totalPrice = 0;
        order.products.forEach((p) => {
            totalPrice += p.quantity * p.product.price;
            pdf.fontSize(14).text(`${p.product.title} - ${p.quantity} x $${p.product.price}`);
        });
        pdf.fontSize(14).text('--------------------');
        pdf.fontSize(20).text('Total price: $' + totalPrice);
        pdf.end();
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};
