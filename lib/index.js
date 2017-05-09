
class Streamline {
	constructor(server) {
		//this.io = require('socket.io').listen(server);
		this.WebSocket = require('ws');
		this.wsEvents = require('ws-events');
		//this.wss = new this.WebSocket.Server({ server });
		this.server = server;
		this.connections = [];
	}

	connect(func) {
		let wss = new this.WebSocket.Server({ server: this.server });
		wss.on('connection', (ws) => {
			this.connections.push(ws);
			console.log('CONNECTED: %s SOCKETS CONNECTED', this.connections.length)

			ws.on('close', (data) => {
				this.connections.splice(this.connections.indexOf(ws), 1);
				console.log('CONNECTED: %s SOCKETS CONNECTED', this.connections.length);
			});
			
			return func(ws);

		});
		// this.io.sockets.on('connection', (socket) => {
		// 	let newSocket = socket;
		// 	this.connections.push(socket);
		// 	console.log('CONNECTED: %s SOCKETS CONNECTED', this.connections.length)

		// 	socket.on('disconnect', (data) => {
		// 		this.connections.splice(this.connections.indexOf(socket), 1);
		// 		console.log('CONNECTED: %s SOCKETS CONNECTED', this.connections.length);
		// 	});
		// })
	}

	wordCloud(socket) {
		const events = this.wsEvents(socket);

		events.on('send audioText', (data) => {
			console.log('data from audio', data);
			events.emit('send audioData', data);
		});
	}

	line(socket, data, config) {

		let emitData = [];
		let emitConfig = {};

		let refConfig = {
			setWidth: 700,
			setHeight: 500,
			shiftXAxis: true,
			xDomainUpper: 20,
			xDomainLower: 0,
			yDomainUpper: 40,
			yDomainLower: 0,
			xTicks: 10,
			yTicks: 10,
			xScale: '',
			yScale: '',
			xLabel_text: '',
			yLabel_text: ''
		};

		for (let key in config) {
			refConfig[key] = config[key];
		}

		setInterval(() => {
			for (let i = 0; i < data.length; i += 1) {
				emitConfig = Object.assign({}, refConfig);

				emitConfig.xScale = data[i][emitConfig.xScale];
				emitConfig.yScale = data[i][emitConfig.yScale];

				emitData.push(emitConfig);
			}
			if (emitData.length >= emitConfig.xDomainUpper) {
				emitData = emitData.slice(-(emitConfig.xDomainUpper));
			}

			const events = this.wsEvents(socket);

			events.emit('sendLineData', emitData);
			emitData = [];
		}, 1000);
	}


	scatter(socket, data, config) {

		let emitData = [];
		let emitConfig = {};

		let refConfig = {
			setWidth: 700,
			setHeight: 500,
			shiftXAxis: false,
			xDomainUpper: 20,
			xDomainLower: 0,
			yDomainUpper: 40,
			yDomainLower: 0,
			xTicks: 10,
			yTicks: 10,
			xScale: '',
			yScale: '',
			xLabel_text: '',
			yLabel_text: ''
		};

		for (let key in config) {
			refConfig[key] = config[key];
		}

		setInterval(() => {
			for (let i = 0; i < data.length; i += 1) {
				emitConfig = Object.assign({}, refConfig);

				emitConfig.xScale = data[i][emitConfig.xScale];
				emitConfig.yScale = data[i][emitConfig.yScale];

				emitData.push(emitConfig);
			}
			if (emitData.length >= emitConfig.xDomainUpper) {
				emitData = emitData.slice(-(emitConfig.xDomainUpper));
			}
			
			const events = this.wsEvents(socket);

			events.emit('sendScatterData', emitData);
			emitData = [];
		}, 1000);
	}
	


}

module.exports = Streamline;