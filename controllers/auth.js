const bcrypt = require('bcryptjs');
const User = require('../models/user');

exports.getLogin = async (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: req.flash('error')[0],
    });
};

exports.postLogin = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/login');
        }
        if (await bcrypt.compare(password, user.password)) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            await req.session.save(); // interact with sessions might take time, save() to make sure everything is done before calling redirect
            res.redirect('/'); // beside that reason, save() is not needed, all session information is written to database without calling save()
        } else {
            req.flash('error', 'Invalid email or password.');
            res.redirect('/login');
        }
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
        errorMessage: req.flash('error')[0],
    });
};

exports.postSignup = async (req, res, next) => {
    const { email, password, confirmPassword } = req.body;
    try {
        const isExisted = await User.findOne({ email });
        if (isExisted) {
            req.flash('error', 'Email existed.');
            return res.redirect('/signup');
        }
        const user = new User({
            email,
            password: await bcrypt.hash(password, 12),
            cart: { items: [] },
        });
        await user.save();
        res.redirect('/login');
    } catch (err) {
        console.log(err);
    }
};
