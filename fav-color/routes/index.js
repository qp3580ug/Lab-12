var express = require('express');
var router = express.Router();
var passport = require('passport');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.get('/signup', function(req, res, next) {
  res.render('signup');
});

router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/secret',
  failureRedirect: '/login',
  failureFlash: '/true'
}));

router.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/secret',
  failureRedirect: '/signup',
  failureFlash: true
}));

router.get('/secret', isLoggedIn, function(req, res, next) {

  var user = req.user.local;

  res.render('secret', {
    username : req.user.local.username,
    twitterName: req.user.twitter.displayName,
    signupDate: req.user.signupDate,
    favorites: req.user.favorites
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/login');
  }
}

router.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/login');
});

router.post('/saveSecrets', isLoggedIn, function(req, res, next) {
  if (req.body.color || req.body.luckyNumber) {
    req.user.favorites.color = req.body.color || req.user.favorites.color;
    req.user.favorites.luckyNumber = req.body.luckyNumber || req.user.favorites.luckyNumber;

    req.user.save()
      .then( () => {
        req.flash('updateMsg', 'Your data was updated')
        res.redirect('/secret');
      })
      .catch( (err) => {
        if (err.name === 'ValidationError') {
          req.flash('updateMsg', 'Your data is not valid')
          res.redirect('/secret');
        } else {
          next(err);
        }
      });
  }

  else {
    req.flash('updateMsg', 'Please enter some data');
    res.redirect('/secret');
  }
});

router.get('/auth/twitter', passport.authenticate('twitter'));

router.get('/auth/twitter/callback', passport.authenticate('twitter', {
  successRedirect: '/secret',
  failureRedirect: '/login'
}));

module.exports = router;
