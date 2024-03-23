const express = require('express');
const router = express.Router();
const ctrlBlogs = require('../controllers/ctrlBlog');

router.get('/', ctrlBlogs.home);
router.get('/blogs', ctrlBlogs.getAllBlogs);
router.get('/blogs/:id', ctrlBlogs.getBlogById);
router.post('/blogs/create', ctrlBlogs.createBlog);
router.put('/blogs/edit/:id', ctrlBlogs.updateBlog); 
router.get('/blogs/delete/:id', ctrlBlogs.deleteBlogConfirm);
router.post('/blogs/delete/:id', ctrlBlogs.deleteBlog);

module.exports = router;