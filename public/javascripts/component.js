var URL = 'http://localhost:3000';

var socket = io.connect(URL);
var myUser = 'GG';

socket.on('connect',function(){
	console.log('CONNECTED');
});

var Post = React.createClass({
	onHit: function() {
		var hitList = this.props.postdata.hits;
		var hitUrl = '/post/' + this.props.postdata._id + '/hit';
		var api = 'PUT';
		for ( var i = 0; i < hitList.length; i++) {
			if ( hitList[i] == myUser) {
				api = 'DELETE';
				break;
			}
		}
		$.ajax({
			url: hitUrl,
			type: api,
		},function(data){
			Redirect(data.status);
		});
	},

	rawMarkup: function() {
		var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
		return { __html: rawMarkup };
	},

	render: function() {

		
		var Slaps = '';
		if(this.props.postdata.hits.length === 0) Slaps += 'Be the first to slap this shit';
		else {
			Slaps += this.props.postdata.hits[0];
			if(this.props.postdata.hits[1]) Slaps += ', ' + this.props.postdata.hits[1];
			if(this.props.postdata.hits[2]) Slaps += ', ' + this.props.postdata.hits[1];
			if(this.props.postdata.hits[3]) Slaps += ', and ' + ( this.props.postdata.hits.length - 3) + ' others';
			Slaps += ' slapped this shit.';
		}
		var pTime = new Date(this.props.postdata.time);
		var pYear = pTime.getFullYear();
		var pMonth = pTime.getMonth()+1;
		var pDate = pTime.getDate();
		var pHour = ('0'+pTime.getHours()).slice(-2);
		var pMinute = ('0'+pTime.getMinutes()).slice(-2);
		var pSecond = ('0'+pTime.getSeconds()).slice(-2);
		var Time = pYear + '/' + pMonth + '/' + pDate + ' ' + pHour + ':' + pMinute + ':' + pSecond;
		var emoji = this.props.postdata.emoji;
		
		var Esrc = '';
		if ( emoji == 1) {
			Esrc = ('/images/emoji1.jpg')
		} else if ( emoji == 2) {
			Esrc = ('/images/emoji2.jpg')
		} else if ( emoji == 3) {
			Esrc = ('/images/emoji3.jpg')
		} else if ( emoji == 4) {
			Esrc = ('/images/emoji4.jpg')
		} else if ( emoji == 0) {
			Esrc = ('/images/emoji0.jpg')
		};

		return (
			<div className="post">
			<h4 className="postHeader">
			{this.props.postdata.user}
			<img src={Esrc} />
			</h4>
			<span>{this.props.postdata.message}</span><br/>
			<span>{Time}</span>
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
				Redirect(data.status);
				this.setState({data: data});
			}.bind(this)
		});
	},

	handlePostSubmit: function(post) {
		$.post('/post', post, function (data) {
			Redirect(data.status); 
		}, "json");
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
					newPosts[i].hits.push(h.user);
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
		var you = 'you are ' + myUser + '.....';
		return (
			<div className="postBox">{you}
				<a href="/logout" >fuck off</a>
				<h1>Talk Shit Get Hit</h1>
				<PostForm onPostSubmit={this.handlePostSubmit} />
				<PostList data={this.state.data} />
			</div>
			); 
	}
});



class PostList extends React.Component {
	render() {
		var postNodes = this.props.data.map( function(post) {
			return (
				<Post postdata={post} />
				);
		});
		postNodes.reverse();	
		return (
			<div className="postList">
			{postNodes}
			</div>
			);
	}
}

var PostForm = React.createClass({
	handleSubmit: function(e) {
		e.preventDefault();
		var message = React.findDOMNode(this.refs.message).value.trim();
		var emoji = React.findDOMNode(this.refs.emoji).value.trim();
		if (!message) return;

		this.props.onPostSubmit({

			message: message,
			emoji: emoji
		});
		React.findDOMNode(this.refs.message).value = '';
	},

	render: function() {
		return (
			<form className="postForm" onSubmit={this.handleSubmit}>
			<input type="text" placeholder="Talk Shit..." ref="message" />
			<select ref="emoji">
				<option value="1" >daniel</option>
				<option value="2" >pml</option>
				<option value="3" >steve</option>
				<option value="4" >david</option>
				<option value="0" >jon</option>
			</select>
			<input type="submit" value="Post" />
			</form>
			);
	}
});

$.get('/user', function (data) {
	Redirect(data.status);
	myUser = data.user;
	React.render(
		<PostBox pollInterval={2000} />,
		document.getElementById('content')
	);
});

function Redirect(status) {
	if(status===-1){
		window.location.href = '/login';
	}
}