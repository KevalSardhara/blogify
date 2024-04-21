const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    body : {
        type: String,
        required: true
    },
    coverImageURL : {
        type: String,
        required: false
    },
    createdBy : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    }
}, {timestamps : true});

const Blog = mongoose.model("Blog", userSchema);

module.exports = {
    Blog,
};
