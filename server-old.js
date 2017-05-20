const express = require('express');
const app = express();
const server = require('http').createServer(app);
const path = require('path');
const RTM = require("satori-sdk-js");
const streamline = require('./lib/index-old.js');
const dotenv = require('dotenv');

dotenv.load()

//---------------SEND CLIENT FILES-----------------------
app.use(express.static(path.join(__dirname, 'client')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/home-page.html'));
});


//______________GET DATA____________________________________

const endpoint = "wss://open-data.api.satori.com";
const appKey = "34DF1ecf6B793beA053a60aa1cdDdC2C";
const channelBike = "US-Bike-Sharing-Channel";
const channelTraffic = "nyc-traffic-speed";
const channelTV = "tv-commercial-airings";
const channelNASA = 'satellites';
const channelTwitter = "Twitter-statuses-sample";

let scatterData = [];
let lineData = [];
let barData = [];
let bubbleData = [];
let pieData = [];
let cacheTV = {};
let counterLine = 0;
let counterBubble = 0;
let cacheMap = {};
let mapData = [];

let scatterQueue = [];
let lineQueue = [];
let barQueue = [];
let bubbleQueue = [];
let pieQueue = [];
let mapQueue = [];
//-------------------------------------

let rtm = new RTM(endpoint, appKey);
rtm.on("enter-connected", function () {
  console.log("Connected to RTM!");
});

let subscriptionBike = rtm.subscribe(channelBike, RTM.SubscriptionMode.SIMPLE);
subscriptionBike.on('rtm/subscription/data', function (pdu) {
  pdu.body.messages.forEach(function (msg) {

    //line chart data
    if (msg.station_id < 300) {
      msg.counter = counterLine++;
      lineQueue.push(msg);

      if (lineQueue.length > 200) {
        lineQueue.shift();
      }
    }

    // bubble chart data 
    if (msg.station_id < 300) {
      msg.counter = counterBubble++;
      let idExists = false;

      for (let i = 0; i < bubbleData.length; i += 1) {
        if (bubbleData[i].station_id === msg.station_id) {
          bubbleData[i] = Object.assign({},msg);
          idExists = true;
        }
      }

      if (!idExists) bubbleData.push(msg);
      if (bubbleData.length > 30) bubbleData.shift();
    };
  });
});

let subscriptionTraffic = rtm.subscribe(channelTraffic, RTM.SubscriptionMode.SIMPLE);
subscriptionTraffic.on('rtm/subscription/data', function (pdu) {
  pdu.body.messages.forEach(function (msg) {

    //bar data 

      if (msg.Borough === 'Staten island') msg.Borough = 'Staten Island';
      if (barQueue.length < 100) barQueue.push(msg);

  });
});

let subscriptionTV = rtm.subscribe(channelTV, RTM.SubscriptionMode.SIMPLE);
subscriptionTV.on('rtm/subscription/data', function (pdu) {
  pdu.body.messages.forEach(function (msg) {

    if (!cacheTV[msg.genre]) {
      cacheTV[msg.genre] = 1;
      msg.count = cacheTV[msg.genre];
    } else {
      cacheTV[msg.genre] = cacheTV[msg.genre] + 1;
      msg.count = cacheTV[msg.genre];
    }

    let found = false;
    for (let i = 0; i < pieData.length; i++) {
      if (pieData[i].genre === msg.genre) {
        pieData[i] = Object.assign({}, msg);
        found = true;
        break;
      }
    }
    if (!found) {
      pieData.push(msg);
      if (pieData.length > 15) pieData.shift();
    };
  })
});
function decDegrees(string) {
  let result = string.split(':');
  let degrees = Number(result[0]);
  let minutes = Number(result[1]);
  let seconds = Number(result[2]);

  let minSec = minutes + seconds / 60;
  let decimalDegrees = (degrees + minSec / 60).toFixed(3);

  return decimalDegrees;
}
let nasaCounter = 0;


let subscriptionNASA = rtm.subscribe(channelNASA, RTM.SubscriptionMode.SIMPLE);
subscriptionNASA.on('rtm/subscription/data', function (pdu) {
  pdu.body.messages.forEach(function (msg) {
    nasaCounter += 1;

    if (mapData.length < 60 || nasaCounter % 200 === 0) {
      let lat = decDegrees(msg.latitude);
      let lon = decDegrees(msg.longitude);

      msg.latitude = lat;
      msg.longitude = lon;

      if (!cacheMap[msg.satellite]) {
        cacheMap[msg.satellite] = true;
        mapData.push(msg);
      }
      //else if already in cache, put new msg in in place of old
      else {
        for (let i = 0; i < mapData.length; i++) {
          if (mapData[i].satellite === msg.satellite) {

            mapData[i] = Object.assign({},msg);
          }
        }
      }
    }

    if(nasaCounter > 1500) nasaCounter = 0;

  });
  // console.log('MAP DATA LEN: ', mapData.length);
});


