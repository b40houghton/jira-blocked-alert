const express = require('express');
const http = require('http');
const request = require('request');
const path = require('path');
const WebSocket = require('ws');
const compression = require('compression');
const app = express();
const ws = new WebSocket(`ws://localhost:2080`);

require('dotenv').config();

app.set('view engine', 'hbs');

app.use(compression());
app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {

	let headers = {
		'Authorization': `Basic ${process.env.AUTH}`,
		'Content-Type': 'application/json',
	};

	let options = {
		rejectUnauthorized: false, // not ideal
		url: `${process.env.JIRA_URL}/rest/api/latest/search?jql=${process.env.JIRA_JQL}`,
		headers: headers
	};

	function callback(error, response, body) {

		// only send the issues over
		if (!error) {
			let parsedData = JSON.parse(body);
			let data = {
				meta: {
					total: parsedData.total,
					max: parsedData.maxResults
				},
				issues: parsedData.issues
			}
			ws.send(JSON.stringify(data));
		}
	}

	request(options, callback);

	res.render('index');
});

app.post('/jira/blocked/:project/:ticket/', function (req, res) {

	let headers = {
		'Authorization': `Basic ${process.env.AUTH}`,
		'Content-Type': 'application/json',
	};

	let options = {
		rejectUnauthorized: false, // not ideal
		url: `${process.env.JIRA_URL}/rest/api/latest/search?jql=${process.env.JIRA_JQL}`,
		headers: headers
	};

	function callback(error, response, body) {

		// only send the issues over
		if (!error) {
			let parsedData = JSON.parse(body);
			let data = {
				meta: {
					total: parsedData.total,
					max: parsedData.maxResults
				},
				issues: parsedData.issues,
				alert: []
			}
			ws.send(JSON.stringify(data));
		} else {
			console.log(error);
		}
	}

	ws.on('open', function open() {

		let data = {
			alert: [{
				key: req.params['project'],
				id: req.params['ticket'],
				user: req.params['user']
			}]
		};

		ws.send(JSON.stringify(data));

		request(options, callback);
	});

	res.send("ok");
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws) {

	ws.on('open', function open() {
		console.log('WS: open');
	});

	ws.on('close', function close() {
		console.log('WS: connection closed');
	});

	ws.on('message', function incoming(data) {

		wss.clients.forEach(function each(client) {
			client.send(data)
		});
	});
});

server.listen(process.env.PORT || 3000, function listening() {
	console.log('Listening on %d', server.address().port);
});