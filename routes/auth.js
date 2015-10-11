var express = require('express');
var router = express.Router();
var db = require('../db');
var passport = require('passport');


router.get('/login',function(req,res){
  res.render('login',
  {
    message:
    {
      error:req.flash('error'),
      status:req.flash('status')
    }
  });
});
router
.all('/login', function(req, res) {
  passport.authenticate('local', function(err, user) {
    if (req.accepts(['json','html','text'])=='json') {
      var ret = {
        status: 0
      };
      if (err) {
        ret.message=err.message;
        return res.json(ret);
      }
      if (!user) { 
        ret.status=-1;
        ret.message='Not logged in.';
        return res.json(ret);
      }
      req.login(user, function(err) {
        if (err) { 
          ret.message = err
        }
        else{
          ret.status=1;
        }
        return res.json(ret);
      });
    } 
    else {
      if (err)   { return res.redirect('/login'); }
      if (!user) { 
        req.flash('status','Wrong username or password.');
        return res.redirect('/login'); 
      }
      req.login(user, function(err) {
        if (err) { return res.redirect('/login'); }
        return res.redirect('/');
      });
    }
  })(req, res);
});
// router.post('/login',
//   passport.authenticate('local',{
//     successRedirect:'/',
//     failureRedirect:'/login',
//     failureFlash:'Wrong username or password.'
//   })
// );

router.get('/register',function(req,res){
  res.render('register',{message:req.flash('status')});
});

router.post('/register',function(req,res){
  var user = 
  {
    user:req.body.user,
    password:req.body.password,
    confirm:req.body.confirm
  }

  validate = validateUser(user);

  if(!validate.status){
    req.flash('status',validate.message)
    res.redirect('/register')
    return
  }
  db.users.findOne({user:user.user},function(err,doc){
    if(err){
      console.log(err);
      req.flash('status',err)
      res.redirect('/register')
      return
    }
    if(doc){
      console.log();
      req.flash('status',"User already exists.")
      res.redirect('/register')
      return
    }
    db.users.insert({user:user.user,password:user.password},function(err,doc){
      if(err){
        console.log(obj);
        req.flash('status',err);
        res.redirect('/register');
      }
      else{
        console.log("New User "+doc.user+" has registered.");
        req.login(user, function() {
          req.flash('status',"You have successfully registered.")
          return res.redirect('/');
        });
      }
    });
  });
});

router.get('/logout',
  function(req,res){
    if(!req.user){ 
      res.redirect('/');
      return;
    }
    req.logout();
    req.flash('status','You have been logged out.')
    res.redirect('/login');
  });

module.exports = router;

var validateUser = function(user){
  var ret = {
    status: 0
  }
  if(!user.user.match(/^[a-z0-9]{3,10}$/)){
    ret.message = "Invalid Username."
  }
  else if(user.password !== user.confirm){
    ret.message = "Password doesn't match"
  }
  else{
    ret.status = 1
  }
  return ret
}