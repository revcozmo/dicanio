// routes.js
// define non-model URL routes for app

// jshint node: true, esversion: 6
'use strict';

const models    = require('./models'),
      moment    = require('moment'),
      mail      = require('./mail'),
      fs        = require('fs'),
      gravatar  = require('gravatar'),
      logger    = require('winston'),
      utils     = require('./utils'),
      passport  = require('passport');

const routes = app => {

  app.get('/', (req, res) => {
    res.render('main', {
      title: 'Welcome'
    });
  });

  // login
  app.get('/login', utils.isAnon, (req, res) => {
    res.render('players/login', {
      title: 'Login'
    });
  });

  app.post('/login', 
    passport.authenticate('local', {
      successReturnToOrRedirect: '/home',
      failureRedirect: '/',
      failureFlash: true
    })
  );

  app.get('/home', utils.isAuthenticated, (req, res) => {
    
    res.render('players/view', {
      title: 'Home',
      gravatar: gravatar.url(req.user.email, {s: '100', r: 'x', d: 'retro'}, false)
    });

  });

  app.get('/auth/facebook', 
    passport.authenticate('facebook', {
      //scope: ['email', 'photo']
    })
  );

  app.get('/auth/facebook/callback', 
    passport.authenticate('facebook', {
      successRedirect: '/home',
      failureRedirect: '/'
    })
  );

  app.get('/auth/google', 
    passport.authenticate('google', {
      scope: ['profile']
    })
  );

  app.get('/auth/google/callback',
    passport.authenticate('google', {
      successRedirect: '/home',
      failureRedirect: '/',
      failureFlash: true
    })
  );

  app.get('/logout', (req, res) => {
    let usr = req.user ? req.user.username : '(unknown)';
    logger.info(usr + ' logged out');
    req.logout();
    req.flash('info', 'Logged Off');
    res.redirect('/');
  });

  // any other static content
  app.get('/pages/:page', function(req, res) {
    let path = `views/pages/${ req.params.page }.hbs`;
    try {
      fs.accessSync(path, fs.F_OK);
      res.render('pages/' + req.params.page, {
        title: req.params.page
      });      
    } catch (e) {
      res.status(404).render('errors/404', { title: 'Uh-oh' });
    }
  });

}

module.exports = routes;