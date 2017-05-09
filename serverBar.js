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
  res.sendFile(path.join(__dirname, 'client/index.html'));
}, () => {
  console.log('sending js...');
  res.sendFile('../../lib/graphs/line.js')
});


//______________GET DATA____________________________________

let myData = [];

var endpoint = "wss://open-data.api.satori.com";
var appKey = "8dbA7c1BDBaAB887CeC3c3aeAF69e0e5";
var channel = "nyc-traffic-speed";

var rtm = new RTM(endpoint, appKey);
rtm.on("enter-connected", function() {
  console.log("Connected to RTM!");
});

var subscription = rtm.subscribe(channel, RTM.SubscriptionMode.SIMPLE);
subscription.on('rtm/subscription/data', function (pdu) {
  pdu.body.messages.forEach(function (msg) {
    
    let found = false;
    for(let i = 0; i < myData.length; i += 1) {
      if( myData[i].Borough === msg.Borough) {
        myData[i].Speed = (Number(myData[i].Speed) + Number(msg.Speed)) / 2;
        found = true;
      }
    }

    msg.Speed = Number(msg.Speed);
    if(!found) myData.push(msg);

  });
});

rtm.start();

setInterval(()=>{console.log(myData, 'LEN: ', myData.length)}, 3000);
//____________________connect to lib / sockets___________________________________

let config = {
  setWidth: 700,                   
  setHeight: 500,                  
  shiftYAxis: true,
  xDomainUpper: 20,
  xDomainLower: 0,                
  yDomainUpper: 40,
  yDomainLower: 0,                  
  xTicks: 10,
  yTicks: 10,                  
  xScale: 'Borough',              
  volume: 'Speed',
  xLabel_text: 'x axis label',
  yLabel_text: 'y axis label',
  color: ['#DAF7A6', '#FFC300', '#FF5733', '#C70039', '#900C3F', '#581845'],
};

let trafficStream = new streamline(server);

trafficStream.connect((socket) => {
  console.log('MY DATA LEN ', myData.length);
  trafficStream.bar(socket, myData, config);
});


server.listen(process.env.PORT || 3000, () => console.log('SERVER RUNNING ON 3000'));

