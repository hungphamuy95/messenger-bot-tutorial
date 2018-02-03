

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

app.set('port', (process.env.PORT))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// parse application/json
app.use(bodyParser.json())

// index
app.get('/', function (req, res) {
	res.send('test continuous integration ');
	console.log("what the fuck");
})

// for facebook verification
app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
		res.send(req.query['hub.challenge']);
		console.log("success");
	} else {
		res.send('Error, wrong token')
	}
})

// to post data
app.post('/webhook/', function (req, res) {
	console.log(req.body.entry[0].messaging);
	let messaging_events = req.body.entry[0].messaging
	for (let i = 0; i < messaging_events.length; i++) {
		let event = req.body.entry[0].messaging[i]
		let sender = event.sender.id
		if (event.message && event.message.text) {
			let text = event.message.text
			sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200));
		}
		if(event.message && event.message.attachments){
			let text = event.message.text
		 	let url=event.message.attachments[0].payload.url;
		 	detectImage(sender, text, url);
		 	// sendTextMessage(sender, textResponse);
		 }
		if (event.postback) {
			let text = JSON.stringify(event.postback)
			sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token);
			continue
		}
	}
	res.sendStatus(200)
})


// recommended to inject access tokens as environmental variables, e.g.
// const token = process.env.FB_PAGE_ACCESS_TOKEN
const token = process.env.FB_PAGE_ACCESS_TOKEN;

function sendTextMessage(sender, text) {
	let messageData = { text:text }
	
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {
			access_token: token,
		  },
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
		else if(response.body){
			console.log("body responseed"+response.body);
		}
	})
}

function covertGender(gender){
	if(gender==="male"){
		return "nam";
	}else{
		return "nũ";
	}
}

function sendTextImage(sender, text, resReg){
	let messageData;
	if(resReg.length>1){
	messageData={text:"trong ảnh có nhiều hơn một người"}
	}
	else if(resReg.length==0){
		messageData={text:"trong ảnh không có hiện mặt người"}
	}
	else{
	 messageData = { text: "người này "+Math.round(resReg[0].faceAttributes.age)+", giới tính "+covertGender(resReg[0].faceAttributes.gender)+"" }
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {
			access_token: token,
		  },
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		console.log(body);
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
		else if(response.body){
			console.log("body responseed"+response.body);
		}
	})
}

function detectImage(sender, text, imageUrl){
	console.log(imageUrl);
	const subcriptionId = process.env.SUBCRIPTION_ID;
	request({
	 	url:"https://southeastasia.api.cognitive.microsoft.com/face/v1.0/detect?",
	 	qs:{
	 	 	"returnFaceId": "true",
              "returnFaceLandmarks": "false",
              "returnFaceAttributes": "age,gender",
	 	},
	 	method:'POST',
	 	headers:{
	 		"Content-Type":"application/json",
	 		"Ocp-Apim-Subscription-Key":subcriptionId
	 	},
	 	json:{
	 		"url": imageUrl
	 	}
	 },(error, response, body)=>{
	 	if(body){
			 sendTextImage(sender, text, body);
		 }
	 	 else if(error){
			 console.log("Error When calling cognitive service" + error);
		 }
		 else if(response.body.error){
			 console.log("Error When calling cognitive service"+response.body.error);
		 }
	 });
}

app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})
