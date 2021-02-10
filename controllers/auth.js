const session = require('express-session');
const User = require('../models/user');

exports.getLogin = async (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: req.session.isLoggedIn,
    });
};

exports.postLogin = async (req, res, next) => {
    try {
        const user = await User.findById('60220b5f6bf25b1f502cbc98');
        req.session.isLoggedIn = true;
        req.session.user = user;
        await req.session.save(); // interact with sessions might take time, save() to make sure everything is done before calling redirect
        res.redirect('/'); // beside that reason, save() is not needed, all session information is written to database without calling save()
    } catch (err) {
        console.log(err);
    }
};

exports.postLogout = async (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        isAuthenticated: false,
    });
};

exports.postSignup = (req, res, next) => {};
