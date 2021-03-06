var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');

var passport = require('passport');
var Strategy = require('passport-local').Strategy;

var db = require('./db');

passport.use(new Strategy( {
  usernameField: 'user'
},
  function(username, password, done){
    db.users.findOne({user:username},function(err,user){
      if(err){ return done(err) }
      if(!user){ return done(null,false)}
      if(user.password !== password) {return done(null,false)}

      return done(null,user)
    })
  }
));

passport.serializeUser(function(user,done){
  done(null,user._id)
})

passport.deserializeUser(function(id,done){
  db.users.findOne({_id:id},function(err,user){
    if(err){return done(err)}
    done(null,user)
  })
})


var routes = require('./routes/index');
var auth = require('./routes/auth');
var app = express();

app.io = routes.io;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(logger('dev'));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('express-session')({ secret: 'q86q86', resave: false, saveUninitialized: false }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/', auth);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
