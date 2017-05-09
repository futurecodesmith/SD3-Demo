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

function createStream() {
    function ranNum() {
        return Math.floor(Math.random() * 10);;
    }
    function newArray() {
        for (let i = 0; i < array.length; i += 1) {
            array[i].randNum = ranNum();
        }
    }

    let array = [
        { id: 0, randNum: 7 },
        { id: 1, randNum: 6 },
        { id: 2, randNum: 3 },
        { id: 3, randNum: 9 },
        { id: 4, randNum: 9 },
        { id: 5, randNum: 5 },
        { id: 6, randNum: 7 }];

    setInterval(newArray, 1000);

    return array;
}


myData = createStream();

//____________________connect to lib / sockets___________________________________

let config = {
  setWidth: 700,
  setHeight: 500,
  text: 'id',
  volume: 'randNum',
};

let fauxStream = new streamline(server);

fauxStream.connect((socket) => {
  fauxStream.bubbleGraph(socket, myData, config);
});


server.listen(process.env.PORT || 3000, () => console.log('SERVER RUNNING ON 3000'));

