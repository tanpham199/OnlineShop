const { deleteById } = require('../models/product');
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
    });
};

exports.postAddProduct = async (req, res, next) => {
    const { title, imageUrl, price, description } = req.body;
    try {
        await Product.create({
            title: title,
            imageUrl: imageUrl,
            price: price,
            description: description,
        });
        res.redirect('/admin/products');
    } catch (err) {
        console.log(err);
    }
};

exports.getEditProduct = async (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    try {
        const product = await Product.findByPk(req.params.productId);
        if (!product) {
            return res.render('404');
        }
        res.render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/edit-product',
            editing: editMode,
            product: product,
        });
    } catch (err) {
        console.log(err);
    }
};

exports.postEditProduct = async (req, res, next) => {
    const { productId, title, price, imageUrl, description } = req.body;
    try {
        const product = await Product.findByPk(productId);
        product.title = title;
        product.price = price;
        product.imageUrl = imageUrl;
        product.description = description;

        await product.save(); // create new if not existed
        res.redirect('/admin/products');
    } catch (err) {
        console.log(err);
    }
};

exports.getProducts = async (req, res, next) => {
    try {
        const products = await Product.findAll();
        res.render('admin/products', {
            prods: products,
            pageTitle: 'Admin Products',
            path: '/admin/products',
        });
    } catch (err) {
        console.log(er);
    }
};

exports.postDeleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.body.productId);
        await product.destroy();
        res.redirect('/admin/products');
    } catch (err) {
        console.log(err);
    }
};
