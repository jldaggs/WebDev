const Blog = require('../../app_server/models/blogs');

exports.home = function(req,res) {
    res.render('home', { title: 'Jillian Daggs Blog'});
};
// Get all blogs
module.exports.getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find();
        res.render('blogList', { blogs: blogs });
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
        const newBlog = new Blog({
            blogTitle: req.body.blogTitle,
            blogText: req.body.blogText
        });
        const savedBlog = await newBlog.save();
        res.redirect('/blogs')
    } catch (error) {
        res.status(400).json({ error: 'Failed to add blog' });
    }
};

// Update a blog by ID
module.exports.updateBlog = async (req, res) => {
    try {
        const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedBlog) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        res.json(updatedBlog);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update blog' });
    }
};

// Delete a blog by ID
module.exports.deleteBlogConfirm = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
          return res.status(404).send('Blog not found');
        }
        res.render('blogDelete', { blog: blog }); 
      } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
      }
    };

    module.exports.deleteBlog = async (req, res) => {
        try {
            const blogId = req.params.id; // Get the blog ID from the URL parameter
            const deletedBlog = await Blog.findByIdAndDelete(blogId);
            if (!deletedBlog) {
                return res.status(404).send('Blog not found');
            }
            // Redirect to the blog list page after successful deletion
            res.redirect('/blogs');
        } catch (error) {
            console.error('Error deleting the blog:', error);
            res.status(500).send('Error deleting the blog');
        }
    };
