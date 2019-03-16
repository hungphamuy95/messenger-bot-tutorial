//This is still work in progress
/*
Please report any bugs to nicomwaks@gmail.com

i have added console.log on line 48 




 */
'use strict'
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();
const _ = require('lodash');
const witToken = process.env.WIT_TOKEN;


app.set('port', (process.env.PORT))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
	extended: false
}))

// parse application/json
app.use(bodyParser.json())

// index
app.get('/', function (req, res) {
	res.send('starting localhost');
})

// for facebook verification
app.get('/webhook/', function (req, res) {
	console.log(req.query['hub.verify_token']);
	if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
		res.send(req.query['hub.challenge']);
		console.log("success");
	} else {
		res.send('Error, wrong token')
	}
})

// to post data
app.post('/webhook/', function (req, res) {
	//console.log(req.body.entry[0].messaging);
	let messaging_events = req.body.entry[0].messaging
	for (let i = 0; i < messaging_events.length; i++) {
		let event = req.body.entry[0].messaging[i]
		let sender = event.sender.id
		if (event.message && event.message.text) {
			let text = event.message.text
			sendTextMessage(sender, text);
		}
		if (event.message && event.message.attachments) {
			let text = event.message.text
			let url = event.message.attachments[0].payload.url;
			detectImage(sender, text, url);
			sendTextMessage(sender, textResponse);
		}
		if (event.postback) {
			let text = JSON.stringify(event.postback)
			sendTextMessage(sender, "Postback received: " + text.substring(0, 200), token);
			continue
		}
	}
	res.sendStatus(200)
})

const token = process.env.FB_PAGE_ACCESS_TOKEN;;

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

function xhrRequest(url, method, headers, query, data) {
	let res;
	request({
		url: url,
		qs: query,
		method: method,
		headers: headers,
		json: data
	}, (error, response, body) => {
		res = body;
		// if (error) {
		// 	console.log('Error sending messages: ', error)
		// } else if (response.body.error) {
		// 	console.log('Error: ', response.body.error)
		// } else if (response.body) {
		// 	console.log("body responseed" + response.body);
		// }
	});
	return res;
}

function handleResponse(sender, text) {
	let messageData;
	const header = {
		headers: {
			"Authorization": witToken
		}
	}
	const xhrResult = xhrRequest('https://api.wit.ai/entities/type_of_4?v=20180602', 'GET', header)
	var resObj = JSON.parse(text);
	console.log(resObj.entities);
	if (_.isEmpty(resObj.entities)) {
		messageData = {
			text: "Tôi sợ rằng đéo hiểu những gì bạn nói, tôi có giúp gì cho bạn :D"
		}
	} else {
		var filterRes = resObj.entities.intent.filter((item) => {
			return item.value = 'greeting'
		});
		if (_.has(resObj.entities, 'list'))
			messageData = {
				text: `mặt hàng hiện tai chúng tôi đang có:
			${()=>{
				for (let i = 0; i < xhrRequest.values.length; i++) {
					xhrRequest.values[i].value + ` `;
				}
			}}`
			}
		else if (filterRes !== undefined) {
			messageData = {
				text: 'chào bạn ༼-つ-◕_◕-༽つ  mình có thể giúp gì cho bạn'
			}
		}
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
		// if (error) {
		// 	console.log('Error sending messages: ', error)
		// } else if (response.body.error) {
		// 	console.log('Error: ', response.body.error)
		// } else if (response.body) {
		// 	console.log("body responseed" + response.body);
		// }
	})
}

function answerResponse(sender, text) {

	request({
		url: "https://api.wit.ai/message?",
		qs: {
			"v": "20180602",
			"q": text
		},
		method: "GET",
		headers: {
			"Authorization": witToken
		}
	}, (error, response, body) => {
		if (body) {
			handleResponse(sender, body);
		}
		// } else if (error) {
		// 	console.log("error when invoke wit.ai: " + error);
		// } else if (response.body.error) {
		// 	console.log("error when invoke wit.ai: " + response.body.error);
		// }
	})
}

app.listen(app.get('port'), function () {
	console.log('running on port', app.get('port'))
})