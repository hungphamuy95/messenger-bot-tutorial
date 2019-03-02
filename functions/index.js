const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const _ = require("lodash");
const app = express();
const witToken = "Bearer XPYPFLURQLUNHROLGUZAIIWDTSLBDSYL";
const token = "EAAb8M2W3NCEBAGH1n5KJ1G4ZB4DhJ9olU1MjyhOZAVVHyRMVQZBi9olg6T9vA5qCG05ZCN1l21JUnZA05evAoZADlTtChKc2OZAgfaMV4FBUTXKphx6qRMLSagyrZCWJwOZByjnkQJZAufxHuRTmldceGfWvDuqZA42OWWy4UBu7ZAhI3tG6mObCVPg0"

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());

app.get("/", (req, res)=>{
    res.send("test message");
});

app.get("/webhook/", (req, res)=>{
    console.log(req.query['hub.verify_token']);
	if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
		res.send(req.query['hub.challenge']);
		console.log("success");
	} else {
		res.send('Error, wrong token')
	}
});

app.post('/webhook/', function (req, res) {
	//console.log(req.body.entry[0].messaging);
	let messaging_events = req.body.entry[0].messaging
	for (let i = 0; i < messaging_events.length; i++) {
		let event = req.body.entry[0].messaging[i]
		let sender = event.sender.id
		if (event.message && event.message.textf) {
			let text = event.message.text
			sendTextMessage(sender, text);
		}
		// if (event.message && event.message.attachments) {
		// 	let text = event.message.text
		// 	let url = event.message.attachments[0].payload.url;
		// 	detectImage(sender, text, url);
		// 	sendTextMessage(sender, textResponse);
		// }
		if (event.postback) {
			let text = JSON.stringify(event.postback)
			sendTextMessage(sender, "Postback received: " + text.substring(0, 200), token);
			continue
		}
	}
	res.sendStatus(200)
});

function sendTextMessage(sender, text) {
	let messageData = {
		text: text
	}

	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {
			access_token: token,
		},
		method: 'POST',
		json: {
			recipient: {
				id: sender
			},
			message: messageData,
		}
	}, function (error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		} else if (response.body) {
			console.log("body responseed" + response.body);
		}
	})
}

exports.botapp = functions.https.onRequest(app);
