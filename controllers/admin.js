const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
    });
};

exports.postAddProduct = async (req, res, next) => {
    const { title, price, imageUrl, description } = req.body;
    const product = new Product({ title, price, imageUrl, description, userId: req.user });
    try {
        await product.save();
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
        const product = await Product.findById(req.params.productId);
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
        await Product.findByIdAndUpdate(productId, {
            title,
            price,
            imageUrl,
            description,
        });
        res.redirect('/admin/products');
    } catch (err) {
        console.log(err);
    }
};

exports.getProducts = async (req, res, next) => {
    try {
        const products = await Product.find();
        // .select('title price -_id') // only fetch title and price field, exclude _id field (which is automatically fetched by default)
        // .populate('userId'); // populate the reference 'userId'
        // .populate('userId', 'name'); // populate the reference 'userId' and then only select name field
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
        await Product.findOneAndDelete(req.body.productId);
        res.redirect('/admin/products');
    } catch (err) {
        console.log(err);
    }
};
