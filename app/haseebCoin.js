module.exports = function(app) {
	let fs = require('fs'),
			path = require('path'),
			http = require('http'),
			request = require('request'),
			querystring = require('querystring'),
			block = require('./block'),
			PKI = require('./pki');

	let args = process.argv.slice(2),
			MY_PORT = args[0],    // port we are on
			PEER_PORT = args[1],  // port of peer we want to connect to
			PEERS = new Set([MY_PORT]),
			rsa = PKI.generateKeyPair(),
			privateKey = rsa.exportKey('private'),
			publicKey = rsa.exportKey('public'),
			BLOCKCHAIN = null;

	if (!PEER_PORT) {
		// You're the progenitor!
		BLOCKCHAIN = new block.BlockChain(publicKey, privateKey);
	} else {
		PEERS.add(PEER_PORT);
	}

	let helpers = require('./helpers')(MY_PORT, PEERS, BLOCKCHAIN, publicKey);
	
	let getPeerUpdates = setInterval(function() {
		// go through each peer
		let peers = Array.from(PEERS);
		for (let i = 0; i < peers.length; ++i) {
			if (peers[i] !== MY_PORT) {
				console.log(`Gossiping about blockchain and peers with ${peers[i]}...`);
				helpers.gossipWithPeer(peers[i]);
			}
		}

		helpers.renderState();
	}, 3000);



	app.post('/gossip', function(req, res) {
		let theirBlockchain = req.body.blockchain,
				theirPeers = req.body.peers;

		helpers.updateBlockchain(theirBlockchain);
		helpers.updatePeers(theirPeers);
		res.send({
			'peers': PEERS,
			'blockchain': BLOCKCHAIN
		});
	});

	app.post('/send_money', async function(req, res) {
		let amount = parseInt(req.query.amount, 10),
				to = await helpers.getPublicKey(req.query.to);

		BLOCKCHAIN.addToChain(new block.Transaction(publicKey, to, amount, privateKey));
		console.log('OK. Block mined!');
	});

	app.get('/pub_key', function(req, res) {
		res.send(publicKey);
	});
};