//SCATTER DATA -- TWITTER
let subscriptionTwitter = rtm.subscribe(channelTwitter, RTM.SubscriptionMode.SIMPLE);
subscriptionTwitter.on('rtm/subscription/data', function (pdu) {
  pdu.body.messages.forEach(function (msg) {

    if (msg.created_at && msg.user.time_zone === 'Pacific Time (US & Canada)' && msg.lang === 'en') {
      let obj = {
        followers_count: msg.user.followers_count,
        favourites_count: msg.user.favourites_count,
        statuses_count: msg.user.statuses_count,
        time_zone: msg.user.time_zone,
        text: msg.text,
        created_at: msg.created_at,
        id: msg.id,
        screen_name: msg.user.screen_name
      }
      scatterQueue.push(obj);

      if (scatterQueue.length > 20) {
        scatterQueue.shift();
      }
    }
  });
});




//____________________CONFIGURATION FILES___________________________________

let lineConfig = {
  setWidth: 700,
  setHeight: 500,
  shiftXAxis: true,
  xDomainUpper: 50,
  xDomainLower: 0,
  yDomainUpper: 40,
  yDomainLower: 0,
  xTicks: 10,
  yTicks: 10,
  xScale: 'counter',
  yScale: 'num_bikes_available',
  xLabel_text: 'at the currently reporting station',
  yLabel_text: 'number of available bikes',
  lineColor: '#5176B6',
  dotColor: 'DodgerBlue'
};

let scatterConfig = {
  setWidth: 600,
  setHeight: 400,
  xDomainUpper: 1500,
  xDomainLower: 0,
  yDomainUpper: 20000,
  yDomainLower: 0,
  xTicks: 10,
  yTicks: 10,
  id: 'screen_name',
  xLabel_text: 'number of followers',
  yLabel_text: 'number of tweets',
  label_font_size: 13,
  xScale: 'followers_count',
  yScale: 'statuses_count',
  volume: 'favourites_count',
  circle_text: '',
  transition_speed: 5000,
};

let wordCloudConfig = {
  colors: ['#FB3640', '#605F5E', '#1D3461', '#1F487E', '#247BA0'],
  colorDomain: [5, 20, 40, 60, 100],
  font: 'Source Sans Pro',
  fontSize: 40,
  padding: 10,
  rotate: 0,
  height: 600,
  width: 2000,
}

let barConfig = {
  setWidth: 800,
  setHeight: 400,
  shiftYAxis: true,
  xDomainUpper: 20,
  xDomainLower: 0,
  yDomainUpper: 50,
  yDomainLower: 0,
  xTicks: 10,
  yTicks: 50,
  xScale: 'Borough',
  volume: 'Speed',
  yLabel_text: 'Miles Per Hour',
  label_text_size: 13,
  transition_speed: 1000,
  color: ['#DAF7A6', '#FFC300', '#FF5733', '#C70039', '#900C3F', '#581845'],
};

let bubbleConfig = {
  setWidth: 600,
  setHeight: 400,
  text: 'num_bikes_available',
  volume: 'num_bikes_available',
  color: '#63d198'
};

let pieConfig = {
  setWidth: 600,
  setHeight: 525,
  category: 'genre',//category to be show in pie slices
  count: 'count'
};

let mapConfig = {
  setWidth: 1300,
  setHeight: 800,
  latitude: 'latitude',
  longitude: 'longitude',
  mapItem: 'satellite', //the thing being mapped
  propTwo: '',
  color: '#B0C4DE'
};

//_________________________QUEUE________________________________

setInterval(() => {
  if (lineQueue.length > 0) {
    lineData.push(lineQueue.shift());
    if (lineData.length > 50) lineData.shift();
  }

  if (scatterQueue.length > 0) {
    scatterData.push(scatterQueue.shift());
    if (scatterData.length > 100) scatterData.shift();
  }

  if (barQueue.length > 0) {
    let freshData = barQueue.shift();

    let found = false;
    for (let i = 0; i < barData.length; i += 1) {
      if (barData[i].Borough === freshData.Borough) {
        barData[i].Speed = (Number(barData[i].Speed) + Number(freshData.Speed)) / 2;
        found = true;
      }
    }

    freshData.Speed = Number(freshData.Speed);
    if (!found) barData.push(freshData);
  }
}, 800);

//---------------------------------CALL STREAMLINE FUNCTION------------------------------------

let myStream = new streamline(server);

myStream.connect((socket) => {
  myStream.line(socket, lineData, lineConfig);
  myStream.scatter(socket, scatterData, scatterConfig);
  myStream.wordCloud(socket, wordCloudConfig);
  myStream.bar(socket, barData, barConfig);
  myStream.bubbleGraph(socket, bubbleData, bubbleConfig);
  myStream.pie(socket, pieData, pieConfig);
  myStream.map(socket, mapData, mapConfig);
  // // console.log('CONNECT LENGTH: ',myStream.connections.length);
  //   console.log('START: ', rtm.start);
  if (myStream.connections.length === 1) rtm.start();

  socket.on('SEND_CLOSE', (data) => {
    
    setTimeout(() => {
      if (myStream.connections.length === 0) {
        rtm.stop()

        console.log('stopped RTM');
      };
    }, 50)

  })
});