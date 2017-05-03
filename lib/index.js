
class Streamline {
    constructor(server) {
        this.io = require('socket.io').listen(server);
        this.connections = [];
    }

    connect(func) {
        this.io.sockets.on('connection', (socket) => {
            let newSocket = socket;
            this.connections.push(socket);
            console.log('CONNECTED: %s SOCKETS CONNECTED', this.connections.length)

            socket.on('disconnect', (data) => {
                this.connections.splice(this.connections.indexOf(socket), 1);
                console.log('CONNECTED: %s SOCKETS CONNECTED', this.connections.length);
            });
            return func(socket);
        })
    }

    line(socket, data, config) {
        let xScale;
        let yScale;
        let emitData = [];

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
        let emitConfig = {};
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

            socket.emit('sendStreamData', emitData);
            emitData = [];
        }, 1000);
    }
}

module.exports = Streamline;