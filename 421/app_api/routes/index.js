const express = require('express');
const router = express.Router();
const expressJwt = require('express-jwt');
const auth = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'], // Important: Specify algorithms to use
  userProperty: 'payload'
});
const ctrlBlogs = require('../controllers/ctrlBlog');
var ctrlAuth = require('../controllers/authentication');

router.get('/blog', ctrlBlogs.getAllBlogs);

router.get('/blog/:id', ctrlBlogs.getBlogById);

router.post('/blog', auth, ctrlBlogs.createBlog); 

router.put('/blog/:id', auth, ctrlBlogs.updateBlog); 

router.delete('/blog/:id', ctrlBlogs.deleteBlog); 

router.post('/register', ctrlAuth.register); 

router.post('/login', ctrlAuth.login);  

module.exports = router;