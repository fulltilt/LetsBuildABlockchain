module.exports = function(app) {

	let BALANCES = {
		'haseeb': 100000
	};

	app.get('/balance/:user', function(req, res) {
		let username = req.params.user;
		console.log(`${username} has ${BALANCES[username]}`);
	});

	app.post('/users/:name', function(req, res) {
		let name = req.params.name.toLowerCase();
		BALANCES[name] = (BALANCES[name]) ? BALANCES[name] : 0;
		console.log('OK')
	});

	app.post('/transfers', function(req, res) {
		let from = req.query.from.toLowerCase(),
				to = req.query.to.toLowerCase(),
				amount = parseInt(req.query.amount, 10);

		if (BALANCES[from] < amount) {
			throw new Error('Insufficient Funds');
		}

		BALANCES[from] -= amount;
		BALANCES[to] += amount;
		console.log('OK');
	});
};