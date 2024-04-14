const Blog = require('../../../../WebDev/421/models/blogs');
const jwt = require('jsonwebtoken');

exports.home = function(req,res) {
    res.render('home', { title: 'Jillian Daggs Blog'});
};
// Get all blogs
module.exports.getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().populate('blogAuthor', 'name');
        res.json(blogs); // Return blogs as JSON
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get a single blog by ID
module.exports.getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        res.json(blog);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Add a new blog
module.exports.createBlog = async (req, res) => {
    try {
        console.log("User ID from token:", req.userId);
        const newBlog = new Blog({
            const newBlog = new Blog({
                blogTitle: req.body.blogTitle,
                blogText: req.body.blogText,
                blogAuthor: req.userId // Ensure this matches the decoded token
        });

        const savedBlog = await newBlog.save();
        res.status(201).json(savedBlog); // Return the saved blog
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: 'Failed to add blog' });
    }
};


module.exports.updateBlog = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; // Assuming Bearer token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const blogId = req.params.id;

        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        if (blog.author.toString() !== decoded.userId) {
            return res.status(403).json({ error: 'Unauthorized to update this blog' });
        }

        const updatedBlog = await Blog.findByIdAndUpdate(blogId, req.body, { new: true });
        res.json(updatedBlog); // Return the updated blog
    } catch (error) {
        res.status(500).json({ error: 'Error updating the blog' });
    }
};


module.exports.deleteBlog = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; // Assuming Bearer token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const blogId = req.params.id;

        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        if (blog.author.toString() !== decoded.userId) {
            return res.status(403).json({ error: 'Unauthorized to delete this blog' });
        }

        await Blog.findByIdAndDelete(blogId);
        res.json({ message: 'Blog successfully deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting the blog' });
    }
};
