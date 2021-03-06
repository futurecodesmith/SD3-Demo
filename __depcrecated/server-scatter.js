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


//______________GET DATA____________________________________

let myData = [];
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

    //console.log('MESSAGE DATA', msg);

    if (msg.station_id < 300) {
      msg.counter = Math.random() * 19;

      myData.push(msg);
      if(myData.length > 20) {
        myData.shift();
      };
    };
  })

});

rtm.start();


//____________________connect to lib / sockets___________________________________

let config2 = {
  setWidth: 700,                   
  setHeight: 500,                  
 // shiftXAxis: true,
  xDomainUpper: 20,
  xDomainLower: 0,                
  yDomainUpper: 40,
  yDomainLower: 0,                  
  xTicks: 10,
  yTicks: 10,                  
  xScale: 'counter',              
  yScale: 'num_bikes_available',
  xLabel_text: 'x axis label',
  yLabel_text: 'y axis label'
};

let bikeStream = new streamline(server);

bikeStream.connect((socket) => {
  bikeStream.scatter(socket, myData, config2);
});


server.listen(process.env.PORT || 4000, () => console.log('SERVER RUNNING ON 4000'));

