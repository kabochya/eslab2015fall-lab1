var nedb = require('nedb'),
    posts = new nedb({ filename:'./data.db', autoload: true}),
    users = new nedb({ filename:'./user.db', autoload: true})

var db = {posts:posts, users:users};

module.exports = db;