var osc = require('node-osc');
var io = require('socket.io')(8090);


var oscServer, oscClient;

var isConnected = false;

io.sockets.on('connection', function (socket) {
	console.log('connection');

	if (isConnected) {
		console.log("Close OSC");
		if(oscServer)oscServer.kill();
		if(oscClient)oscClient.kill();
	}


	socket.on("config", function (obj) {
		isConnected = true;
    	oscServer = new osc.Server(obj.server.port, obj.server.host);
	    oscClient = new osc.Client(obj.client.host, obj.client.port);
	    oscClient.send('/status', socket.sessionId + ' connected');
		oscServer.on('message', function(msg, rinfo) {
			console.log(msg);
			socket.emit("message", msg);
		});
		socket.emit("connected", 1);
	});
 	socket.on("message", function (obj) {
		oscClient.send.apply(oscClient, obj);
  	});
	socket.on('disconnect', function(){
		console.log("disconnect");
		if (isConnected) {
			isConnected = false;
			oscServer.kill();
			oscClient.kill();
		}
  	});
});