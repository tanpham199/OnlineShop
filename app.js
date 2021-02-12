const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const csrf = require('csurf');
const flash = require('connect-flash');
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
const { error } = require('console');

const app = express();
const csrfProtection = csrf();
const store = new MongoDbStore({
    uri: MONGODB_URI,
    collection: 'sessions',
});
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'my secret', resave: false, saveUninitialized: false, store: store }));
app.use(csrfProtection);
app.use(flash());
// every views that are rendered will have these variables
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});
app.use(async (req, res, next) => {
    try {
        if (req.session.user) {
            const user = await User.findById(req.session.user._id);
            if (user) {
                req.user = user;
            }
        }
        return next();
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
});
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.get('/500', errorController.get500);
app.use(errorController.get404); // this catches all unexpected URL

// this (middleware with 4 parameters) will be called when next(error) is called or an error is catched
app.use((error, req, res, next) => {
    res.status(500).render('500', {
        pageTitle: '500',
        path: '/500',
    });
});

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
