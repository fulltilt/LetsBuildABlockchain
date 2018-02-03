// the puzzle is to find a nonce, which combined with your message, produces a hash with some number of leading 0's
let crypto = require('crypto');

let NUM_ZEROES = 5,
		zeroesString = '0'.repeat(NUM_ZEROES);


function hash(message) {
	return crypto.createHmac('sha256', message)
							 .digest('hex');
}

function findNonce(message) {
	let nonce = 1,
			count = 0;

	while (!isValidNonce(nonce, message)) {
		if (count % 100000 === 0) {
			console.log('.');
		}
		
		nonce = nonce + 1;
		count += 1;
	}

	return nonce;
}

function isValidNonce(nonce, message) {
	return hash(message + nonce).substring(0, NUM_ZEROES) === zeroesString;
}

let message = 'Hello World';
console.log('Count:', findNonce(message));