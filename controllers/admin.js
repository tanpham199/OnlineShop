const { validationResult } = require('express-validator');
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: [],
    });
};

exports.postAddProduct = async (req, res, next) => {
    const { title, price, imageUrl, description } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(442).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            product: { title, price, imageUrl, description },
            hasError: true,
            errorMessage:
                'Please enter ' +
                errors
                    .array()
                    .map((e) => e.msg)
                    .join(', ') +
                '.',
            validationErrors: errors.array(),
        });
    }
    const product = new Product({ title, price, imageUrl, description, userId: req.user });
    try {
        await product.save();
        res.redirect('/admin/products');
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error); // next with error parameter will ignore all other middlewares and return error handling middle ware
    }
};

exports.getEditProduct = async (req, res, next) => {
    const editMode = req.query.edit;
    const prodId = req.params.productId;
    if (!editMode) {
        return res.redirect('/');
    }
    try {
        const product = await Product.findById(prodId);
        if (!product) {
            return res.render('404');
        }
        res.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: editMode,
            product: product,
            hasError: false,
            errorMessage: null,
            validationErrors: [],
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.postEditProduct = async (req, res, next) => {
    const { productId, title, price, imageUrl, description } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(442).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: true,
            product: { _id: productId, title, price, imageUrl, description },
            hasError: true,
            errorMessage:
                'Please enter ' +
                errors
                    .array()
                    .map((e) => e.msg)
                    .join(', ') +
                '.',
            validationErrors: errors.array(),
        });
    }
    try {
        if ((await Product.findById(productId)).userId.toString() !== req.user._id.toString()) {
            return res.redirect('/');
        }
        await Product.findByIdAndUpdate(productId, {
            title,
            price,
            imageUrl,
            description,
        });
        res.redirect('/admin/products');
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ userId: req.user._id });
        // .select('title price -_id') // only fetch title and price field, exclude _id field (which is automatically fetched by default)
        // .populate('userId'); // populate the reference 'userId'
        // .populate('userId', 'name'); // populate the reference 'userId' and then only select name field
        res.render('admin/products', {
            prods: products,
            pageTitle: 'Admin Products',
            path: '/admin/products',
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.postDeleteProduct = async (req, res, next) => {
    try {
        await Product.deleteOne({ _id: req.body.productId, userId: req.user._id });
        res.redirect('/admin/products');
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};
