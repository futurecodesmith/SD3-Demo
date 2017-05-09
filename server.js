const express = require('express');
const app = express();
const server = require('http').createServer(app);
const path = require('path');
const RTM = require("satori-sdk-js");
const streamline = require('./lib/index.js');
const dotenv = require('dotenv');

dotenv.load()

//---------------SEND CLIENT FILES-----------------------
app.use(express.static(path.join(__dirname, 'client')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/home-page.html'));
});


//----------------sockets--------------------------
// const WebSocket = require('ws');
// const wsEvents = require('ws-events');
// const wss = new WebSocket.Server({ server });
// let connections = [];

// wss.on('connection', function connection(ws) {
//   connections.push(ws);
//   console.log('CONNECTED: %s SOCKETS CONNECTED', connections.length)

//   ws.on('close', (data) => {
//     connections.splice(connections.indexOf(ws), 1);
//     console.log('CONNECTED: %s SOCKETS CONNECTED', connections.length);
//   });

//   const events = wsEvents(ws);
  
//   events.on('send audioText', (data) => {
//     console.log('DATA GOTTEN IN SERVER', data);
//     events.emit('send audioData', data);
//   });

// });


//______________GET DATA____________________________________

let myData = [];
let myData2 = [];
var endpoint = "wss://open-data.api.satori.com";
var appKey = "9BABD0370e2030dd5AFA3b1E35A9acBf";
var channel = "US-Bike-Sharing-Channel";
let counter = 0;

var rtm = new RTM(endpoint, appKey);
rtm.on("enter-connected", function () {
  console.log("Connected to RTM!");
});

var subscription = rtm.subscribe(channel, RTM.SubscriptionMode.SIMPLE);
subscription.on('rtm/subscription/data', function (pdu) {
  pdu.body.messages.forEach(function (msg) {

    if (msg.station_id < 300) {
      msg.counter = counter++;
      myData.push(msg);

      if (myData.length > 20) {
        myData.shift();
      }
    }
    
    if (msg.station_id < 250) {
      msg.counter2 = Math.random() * 19; 
      myData2.push(msg);

      if (myData2.length > 20) {
        myData2.shift();
      }
    }

  });

});

rtm.start();


//____________________connect to lib / sockets___________________________________

let config = {
  setWidth: 700,                   
  setHeight: 500,                  
  shiftXAxis: true,
  xDomainUpper: 20,
  xDomainLower: 0,                
  yDomainUpper: 40,
  yDomainLower: 0,                  
  xTicks: 10,
  yTicks: 10,                  
  xScale: 'counter',              
  yScale: 'num_bikes_available',
  xLabel_text: '',
  yLabel_text: ''
};

let config2 = {
  setWidth: 700,                   
  setHeight: 500,                  
  shiftXAxis: true,
  xDomainUpper: 20,
  xDomainLower: 0,                
  yDomainUpper: 40,
  yDomainLower: 0,                  
  xTicks: 10,
  yTicks: 10,                  
  xScale: 'counter2',              
  yScale: 'num_bikes_available',
  xLabel_text: '',
  yLabel_text: ''
};

let bikeStream = new streamline(server);

bikeStream.connect((socket) => {
  bikeStream.line(socket, myData, config);
  bikeStream.scatter(socket, myData2, config2);
  bikeStream.wordCloud(socket);
});


server.listen(process.env.PORT || 3000, () => console.log('SERVER RUNNING ON 3000'));

