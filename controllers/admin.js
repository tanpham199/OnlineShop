const { validationResult } = require('express-validator');
const Product = require('../models/product');
const fileHelper = require('../util/file');

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
    const { title, price, description } = req.body;
    const image = req.file;
    const errors = validationResult(req);
    if (!errors.isEmpty() || !image) {
        return res.status(442).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            product: { title, price, description },
            hasError: true,
            errorMessage: !errors.isEmpty()
                ? 'Please enter ' +
                  errors
                      .array()
                      .map((e) => e.msg)
                      .join(', ') +
                  '.'
                : 'Image is not attached or not in the right format.',
            validationErrors: !errors.isEmpty() ? errors.array() : [],
        });
    }
    const product = new Product({
        title,
        price,
        imageUrl: image.path.replace('\\', '/'),
        description,
        userId: req.user,
    });
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
    const { productId, title, price, description } = req.body;
    const editedImage = req.file;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(442).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: true,
            product: {
                _id: productId,
                title,
                price,
                description,
            },
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
        if (editedImage) {
            fileHelper.deleteFile(product.imageUrl);
        }
        const product = await Product.findById(productId);
        await Product.updateOne(product, {
            title: title,
            price: price,
            imageUrl: editedImage ? editedImage.path.replace('\\', '/') : product.imageUrl,
            description: description,
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

exports.deleteProduct = async (req, res, next) => {
    try {
        const prodId = req.params.productId;
        const product = await Product.findById(prodId);
        if (!product) {
            return next(new Error('Product not found.'));
        }
        fileHelper.deleteFile(product.imageUrl);
        await Product.deleteOne({ _id: prodId, userId: req.user._id });
        res.status(200).json({ message: 'Succeeded.' });
    } catch (err) {
        res.status(500).json({ message: 'Failed.' });
    }
};
