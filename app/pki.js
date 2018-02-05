// https://github.com/rzcoder/node-rsa
let NodeRSA = require('node-rsa'),
		key = new NodeRSA({b: 512});

let generateKeyPair = function() {
	return key.generateKeyPair();	
}

let sign = function(plainText, rawPrivateKey) {
	let privateKey = new NodeRSA(rawPrivateKey);
	return privateKey.encryptPrivate(plainText, 'base64');
}

let plainText = function(cipherText, rawPublicKey) {
	let publicKey = new NodeRSA(rawPublicKey);
	return publicKey.decryptPublic(cipherText, 'utf8');
}

let isValidSignature = function(message, cipherText, publicKey) {
	return message === plainText(cipherText, publicKey);
}

module.exports = {
	generateKeyPair,
	sign,
	plainText,
	isValidSignature
};