let crypto = require('crypto'),
		PKI = require('./pki');


function Block(previousBlock, transaction) {
	this.NUM_ZEROES = 2;
	this.zeroesString = '0'.repeat(this.NUM_ZEROES);
	this.ownHash = null;
	this.previousBlockHash = null;
	this.transaction = transaction;

	if (previousBlock) {
		this.previousBlockHash = previousBlock.ownHash;
	}

	this.mineBlock();
};

Block.createGenesisBlock = function(publicKey, privateKey) {
	let genesisTransaction = new Transaction(null, publicKey, 500000, privateKey);
	return new Block(null, genesisTransaction);
}

Block.prototype = {
	mineBlock: function() {
		this.nonce = this.calculateNonce();
		this.ownHash = this.hash(this.fullBlock(this.nonce));
	},

	isValid: function() {
		this.isValidNonce(this.nonce) && this.transaction.isValidSignature();
	},

	hash: function(contents) {
		return crypto.createHmac('sha256', contents)
							 	 .digest('hex');
	},

	calculateNonce: function() {
		let nonce = 1,
				count = 0;

		while (!this.isValidNonce(nonce)) {
			if (count % 100000 === 0) {
				console.log('.');
			}
			
			nonce = nonce + 1;
			count += 1;
		}

		return nonce;
	},

	isValidNonce: function(nonce) {
		return this.hash(this.fullBlock(nonce)).substring(0, this.NUM_ZEROES) === this.zeroesString;
	},

	fullBlock: function(nonce) {
		return (this.previousBlockHash) ? [this.transaction.toString(), this.previousBlockHash, nonce].join('')
																		: [this.transaction.toString(), nonce].join('');
	},

	toString: function() {
		return `-----------------------------------------------------------------------------------
Previous hash: ${this.previousBlockHash}
Message: ${this.transaction}
Nonce: ${this.nonce}
Own hash: ${this.ownHash}
-----------------------------------------------------------------------------------
                                        |
                                        |
                                        ↓`;
	}
};


function Transaction(from, to, amount, privateKey) {
	this.from = from;
	this.to = to;
	this.amount = amount;
	this.signature = PKI.sign(this.message(), privateKey);
};

Transaction.prototype = {
	isValidSignature: function() {
		return isGenesisTransaction() || PKI.isValidSignature(message(), this.signature, this.from);
	},

	isGenesisTransaction: function() {
		return this.from === null;
	},

	message: function() {
		return crypto.createHmac('sha256', [this.from, this.to, this.amount].join(''))
							 	 .digest('hex');
	},

	toString: function() {
		return this.message();
	}
}


function BlockChain(originatorPublicKey, originatorPrivateKey) {
	this.blocks = [];
	this.blocks.push(Block.createGenesisBlock(originatorPublicKey, originatorPrivateKey));
};

BlockChain.prototype = {
	addToChain: function(transaction) {
		let lastBlock = this.blocks[this.blocks.length - 1];
		this.blocks.push(new Block(lastBlock, transaction));
	},

	isValid: function() {
		for (let i in this.blocks) {
			let block = this.blocks[i];
			if (block.isValid()) {
				return false;
			}
		}

		for (let i = 1; i < this.blocks.length; ++i) {
			if (this.blocks[i - 1].ownHash !== this.blocks[i].previousBlockHash) {
				return false;
			}
		}

		// make sure nobody's balance is below zero
		if (!this.allSpendsValid()) {
			return false;
		}

		return true;
	},

	allSpendsValid: function() {
		let balances = this.computeBalances(),
				keys = Object.keys(balances);
		for (let i = 0; i < keys.length; ++i) {
			if (balances[keys[i]] < 0) {
				return false;
			}
		}
		return true;
	},

	computeBalances: function() {
		let genesisTransaction = this.blocks[0],
				balances = {};

		balances[genesisTransaction.transaction.to] = genesisTransaction.transaction.amount;
			// genesisTransaction.transaction.to: genesisTransaction.transaction.amount
		balances.default = 0;	// new people automatically have a balance of 0
		
		for (let i = 1; i < this.blocks.length; ++i) {	// ignore genesis block
			let from = this.blocks[i].transaction.from,
					to = this.blocks[i].transaction.to,
					amount = this.blocks[i].transaction.amount;

			balances[from] -= amount;
			balances[to] += amount;
		}

		return balances;
	},

	length: function() {
		return this.blocks.length;
	},

	toString: function() {
		return this.blocks.join('\n');
	}
};

module.exports = {
	Block,
	Transaction,
	BlockChain
};