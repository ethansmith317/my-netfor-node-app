const { WebClient } = require('@slack/web-api');
const express = require('express');
const bodyParser = require('body-parser');
var https = require("https");
var call_back;
var ts;

const app = express()
const port = 3000

app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

console.log('Getting started with Node Slack SDK');

// Create a new instance of the WebClient class with the token read from your environment variable
const web = new WebClient(process.env.SLACK_TOKEN);
// The current date
const currentTime = new Date().toTimeString();


function handler(req, res) {
  if (req.method === 'GET') {
    res.send('Get request received')
  } else if (req.method === 'POST') {
    checkTicket(req, res)
  }
}

app.get('/', (req, res) => handler(req, res))
app.post('/', (req, res) => handler(req, res))

// this is what actually listens at the port
app.listen(port, () => console.log(`Example app listening on port ${port}!`))


function checkTicket(req,res) {
// console.log(req.body.slack_timestamp);
// console.log(req.body.action_field);
  if (req.body.slack_timestamp) {
    if (req.body.action_field) {
      updateMessage(req.body,res)
    }
    else{

    }
      
  }
    else {
      buildSlackRequest(req.body, res)
    }

    console.log('checkticket complete');
}


async function updateMessage(update_body, update_response) {
  const token_response = await web.auth.test()
  const userId = token_response.user_id
// console.log(update_body.slack_timestamp);

const res = await web.chat.update({
  channel: "CQDCA5RFV",
  ts: update_body.slack_timestamp,
  "text": "id already present\nupdating message",
  "blocks": update_body.blocks,
});
// console.log(res);
console.log('messageupdate complete');

}


// function to send slack message
async function buildSlackRequest(zendesk_body, zendesk_response) {
  // Use the `auth.test` method to find information about the installing user
  const token_response = await web.auth.test()

  // Find your user id to know where to send messages to
  const userId = token_response.user_id
  
  // Use the `chat.postMessage` method to send a message from this app
  const res = await web.chat.postMessage({
    channel: "app-test",
    "text": "testing",
    "blocks": zendesk_body.blocks
    });
  
// won't need these 3 lines anymore once I switch to checking for TS
  // call_back = res.message.blocks[3].accessory.action_id;
  call_back = zendesk_body.ticketid;
  ts = res.ts;
  // console.log(call_back);



  console.log('great success');
  // console.log(ts)
  zendesk_response.send();

  postCallback();
}

function postCallback() {

  var options = {
      host: "sdsus1570214566.zendesk.com",
      path: "/api/v2/tickets/" + call_back + ".json",
      method: "PUT", 
      headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic " + new Buffer("info@clearobject.com:C1ear0bject").toString("base64")
      }
  };

  var req = https.request(options, function (res) {
    var responseString = "";

    res.on("data", function (data) {
        responseString += data;
        // save all the data from response
    });
    res.on("end", function () {
        // console.log(responseString); 
        // print to console when response ends
    });
});

var timestamp = "" + ts.toString();
var reqBody = '{"ticket" : {"external_id":"' + timestamp + '"}}'
req.write(reqBody);

req.end();

console.log('postcallback complete');
}


