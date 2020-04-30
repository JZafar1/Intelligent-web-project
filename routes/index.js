const express = require('express');
const router = express.Router();

const users = require('../controllers/users');
const stories = require('../controllers/stories');
const initDB = require('../controllers/init');
initDB.init();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/createPost', function(req, res, next) {
    res.render('createPost', { title: 'Create New Post'});
});

router.get('/login', function (req, res, next) {
    res.render('login', { title: 'Login'});
});

router.post('/login', function(req, res, next) {
    users.authenticate(req, res, function (error, user) {
        if (error || !user) {
            const err = new Error('Wrong email or password.');
            return next(err);
        } else {
            // req.session.userId = user._id;
            // res.render('index')
            res.redirect('/');
        }
    });
});

router.get('/timeline', function(req, res, next) {
  res.render('timeline', {
    title: 'View your timeline',
    profileSource: 'https://images.unsplash.com/reserve/bOvf94dPRxWu0u3QsPjF_tree.jpg?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60',
    userName: 'James Zafar',
    timePosted: '10 Minutes Ago'
  });
});

module.exports = router;