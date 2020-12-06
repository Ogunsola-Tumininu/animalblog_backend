const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

const BlogSchema = mongoose.Schema({
    // id: {
    //     type: String,
    //     required: true,
    //     unique: true,
    //     dropDups: true
    // },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    image: {
        url: String,
        publicId: String
    }
    

});

const Blog = module.exports = mongoose.model("Blog", BlogSchema);

BlogSchema.plugin(uniqueValidator, { message: 'Error, expected to be unique.' });