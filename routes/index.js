var express = require('express');
var router = express.Router();
var io = require('socket.io')();
var sanitizeHtml = require('sanitize-html');

var nedb = require('nedb'),
    Posts = new nedb({ filename:'./data.db', autoload: true}),
    Users = new nedb({ filename:'./user.db', autoload: true})

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index')
})

router.get('/posts',function(req,res,next){
  Posts.find({}).sort({ time: 1 }).exec(function(err,posts){
    console.log(posts);
    res.json(posts)
  })
})

router.post('/post',function(req,res,next){

  var post = 
  {
    user: req.body.user,
    message: sanitizeHtml(req.body.message),
    emoji: req.body.emoji,
    time: Date.now(),
    hits:[]
  }

  var validate = validatePost(post)

  if(!validate.status){
    res.json(validate)
    return
  }

  Posts.insert(post,function(err,doc){
    if(err){
      console.log(err)
      validate.status = 0
      validate.message = err
    }
    else{
      console.log("New post: "+ doc)
      io.emit('new post',doc)
    }
    res.json(validate)
  })
})

router.put('/post/:id/user/:user/hit',function(req,res,next){
  var id = req.params.id
  var user = req.params.user
  Posts.findOne({_id:id},function(err,doc){
    if(err){
      console.log(err)
      res.json({status:0,message:err})
      return
    }
    else if(!doc){
      res.json({status:0,message:"Post doesn't exist."})
      return
    }
    else if(doc.hits.find( (e)=> e===user )){
      res.json({status:0,message:"User already hit."})
      return
    }
    Posts.update({_id:id},{$addToSet:{hits:user}},{},function(err,count){
      if(err){
        console.log(err)
        res.json({status:0,message:err})
        return
      }
      console.log(count)

      res.json({status:1})

      io.emit('hit',{_id:id,user:user})
    })
  })
})

router.delete('/post/:id/user/:user/hit',function(req,res,next){
  var id = req.params.id
  var user = req.params.user
  Posts.findOne({_id:id},function(err,doc){
    if(err){
      console.log(err)
      res.json({status:0,message:err})
      return
    }
    else if(!doc){
      res.json({status:0,message:"Post doesn't exist."})
      return
    }
    else if(!doc.hits.find( (e)=> e===user )){
      res.json({status:0,message:"User hasn't hit yet."})
      return
    }
    Posts.update({_id:id},{$pull:{hits:user}},{},function(err,count){
      if(err){
        console.log(err)
        res.json({status:0,message:err})
        return
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
  if(!post.user.match(/^[a-z0-9]{3,10}$/)){
    ret.message = "Invalid Username."
  }
  else if( !(post.emoji && post.emoji >= 0 && post.emoji <= 4) ){
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