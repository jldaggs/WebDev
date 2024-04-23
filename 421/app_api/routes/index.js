const express = require('express');
const router = express.Router();
const ctrlBlogs = require('../controllers/ctrlBlog');
const { verifyToken } = require('../middleware/authJwt');
const authController = require('../controllers/authController');

router.get('/blog', ctrlBlogs.getAllBlogs);

router.get('/blog/:id', ctrlBlogs.getBlogById);

router.post('/blog', verifyToken, ctrlBlogs.createBlog); // Secured

router.put('/blog/:id', verifyToken, ctrlBlogs.updateBlog); // Secured

router.delete('/blog/:id', verifyToken, ctrlBlogs.deleteBlog); // Secured

router.get('/blog/:id/comments', ctrlBlogs.getComments);

router.post('/blog/:id/comments', verifyToken, ctrlBlogs.addComment); // Secured
 
router.put('/blog/:blogId/comments/:commentId', verifyToken, ctrlBlogs.editComment); // Secured

router.delete('/blog/:blogId/comments/:commentId',verifyToken, ctrlBlogs.deleteComment); // Secured

router.post('/register', authController.register);

router.post('/login', authController.login);

module.exports = router;