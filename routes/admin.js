const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/add-product', isAuth, adminController.getAddProduct);
router.post(
    '/add-product',
    [
        body('title')
            .isString()
            .withMessage('a title with valid characters')
            .isLength({ min: 3 })
            .withMessage('a title with at least 3 characters')
            .trim(),
        body('imageUrl', 'a valid image URL').isURL(),
        body('price', 'a valid price').isFloat(),
        body('description', 'a description with at least 3 characters').isLength({ min: 5 }).trim(),
    ],
    isAuth,
    adminController.postAddProduct
);
router.get('/products', isAuth, adminController.getProducts);
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);
router.post(
    '/edit-product',
    [
        body('title')
            .isString()
            .withMessage('a title with valid characters')
            .isLength({ min: 3 })
            .withMessage('a title with at least 3 characters')
            .trim(),
        body('imageUrl', 'a valid image URL').isURL(),
        body('price', 'a valid price').isFloat(),
        body('description', 'a description with at least 3 characters').isLength({ min: 5 }).trim(),
    ],
    isAuth,
    adminController.postEditProduct
);
router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
