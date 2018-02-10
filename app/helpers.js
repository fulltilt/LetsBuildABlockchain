module.exports = function(MY_PORT, PEERS, BLOCKCHAIN, publicKey) {
	let fs = require('fs'),
		path = require('path'),
		http = require('http'),
		request = require('request'),
		querystring = require('querystring'),
		crypto = require('crypto'),
		block = require('./block'),
		module = {};

	// note: synchronous
	let HUMAN_READABLE_NAMES = fs.readFileSync(path.resolve(__dirname, 'names.txt'), 'UTF-8').split('\n');


	module.humanReadableName = function(publicKey) {
		let publicKeyHash = crypto.createHmac('sha256', publicKey)
		 					 	 							.digest('hex');
		let publicKeyHashToHexInt = parseInt(publicKeyHash, 16);
		return HUMAN_READABLE_NAMES[publicKeyHashToHexInt % HUMAN_READABLE_NAMES.length];
	}

	module.readableBalances = function() {
		if (!BLOCKCHAIN) {
			return '';
		}
		let balances = BLOCKCHAIN.computeBalances(),
				result = '';

		for (let publicKey in balances) {
			result += `	${module.humanReadableName(publicKey)} currently has ${balances[publicKey]}\n`
		}

		return result;
	}

	module.renderState = function() {
		let date = new Date(),
				time = date.toLocaleTimeString();

		if (!BLOCKCHAIN) {
			console.log('Blockchain currently null...')
			return;
		}

		console.log(`
My blockchain:\n${BLOCKCHAIN.toString()}
Blockchain length: ${BLOCKCHAIN.length()}
PORT: ${MY_PORT}
My human-readable name: ${module.humanReadableName(publicKey)}
My peers: ${Array.from(PEERS).join(',')}
Balances:\n${module.readableBalances()}
---------------------------------------------`);
	}

	module.gossipWithPeer = function(peerPort) {
		let gossipResponse = module.clientGossip(peerPort, PEERS, BLOCKCHAIN);
		gossipResponse
			.then(
				res => {
					let theirPeers = res['peers'],
							theirBlockchain = res['blockchain'];

					module.updatePeers(theirPeers);
					module.updateBlockchain(theirBlockchain);
				},
				err => {
					PEERS.delete(peerPort);
				}
			);
	}

	module.updateBlockchain = function(theirBlockchain) {
		if (!theirBlockchain.blocks || (BLOCKCHAIN !== null && theirBlockchain.blocks.length <= BLOCKCHAIN.blocks.length)) {
			return;
		}
		BLOCKCHAIN = new block.BlockChain(null, null);	// workaround as theirBlockchain isn't serialized
		BLOCKCHAIN.blocks = theirBlockchain.blocks;
	}

	module.updatePeers = function(theirPeers) {
		for (let elem of Array.from(theirPeers)) {
			PEERS.add(elem);
		}
	}

	module.clientGossip = function(peerPort, PEERS, BLOCKCHAIN) {
		let postData = querystring.stringify({
			'peers': PEERS,
			'blockchain': BLOCKCHAIN
		});

		let options = {
			url: `http://localhost:${peerPort}/gossip`,
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

	module.getPublicKey = function(port) {
		let options = {
			url: `http://localhost:${port}/pub_key`,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		};

		return new Promise(function(resolve, reject) {
			request.get(options, function(err, res, body) {
				if (err) {
					reject(err);
				} else {
					resolve(body);
				}
			});
		});
	}

	module.sendMoney = function(port, to, amount) {
		let postData = querystring.stringify({
			'to': to,
			'amount': amount
		});

		let options = {
			url: `http://localhost:${port}/send_money`,
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

	return module;
};