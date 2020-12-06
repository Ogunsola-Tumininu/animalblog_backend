const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');

// const profileSchema = new mongoose.Schema({
//     career : String,
//     skills : [String] 

//   });
var uniqueValidator = require('mongoose-unique-validator');
const UserSchema = mongoose.Schema({
    firstname: {
        type: String
    },

    lastname: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true,
        dropDups: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    favorites: [String]
});

const User = module.exports = mongoose.model('User', UserSchema);
UserSchema.plugin(uniqueValidator, { message: 'Error, expected to be unique.' });

module.exports.getUserById = function (id, callback) {
    User.findById(id, callback);
}

module.exports.getUserByEmail = function (email, callback) {
    const query = { email: email }
    User.findOne(query, callback);
}

module.exports.addUser = function (newUser, callback) {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser.save(callback);
        });

    })
}

module.exports.comparePassword = function (candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if (err) throw err;
        callback(null, isMatch);
    })
}