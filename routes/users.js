const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const User = require('../models/user');
const Blog = require('../models/blog');


const router = express.Router();

router.post('/register', (req, res, next) => {
    let newUser = new User(req.body);
    
    User.addUser(newUser, (err, user) => {
        if (err) {
            res.json({ success: false, msg: 'Failed to add user' })
        }
        else {
            res.json({ success: true, msg: 'User added successfully' })
        }
    })
});



// authenticate user
router.post('/authenticate', (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    User.getUserByEmail(email, (err, user) => {
        if (err) throw err;
        if (!user) {
            return res.json({ success: false, msg: 'User not found' })
        }

        User.comparePassword(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
                const token = jwt.sign(user.toJSON(), config.secret, {
                    expiresIn: 604800
                });

                res.json({
                    success: true,
                    token: 'bearer ' + token,
                    user: {
                        id: user._id,
                        firstname: user.firstname,
                        lastname: user.lastname,
                        username: user.username,
                        email: user.email
                    }
                })
            }
            else {
                return res.json({ success: false, msg: 'Wrong password' })
            }
        })
    })
});

router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    res.json({ user: req.user });
});

// fetch all blog
router.route('/blog/all').get((req, res) => {
    Blog.find((err, blogs) => {
        if (err) {
            res.status(400).send("Failed to get blogs")
            console.log(err.message)
        }
        else
            res.json({ success: true, blogs: blogs });
    }).limit(6);
});

//get a single blog
router.route('/blog/:id').get((req, res) => {
    Blog.findById(req.params.id, (err, blog) => {
        if (!blog) {
            res.status(400).send('oops! blog not found')
        }
        else if (err) {
            res.status(400).send('Failed to get blog')
            console.log(err)
        }
        else
            res.json({ success: true, blog: blog });
    });
});

// add favourite
router.route('/:id/blog/favorite/add').post((req, res) => {
    User.findById(req.params.id)
        .exec(function (err, user) {
            if (!user) {
                res.status(400).send('oops! user not found')
            }
            else {
                user.favorites.push(req.body.favorite);
                user.save()
                    .then(user => {
                        res.json({ success: true, user: user });
                    })
                    .catch(err => {
                        res.status(400).send('Update failed')
                        console.log(err.message);
                    });
            }
        });
})

// remove favourite
router.route('/:id/blog/favorite/remove').post((req, res) => {
    User.findById(req.params.id)
        .exec(function (err, user) {
            if (!user) {
                res.status(400).send('oops! user not found')
            }
            else {

                let index = user.favorites.indexOf(req.body.favorite);
                if (index > -1) {
                    user.favorites.splice(index, 1);
                }

                user.save()
                    .then(user => {
                        res.json({ success: true, user: user });
                    })
                    .catch(err => {
                        res.status(400).send('Update failed')
                        console.log(err.message);
                    });
            }
        });
})

// get all favorite blogs
router.post('/blog/favorite/all', (req, res) => {
    Blog.find({ _id: { $in: req.body.favorites } }, (err, blogs) => {
        if (err) {
            res.status(400).send("Failed to get all blogs")
            console.log(err.message)
        }
        else
            res.json({ success: true, blogs: blogs });
    })
});


// search blog
router.route('/search').post((req, res) => {
    const searchText = req.body.searchText;
    Blog.find({ "title": { $regex: searchText, $options: "$i" } })
        .exec((err, blogs) => {
            if (err) {
                res.status(400).send("Failed to blog")
                console.log(err.message)
            }
            else
                res.json({ success: true, blogs: blogs });

        });
});




module.exports = router;

