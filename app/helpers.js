let fs = require('fs'),
		path = require('path'),
		http = require('http'),
		request = require('request'),
		querystring = require('querystring'),
		crypto = require('crypto');

// note: synchronous
let HUMAN_READABLE_NAMES = fs.readFileSync(path.resolve(__dirname, 'names.txt'), 'UTF-8').split('\n');


function humanReadableName(publicKey) {
	let publicKeyHash = crypto.createHmac('sha256', publicKey)
	 					 	 							.digest('hex');
	let publicKeyHashToHexInt = parseInt(publicKeyHash, 16);
	return HUMAN_READABLE_NAMES[publicKeyHashToHexInt % HUMAN_READABLE_NAMES.length];
}

function readableBalances(BLOCKCHAIN) {
	if (!BLOCKCHAIN) {
		return '';
	}
	let balances = BLOCKCHAIN.computeBalances(),
			result = '';
	for (let publicKey in balances) {
		result += `${humanReadableName(publicKey)} currently has ${balances[publicKey]}`
	}

	return result;
}

function renderState(BLOCKCHAIN, MY_PORT) {
	let date = new Date(),
			time = date.toLocaleTimeString();
	return `---------------------------------------------
My blockchain: ${BLOCKCHAIN.toString()}
Blockchain length: ${BLOCKCHAIN.length()}
PORT: ${MY_PORT}
My human-readable name: ${humanReadableName(publicKey)}
My peers: ${PEERS.join(',')}
${readableBalances()}
---------------------------------------------`;
}

function gossipWithPeer(port) {
	let gossipResponse = clientGossip(port, PEERS, BLOCKCHAIN);
	gossipResponse
		.then(
			res => {console.log(res)
				let theirPeers = res['peers'],
						theirBlockchain = res['blockchain'];

				updatePeers(theirPeers);
				updateBlockchain(theirBlockchain);
			},
			err => {
				let portIndex = PEERS.indexOf(port);
				PEERS = [...PEERS.slice(0, portIndex), ...PEERS.slice(portIndex + 1)];
			}
		);
}

function updateBlockchain(theirBlockchain) {
	if (!theirBlockchain || (BLOCKCHAIN && theirBlockchain.length <= BLOCKCHAIN.length)) {
		return;
	}
	
	BLOCKCHAIN = theirBlockchain;
}

function updatePeers(theirPeers) {
	PEERS = Object.assign({}, PEERS, theirPeers);
}

function clientGossip(port, PEERS, BLOCKCHAIN) {
	let postData = querystring.stringify({
		'peers': PEERS,
		'blockchain': BLOCKCHAIN
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

function getPublicKey(port) {
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
				resolve(JSON.parse(body));
			}
		});
	});
}

function sendMoney(port, to, amount) {
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

module.exports = {
	humanReadableName,
	readableBalances,
	renderState,
	gossipWithPeer,
	updateBlockchain,
	updatePeers,
	getPublicKey
}