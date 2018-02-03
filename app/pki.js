// https://github.com/rzcoder/node-rsa
let NodeRSA = require('node-rsa'),
		key = new NodeRSA({b: 512});


function generateKeyPair() {
	return key.generateKeyPair();
};

let rsaKey = generateKeyPair(),
		privateKey = rsaKey.exportKey('private'),
		publicKey = rsaKey.exportKey('public');

function sign(plainText, rawPrivateKey) {
	let privateKey = new NodeRSA(rawPrivateKey);
	return privateKey.encryptPrivate(plainText, 'base64');
}

let text = 'Hello World';
console.log('Plain Text:', plainText);
let cipherText = sign(text, privateKey);
console.log('Cipher Text:', cipherText);

function plainText(cipherText, rawPublicKey) {
	let publicKey = new NodeRSA(rawPublicKey);
	return publicKey.decryptPublic(cipherText, 'utf8');
}

let message = plainText(cipherText, publicKey);
console.log('Decoded message:', message);

function isValidSignature(message, cipherText, publicKey) {
	return message === plainText(cipherText, publicKey);
}

console.log('Is Signature Valid:', isValidSignature(message, cipherText, publicKey));