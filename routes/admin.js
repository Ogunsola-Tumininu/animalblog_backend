const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/database');
const Admin = require('../models/admin');
const Blog = require('../models/blog');
var multer = require('multer');

const router = express.Router();

const cloudinary = require("cloudinary");
const cloudinaryConfig = require('../config/cloudinary');
const cloudinaryStorage = require("multer-storage-cloudinary");


const url = 'http://127.0.0.1:4200'
// const url = 'https://careermeze-dev.herokuapp.com'

//Admin Registration
router.post('/register', (req, res, next) => {
    let admin = new Admin(req.body);
    console.log("isee", admin)
    Admin.addUser(admin, (err, adminuser) => {
        if (err) {
            res.json({ success: false, msg: err.message })
        }
        else {
            res.json({ success: true, msg: 'Admin added successfully' })
        }
    })
})

//Admin login
router.post('/authenticate', (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    Admin.getUserByEmail(email, (err, adminuser) => {
        if (err) throw err;
        if (!adminuser) {
            return res.json({ success: false, msg: 'User not found' })
        }

        Admin.comparePassword(password, adminuser.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
                const token = jwt.sign(adminuser.toJSON(), config.secret, {
                    expiresIn: 604800
                });

                res.json({
                    success: true,
                    token: token,
                    user: {
                        id: adminuser._id,
                        firstname: adminuser.firstname,
                        lastname: adminuser.lastname,
                        email: adminuser.email,
                    }
                })
            }
            else {
                return res.json({ success: false, msg: 'Wrong password' })
            }
        })
    })
});

//Create blog
router.route('/blog/add').post((req, res) => {
    let blog = new Blog(req.body);
   
    blog.save(blog, (err, blog) => {
        if (err) {
            console.log(err)
            res.json({ success: false, msg: err.message })
            
        }
        else {
            console.log(blog)
            res.json({ success: true, msg: 'Blog added successfully', blog: blog })
        }
    })

});


// fetch all blogs
router.route('/blog/all').get((req, res) => {
    Blog.find((err, blogs) => {
        if (err) {
            res.status(400).send("Failed to get blogs")
            console.log(err.message)
        }
        else
            res.json({ success: true, blogs: blogs });
    });
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


//delete a blog
router.route('/delete/blog/:id').delete((req, res) => {
    Blog.findByIdAndRemove({ _id: req.params.id }, (err, blog) => {
        if (!blog) {
            res.status(400).send('oops! blog not found')
        }
        else if (err) {
            res.status(400).send('Failed to remove blog')
            console.log(err.message);
        }
        else
            res.json({ success: true, mgs: "blog has been deleted successfully" });
    })
})


// update blog
router.route('/update/blog/:id').put((req, res) => {
    Blog.findById(req.params.id)
        .exec(function (err, blog) {
            if (!blog) {
                res.status(400).send('oops! movie not found')
            }
            else {
                blog.title = req.body.title;
                blog.description = req.body.description;
                
                blog.save()
                    .then(movie => {
                        res.json({ success: true, blog: blog });
                    })
                    .catch(err => {
                        res.status(400).send('Update failed')
                        console.log(err.message);
                    });
            }
        });
})


// add movie image to cloudinary

cloudinary.config({
    cloud_name: cloudinaryConfig.cloud_name,
    api_key: cloudinaryConfig.api_key,
    api_secret: cloudinaryConfig.api_secret
});

const imageStorage = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: "movies",
    allowedFormats: ["jpg", "png"],
});
const imageParser = multer({ storage: imageStorage });
const imageUpload = imageParser.single("img")

router.post('/blog/upload/:id', (req, res) => {
    Blog.findById(req.params.id)
        .exec(function (err, blog) {
            if (!blog) {
                res.status(400).send('oops! blog not found')
            }
            else {
                imageUpload(req, res, function (err) {
                    if (err) {
                        res.json({ success: false, message: err.message })
                    }
                    else {
                        let image = {};
                        image.url = req.file.secure_url;
                        image.publicId = req.file.public_id;
                        blog.image = image;
                        blog.save()
                        res.json({ success: true, message: "Blog image uploaded successfully", blog: blog })
                    }
                })
            }
        })
});

module.exports = router;