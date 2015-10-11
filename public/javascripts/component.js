var URL = 'http://localhost:3000';

var socket = io.connect(URL);
var myUser = 'GG';

socket.on('connect',function(){
	console.log('CONNECTED');
});

var Post = React.createClass({
	onHit: function() {
		var hitList = this.props.postdata.hits;
		var hitUrl = '/post/' + this.props.postdata._id + '/user/' + myUser + '/hit';
		var api = 'PUT';
		for ( var i = 0; i < hitList.length; i++) {
			console.log(hitList[i]);
			if ( hitList[i] == myUser) {
				api = 'DELETE';
				break;
			}
		}
		$.ajax({
			url: hitUrl,
			type: api,
		});
	},

	rawMarkup: function() {
		var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
		return { __html: rawMarkup };
	},

	render: function() {

		var Slaps = this.props.postdata.hits.length + ' slaps';
		var pTime = new Date(this.props.postdata.time);
		var pYear = pTime.getFullYear();
		var pMonth = pTime.getMonth();
		var pDate = pTime.getDate();
		var pHour = pTime.getHours();
		var pMinute = pTime.getMinutes();
		var pSecond = pTime.getSeconds();
		var Time = pYear + '/' + pMonth + '/' + pDate + ' ' + pHour + ':' + pMinute + ':' + pSecond;
		var emoji = this.props.postdata.emoji;
		
		var Esrc = '';
		if ( emoji == 1) {
			Esrc = ('/public/images/emoji1')
		} else if ( emoji == 2) {
			Esrc = ('/public/images/emoji2')
		} else if ( emoji == 3) {
			Esrc = ('/public/images/emoji3')
		} else if ( emoji == 4) {
			Esrc = ('/public/images/emoji4')
		};

		return (
			<div className="post">
				<h2 className="postHeader">
					{this.props.postdata.user}
					<img src={Esrc} />
				</h2>
				<span>{Time}</span>
				<span>{this.props.postdata.message}</span>
				<button className="postHitButton" onClick={this.onHit} >{Slaps}</button>
			</div>
		);
	}
});



var PostBox = React.createClass({
	loadPostsFromServer: function() {
		$.ajax({
			url: '/posts',
			dataType: 'json',
			cache: false,
			success: function(data) {
				this.setState({data: data});
				console.log(this.state.data);
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url+'/posts', status, err.toString());
			}.bind(this)
		});
	},

	handlePostSubmit: function(post) {
		$.post('/post', post, function (data) { console.log(JSON.stringify(data)); }, "json");
	},

	getInitialState: function() {
		return {data: []};
	},
	componentDidMount: function() {
		this.loadPostsFromServer();
		socket.on('new post', function (post) {
			var newPosts = this.state.data.concat([post]);
			this.setState({data: newPosts});
		}.bind(this));
		socket.on('hit', function (h) {
			var target = h._id;
			var newPosts = this.state.data;

			for ( var i = 0; i < newPosts.length; i++ ) {
				if ( newPosts[i]._id === target ) {
					console.log('aaaa');
					newPosts[i].hits.push(h.user);
					console.log(newPosts);
					break;
				}
			}
			this.setState( {data: newPosts});
		}.bind(this));
		socket.on('unhit', function (h) { 
			var target = h._id;
			var newPosts = this.state.data;

			for ( var i = 0; i < newPosts.length; i++ ) {
				if ( newPosts[i]._id === target ) {
					var idx = newPosts[i].hits.indexOf(h.user)
					newPosts[i].hits.splice( idx, 1 );
					break;
				}
			}
			this.setState({data: newPosts});
		}.bind(this));
	},
	render: function() {
		return (
			<div className="postBox">
				<h1>Talk Shit Get Hit</h1>
				<PostForm onPostSubmit={this.handlePostSubmit} />
				<PostList data={this.state.data} />
			</div>
		); 
	}
});



class PostList extends React.Component {
//var PostList = React.createClass({
	render() {
		var postNodes = this.props.data.map( function(post) {
			return (
				<Post postdata={post} />
			);
		});
		return (
			<div className="postList">
				{postNodes}
			</div>
		);
	}
//});
}



var PostForm = React.createClass({
	handleSubmit: function(e) {
		e.preventDefault();
		var user = React.findDOMNode(this.refs.user).value.trim();
		var message = React.findDOMNode(this.refs.message).value.trim();
		var emoji = React.findDOMNode(this.refs.emoji).value.trim();
		if (!message || !user) {
			return;
		}
		this.props.onPostSubmit({
									user: user,
									message: message,
									emoji: emoji
								});
		React.findDOMNode(this.refs.user).value = '';
		React.findDOMNode(this.refs.message).value = '';
		React.findDOMNode(this.refs.emoji).value = '';

		myUser = user;
	},

	render: function() {
		return (
			<form className="postForm" onSubmit={this.handleSubmit}>
				<input type="text" placeholder="Your name" ref="user" />
				<input type="text" placeholder="Talk Shit..." ref="message" />
				<input type="text" placeholder="emoji..." ref="emoji" />
				<input type="submit" value="Post" />
			</form>
		);
	}
});







React.render(
	<PostBox pollInterval={2000} />,
	document.getElementById('content')
);
