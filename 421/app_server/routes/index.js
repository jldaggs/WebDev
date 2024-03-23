var express = require('express');
var router = express.Router();
var ctrlBlogs = require('../controllers/ctrlBlog.js')

/* GET home page. */
router.get('/', ctrlBlogs.home);
router.get('/blogs', ctrlBlogs.blogList)
router.get('/blogs/create', ctrlBlogs.blogCreate)
router.get('/blogs/delete/:id', ctrlBlogs.blogDelete)
router.get('/blogs/edit/:id', ctrlBlogs.blogEdit)

module.exports = router;
