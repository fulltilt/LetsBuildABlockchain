module.exports = function(app) {
	let fs = require('fs'),
			path = require('path'),
			http = require('http'),
			request = require('request'),
			querystring = require('querystring')
			STATE = {},
			movies = [];

	// note: synchronous
	movies = fs.readFileSync(path.resolve(__dirname, 'movies.txt'), 'UTF-8').split('\n');

	let args = process.argv.slice(2);

	let MY_PORT = args[0],				// port we are on
			PEER_PORT = args[1];			// port of peer we want to connect to

	updateState({
		[MY_PORT]: null
	});

	if (PEER_PORT) {
		updateState({
			[PEER_PORT]:
			null
		});
	}

	let favoriteMovie = movies[Math.floor(Math.random() * movies.length)],
			versionNumber = 0;
	console.log(`My favorite movie is ${favoriteMovie}`);
	
	updateState({
		[MY_PORT]: {
			'favoriteMovie': favoriteMovie,
			'versionNumber': versionNumber
		}
	});

	let updateMyFavoriteMovie = setInterval(function() {
		console.log(`Screw ${favoriteMovie}`);
		versionNumber += 1;
		favoriteMovie = movies[Math.floor(Math.random() * movies.length)];
		
		updateState({
			[MY_PORT]: {
				'favoriteMovie': favoriteMovie,
				'versionNumber': versionNumber
			}
		});
		
		console.log(`My favorite movie is now ${favoriteMovie}`);
	}, 8000);
	
	let getPeerUpdates = setInterval(function() {
		// go through each peer
		for (let peerPort in STATE) {
			if (peerPort !== MY_PORT) {
				console.log(`Gossiping with ${peerPort}...`);
				let gossipResponse = clientGossip(peerPort, JSON.stringify(STATE));
				gossipResponse
					.then(res => updateState(res))
					.catch(err => delete STATE[peerPort]);
			}
		}

		renderState();
	}, 3000);


	function clientGossip(port, state) {
		let postData = querystring.stringify({
			'state': state
		});

		let options = {
			url: `http://localhost:${port}/gossip`,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: postData
		};

		return new Promise(function(resolve, reject) {
			request.post(options, function(err, res, body) {
				if (err) {
					reject(err);
				} else {
					resolve(JSON.parse(body));
				}
			});
		});
	}

	function renderState() {
		console.log('---------------------------------------------');
		for (let key in STATE) {
			if (STATE[key]) {
				console.log(`${key} currently likes ${STATE[key].favoriteMovie}`);
			}
		}
		console.log('---------------------------------------------');
	}

	function updateState(update) {
		for (let port in update) {
			if (update[port] === null) {
				STATE[port] = update[port] ? update[port] : null;
			} else {
				let currentState = STATE[port];
				if (!currentState || update[port].versionNumber > currentState.versionNumber) {
					STATE[port] = update[port];
				}
			}
		}
	}

	app.post('/gossip', function(req, res) {
		let theirState = req.body.state;
		updateState(JSON.parse(theirState));
		res.send(JSON.stringify(STATE));
	});
};