const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');

var uniqueValidator = require('mongoose-unique-validator');
const AdminSchema = mongoose.Schema({
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
    password: {
        type: String,
        required: true
    }
});

const Admin = module.exports = mongoose.model('Admin', AdminSchema);

AdminSchema.plugin(uniqueValidator, { message: 'Error, expected to be unique.' });

module.exports.getUserById = function (id, callback) {
    Admin.findById(id, callback);
}

module.exports.getUserByEmail = function (email, callback) {
    const query = { email: email }
    Admin.findOne(query, callback);
}

module.exports.addUser = function (newadminUser, callback) {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newadminUser.password, salt, (err, hash) => {
            if (err){
                console.log(err);
            } 
            newadminUser.password = hash;
            newadminUser.save(callback);
        });

    })
}

module.exports.comparePassword = function (candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if (err) throw err;
        callback(null, isMatch);
    })
}