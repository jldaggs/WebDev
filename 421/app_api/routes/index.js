const express = require('express');
const router = express.Router();
const ctrlBlogs = require('../controllers/ctrlBlog');

router.get('/blog', ctrlBlogs.getAllBlogs);

router.get('/blog/:id', ctrlBlogs.getBlogById);

router.post('/blog', ctrlBlogs.createBlog); 

router.put('/blog/:id', ctrlBlogs.updateBlog); 

router.delete('/blog/:id', ctrlBlogs.deleteBlog); 

module.exports = router;