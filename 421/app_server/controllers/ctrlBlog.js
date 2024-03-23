const Blog = require('../models/blogs');

/* GET home page */
exports.home = function(req,res) {
    res.render('home', { title: 'Jillian Daggs Blog'});
};
// Function to handle the index route using promises
exports.blogList = (req, res) => {
    Blog.find({})
        .then(blogs => {
            res.render('blogList', { blogs });
        })
        .catch(err => {
            console.error('Error fetching blogs:', err);
            res.status(500).send('Error fetching blogs');
        });
};

exports.blogCreate = function(req,res) {
    res.render('blogAdd', { title: 'Blog Add' });
};
exports.blogEdit = function(req,res) {
    res.render('blogEdit', { title: 'Blog Edit' });
};
exports.blogDelete = function(req,res) {
    res.render('blogDelete', { title: 'Blog Delete' });
};
