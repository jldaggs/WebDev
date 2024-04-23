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
        type: mongoose.Schema.Types.ObjectId, // Reference to User model
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
    comments: [commentSchema] // Embedding comments within the blog schema
}, { timestamps: true });


// Create a model from the schema
const Blog = mongoose.model('Blog', blogSchema);

// Export the model
module.exports = Blog;