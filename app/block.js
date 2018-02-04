let crypto = require('crypto');


function Block(previousBlock, message) {
	this.NUM_ZEROES = 4;
	this.zeroesString = '0'.repeat(this.NUM_ZEROES);
	this.ownHash = null;
	this.previousBlockHash = null;

	this.message = message;
	if (previousBlock) {
		this.previousBlockHash = previousBlock.ownHash;
	}

	this.mineBlock();
};

Block.prototype = {
	mineBlock: function() {
		this.nonce = this.calculateNonce();
		this.ownHash = this.hash(this.fullBlock(this.nonce));
	},

	isValid: function() {
		this.isValidNonce(this.nonce);
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
		return (this.previousBlockHash) ? [this.message, this.previousBlockHash, nonce].join('')
																		: [this.message, nonce].join('');
	},

	toString: function() {
		console.log(`-----------------------------------------------------------------------------------
Previous hash: ${this.previousBlockHash}
Messsage: ${this.message}
Nonce: ${this.nonce}
Own hash: ${this.ownHash}
-----------------------------------------------------------------------------------
                                        |
                                        |
                                        ↓`);
	}
};


function BlockChain(message) {
	this.blocks = [];
	this.blocks.push(new Block(null, message));	// genesis block
};

BlockChain.prototype = {
	addToChain: function(message) {
		let lastBlock = this.blocks[this.blocks.length - 1];
		this.blocks.push(new Block(lastBlock, message));
		this.blocks[this.blocks.length - 1].toString();
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

		return true;
	},

	toString: function() {
		console.log(this.blocks);
	}
};


let b = new BlockChain('Genesis Block');
b.addToChain('Cinderella');
b.addToChain('The Three Stooges');
b.addToChain('Snow White');
console.log('Is block chain valid:', b.isValid());
b.toString();
