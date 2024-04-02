const Blog = require('/models/blogs');

exports.home = function(req,res) {
    res.render('home', { title: 'Jillian Daggs Blog'});
};
// Get all blogs
module.exports.getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find();
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
        const newBlog = new Blog(req.body);
        const savedBlog = await newBlog.save();
        res.status(201).json(savedBlog); // Return the saved blog
    } catch (error) {
        res.status(400).json({ error: 'Failed to add blog' });
    }
};


module.exports.updateBlog = async (req, res) => {
    try {
        const blogId = req.params.id;
        const updatedBlog = await Blog.findByIdAndUpdate(blogId, req.body, { new: true });
        if (!updatedBlog) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        res.json(updatedBlog); // Return the updated blog
    } catch (error) {
        res.status(500).json({ error: 'Error updating the blog' });
    }
};


    module.exports.deleteBlog = async (req, res) => {
        try {
            const blogId = req.params.id;
            await Blog.findByIdAndDelete(blogId);
            res.json({ message: 'Blog successfully deleted' });
        } catch (error) {
            res.status(500).json({ error: 'Error deleting the blog' });
        }
    };
