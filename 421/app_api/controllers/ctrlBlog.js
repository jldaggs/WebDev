const Blog = require('../../../../WebDev/421/models/blogs');
const Comment = require('../../../../WebDev/421/models/comments');
const mongoose = require('mongoose');


exports.home = function(req,res) {
    res.render('home', { title: 'Jillian Daggs Blog'});
};
//**************************************************************Comment Controllers********************************************************************************** */

module.exports.addComment = async (req, res) => {
    const { text } = req.body;
    const { blogId } = req.params;

    const commentAuthor = mongoose.Types.ObjectId(req.user._id);

    try {
        const newComment = new Comment({
            text,
            commentAuthor,
            blogPost: mongoose.Types.ObjectId(blogId) // Ensure blogId is correctly formatted
        });

        const savedComment = await newComment.save();
        res.status(201).json(savedComment);
    } catch (error) {
        console.error('Failed to add comment:', error);
        res.status(400).json({ error: 'Failed to add comment', message: error.message });
    }
};

// Get comments for a blog post
module.exports.getComments = async (req, res) => {
    const blogId = req.params.blogId;

    try {
        const blog = await Blog.findById(blogId, 'comments');
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        res.json(blog.comments);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
module.exports.editComment = async (req, res) => {
    const blogId = req.params.blogId;
    const commentId = req.params.commentId;
    const { text } = req.body; 

    try {
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        // Find the comment in the blog.comments array
        const comment = blog.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        
        comment.text = text;

        await blog.save();
        res.json({ message: 'Comment updated successfully', comment });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
module.exports.deleteComment = async (req, res) => {
    const blogId = req.params.blogId;
    const commentId = req.params.commentId;

    try {
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        // Remove the comment from the comments array
        const comment = blog.comments.id(commentId);
        if (comment) {
            comment.remove();
        } else {
            return res.status(404).json({ error: 'Comment not found' });
        }

        await blog.save();
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


//*************************************************************************Likes Controller************************************************************************************ */

module.exports.toggleLike = async (req, res) => {
    const { blogId } = req.params;
    if (!blogId) {
        return res.status(400).json({ message: "Blog ID must be provided" });
    }

    try {
        const userId = req.user._id; // Ensure user is authenticated
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        const wasLiked = blog.likedBy.includes(userId);
        const update = wasLiked ? { $pull: { likedBy: userId } } : { $addToSet: { likedBy: userId } };
        const updatedBlog = await Blog.findByIdAndUpdate(blogId, update, { new: true });

        req.app.get('io').emit('likeUpdated', {
            blogId,
            likeCount: updatedBlog.likedBy.length,
            liked: !wasLiked
        });

        res.json({
            success: true,
            likeCount: updatedBlog.likedBy.length,
            liked: !wasLiked
        });
    } catch (error) {
        console.error("Error toggling like:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};



module.exports.toggleCommentLike = async (req, res) => {
    const blogId = req.params.blogId;
    const commentId = req.params.commentId;
    const userId = req.user ? mongoose.Types.ObjectId(req.user._id) : null;

    try {
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        const comment = blog.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const likeIndex = comment.likedBy.indexOf(userId);
        if (likeIndex === -1) {
            comment.likedBy.push(userId);
            comment.likesCount++;
        } else {
            comment.likedBy.splice(likeIndex, 1);
            comment.likesCount--;
        }

        await blog.save();
        res.json({ success: true, likesCount: comment.likesCount, liked: likeIndex === -1 });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

//******************************************************************************Blogs Controllers****************************************************************************************************** */
module.exports.getAllBlogs = async (req, res) => {
    try {
        const userId = req.user ? mongoose.Types.ObjectId(req.user._id) : null;
        const blogs = await Blog.find().populate('blogAuthor', 'name'); // Populate the blogAuthor field with the 'name' property from the User model
        const blogsTransformed = blogs.map(blog => ({
            ...blog._doc,
            isLikedByUser: blog.likedBy.includes(userId)
        }));
        res.json(blogsTransformed);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// Get a single blog by ID
module.exports.getBlogById = async (req, res) => {
    try {
        const userId = req.user ? mongoose.Types.ObjectId(req.user._id) : null;
        const blog = await Blog.findById(req.params.blogId);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        const isLikedByUser = blog.likedBy.includes(userId);
        res.json({ ...blog._doc, isLikedByUser });
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
        const blogId = req.params.blogId;
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
            const blogId = req.params.blogId;
            await Blog.findByIdAndDelete(blogId);
            res.json({ message: 'Blog successfully deleted' });
        } catch (error) {
            res.status(500).json({ error: 'Error deleting the blog' });
        }
    };
