const express = require('express');
const router = express.Router();
const ctrlBlogs = require('../controllers/ctrlBlog');

router.get('/', ctrlBlogs.home);
router.get('/blogs', ctrlBlogs.getAllBlogs);
router.get('/blogs/:id', ctrlBlogs.getBlogById);
router.post('/blogs/create', ctrlBlogs.createBlog);
router.put('/blogs/update/:id', ctrlBlogs.updateBlog); 
router.delete('/blogs/delete/:id', ctrlBlogs.deleteBlog);

module.exports = router;