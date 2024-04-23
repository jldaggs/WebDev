// blogs.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    authorName: {
        type: String,
        required: true
    },
    likesCount: {
        type: Number,
        default: 0
    },
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });


const blogSchema = new mongoose.Schema({
    blogTitle: {
        type: String,
        required: true
    },
    blogText: {
        type: String,
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
    comments: [commentSchema] // Embedding comments within the blog schema
}, { timestamps: true });


// Create a model from the schema
const Blog = mongoose.model('Blog', blogSchema);

// Export the model
module.exports = Blog;