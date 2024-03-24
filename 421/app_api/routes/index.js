const express = require('express');
const router = express.Router();
const ctrlBlogs = require('../controllers/ctrlBlog');

router.get('/blogs', ctrlBlogs.getAllBlogs);

router.get('/blogs/:id', ctrlBlogs.getBlogById);

router.post('/blogs', ctrlBlogs.createBlog); 

router.put('/blogs/:id', ctrlBlogs.updateBlogConfirm); 

router.delete('/blogs/:id', ctrlBlogs.deleteBlog); 

module.exports = router;