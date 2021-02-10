const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoDbStore = require('connect-mongodb-session')(session);

const path = require('path');
const MONGODB_URI =
    'mongodb+srv://tan:a@cluster0.b8khd.mongodb.net/shop?retryWrites=true&w=majority';
const errorController = require('./controllers/error');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const User = require('./models/user');

const app = express();
const store = new MongoDbStore({
    uri: MONGODB_URI,
    collection: 'sessions',
});
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'my secret', resave: false, saveUninitialized: false, store: store }));
app.use(async (req, res, next) => {
    try {
        if (req.session.user) {
            const user = await User.findById(req.session.user._id);
            req.user = user;
        }
        return next();
    } catch (err) {
        console.log(err);
    }
});
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);

mongoose
    .connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    })
    .then(() => {
        app.listen(3000);
    })
    .catch((err) => {
        console.log(err);
    });
