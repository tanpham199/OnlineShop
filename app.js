const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const User = require('./models/user');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(async (req, res, next) => {
    try {
        const user = await User.findById('60220b5f6bf25b1f502cbc98');
        User.find
        req.user = user;
        next();
    } catch (err) {
        console.log(err);
    }
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);

mongoose
    .connect('mongodb+srv://tan:a@cluster0.b8khd.mongodb.net/shop?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    })
    .then(() => {
        User.findOne().then((users) => {
            if (!users) {
                const user = new User({
                    name: 'Tan',
                    email: 'tanpham1104@gmail.com',
                    cart: {
                        items: [],
                    },
                });
                user.save();
            }
        });
        app.listen(3000);
    })
    .catch((err) => {
        console.log(err);
    });
