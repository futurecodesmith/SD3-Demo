
class Streamline {
	constructor(server) {
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
			
			func(ws);

		});

	}

	wordCloud(socket) {
		const events = this.wsEvents(socket);

		events.on('sendAudioText', (data) => {
			console.log('data from audio', data);
			events.emit('sendAudioData', data);
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