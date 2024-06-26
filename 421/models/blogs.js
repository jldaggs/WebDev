// blogs.js
const mongoose = require('mongoose');

// Define the schema for a blog entry
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
    }},
    { timestamps: true });

// Create a model from the schema
const Blog = mongoose.model('Blog', blogSchema);

// Export the model
module.exports = Blog;