var express = require('express');
var router = express.Router();
var io = require('socket.io')();
var sanitizeHtml = require('sanitize-html');

var db = require('../db');
var passport = require('passport');
var authenticate = require('connect-ensure-login').ensureLoggedIn();

router.get('/',
  authenticate,
  function(req, res, next) {
    res.render('index')
  })
router.get('/user',
  authenticate,
  function(req,res,next){
    res.json({user:req.user.user})
  })
router.get('/posts',
  authenticate,
  function(req,res,next){
    db.posts.find({}).sort({ time: 1 }).exec(function(err,posts){
      res.json(posts)
    })
  })
router.post('/post',
  authenticate,
  function(req,res,next){
    var post = 
    {
      user: req.user.user,
      message: sanitizeHtml(req.body.message),
      emoji: req.body.emoji,
      time: Date.now(),
      hits:[]
    }

    var validate = validatePost(post)

    if(!validate.status){
      return res.json(validate)
    }

    db.posts.insert(post,function(err,doc){
      if(err){
        console.log(err)
        validate.status = 0
        validate.message = err
      }
      else{
        io.emit('new post',doc)
      }
      res.json(validate)
    })
  })

router
.route('/post/:id/hit')
.all(require('connect-ensure-login').ensureLoggedIn())
.put(function(req,res,next){
  var id = req.params.id
  var user = req.user.user
  db.posts.findOne({_id:id},function(err,doc){
    if(err){
      console.log(err)
      return res.json({status:0,message:err})
    }
    else if(!doc){
      return res.json({status:0,message:"Post doesn't exist."})
    }
    else if(doc.hits.find( (e)=> e===user )){
      return res.json({status:0,message:"User already hit."})
    }
    db.posts.update({_id:id},{$addToSet:{hits:user}},{},function(err,count){
      if(err){
        console.log(err)
        return res.json({status:0,message:err})
      }

      res.json({status:1})

      io.emit('hit',{_id:id,user:user})
    })
  })
})
.delete(function(req,res,next){
  var id = req.params.id
  var user = req.user.user
  db.posts.findOne({_id:id},function(err,doc){
    if(err){
      console.log(err)
      return res.json({status:0,message:err})
    }
    else if(!doc){
      return res.json({status:0,message:"Post doesn't exist."})
    }
    else if(!doc.hits.find( (e)=> e===user )){
      return res.json({status:0,message:"User hasn't hit yet."})
    }
    db.posts.update({_id:id},{$pull:{hits:user}},{},function(err,count){
      if(err){
        console.log(err)
        return res.json({status:0,message:err})
      }
      res.json({status:1})

      io.emit('unhit',{_id:id,user:user})
    })  
  })
})

io.on('connection', function (socket) {
  socket.emit('connected', { message: "U r connected." });
});

var validatePost = function(post){
  var ret = {
    status: 0
  }
  if( !(post.emoji && post.emoji >= 0 && post.emoji <= 4) ){
    ret.message = "Invalid Emoji."
  }
  else if( post.message == ""){
    ret.message = "Invalid Message."
  }
  else{
    ret.status = 1
  }
  return ret
}

router.io = io;
module.exports = router;