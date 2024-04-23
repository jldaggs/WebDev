// blogs.js
const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    blogTitle: {
        type: String,
        required: true
    },
    blogText: {
        type: String,
        required: true
    },
    blogAuthor: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    likeCount: {
        type: Number,
        default: 0 // Start with zero likes
    },
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }]
}, { timestamps: true });

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
