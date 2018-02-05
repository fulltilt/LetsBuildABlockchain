module.exports = function(app) {
	let fs = require('fs'),
			path = require('path'),
			http = require('http'),
			request = require('request'),
			querystring = require('querystring'),
			block = require('./block'),
			helpers = require('./helpers'),
			PKI = require('./pki');

	let args = process.argv.slice(2),
			MY_PORT = args[0],    // port we are on
			PEER_PORT = args[1],  // port of peer we want to connect to
			PEERS = [MY_PORT],
			rsa = PKI.generateKeyPair(),
			privateKey = rsa.exportKey('private'),
			publicKey = rsa.exportKey('public'),
			BLOCKCHAIN = null;

	if (!PEER_PORT) {
		// You're the progenitor!
		BLOCKCHAIN = new block.BlockChain(publicKey, privateKey);
	} else {
		PEERS.push(PEER_PORT);
	}

	
	let getPeerUpdates = setInterval(function() {
		// go through each peer
		for (let i = 0; i < PEERS.length; ++i) {
			if (PEERS[i] !== MY_PORT) {
				console.log(`Gossiping about blockchain and peers with ${PEERS[i]}...`);
				helpers.gossipWithPeer(PEERS[i]);
			}
		}

		helpers.renderState();
	}, 3000);



	app.post('/gossip', function(req, res) {
		let theirBlockchain = JSON.parse(req.body.blockchain),
				theirPeers = req.body.peers;
		helpers.updateBlockchain(JSON.parse(theirBlockchain));
		helpers.updatePeers(theirPeers);
		res.send({
			'peers': PEERS,
			'blockchain': BLOCKCHAIN
		});
	});

	app.post('/send_money', function(req, res) {
		let to = helpers.getPublicKey(req.query.to),
				amount = parseInt(req.query.amount, 10);

		if (BALANCES[from] < amount) {
			throw new Error('Insufficient Funds');
		}

		BLOCKCHAIN.addToChain(new block.Transaction(publicKey, to, amount, privateKey));

		console.log('OK. Block mined!');
	});

	app.get('/pub_key', function(req, res) {
		res.send(publicKey);
	});
};