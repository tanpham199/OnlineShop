const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const errorController = require('./controllers/error');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

const sequelize = require('./util/database');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(async (req, res, next) => {
    try {
        const user = await User.findByPk(1);
        req.user = user;
        next();
    } catch (err) {
        console.log(err);
    }
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);

Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

sequelize
    // .sync({ force: true })
    .sync()
    .then(() => {
        return User.findByPk(1);
    })
    .then((user) => {
        if (!user) {
            return User.create({ name: 'Tan', email: 'test@test.com' });
        }
        return Promise.resolve(user); // create a promise so that in both cases, then return a promise
    })
    .then((user) => {
        // return user.createCart();
        return;
    })
    .then(() => {
        app.listen(3000);
    })
    .catch((err) => {
        console.log(err);
    });
