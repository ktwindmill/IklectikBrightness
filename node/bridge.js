import { Client } from 'node-osc';
import { Server } from 'node-osc';
import { WebSocketServer } from "ws";

const server = new WebSocketServer({ port: 8090 });
let isConnected = false;
let oscServer, oscClient;

server.on("connection", (socket) => {
	console.log("connected");

	if (isConnected) {
		console.log("Close OSC");
		if(oscServer)oscServer.close();
		if(oscClient)oscClient.close();
	}

	// receive a message from the client
	socket.on("message", (data) => {
		const packet = JSON.parse(data);

		switch (packet.type) {
			case "hello from client":
				console.log(hello);
				break;
			case "config":
				isConnected = true;
				let config = packet.content;
		
				oscServer = new Server(config.server.port, config.server.host, () => {
					console.log('OSC Server is listening');
				});
		
				oscClient = new Client(config.client.host, config.client.port);
				oscClient.send('/status', socket.sessionId + ' connected');
		
				oscServer.on('message', function (msg) {
					console.log(`Message: ${msg}`);
					socket.send(JSON.stringify({
						type: "oscMessage",
						content: msg
					}));
				});
		
				socket.send(JSON.stringify({
					type: "hello from server",
					content: [ 1, "2" ]
				}));
				break;
			case "oscMessage":
				console.log("oscMessage", packet.content);
				oscClient.send(packet.content[0], packet.content[1]);
				break;
			default:
				console.log("error");
			//	oscClient.send.apply(oscClient, obj);
				break;
		}
	});


	socket.on('close', function close() {
		console.log("disconnect");
		if (isConnected) {
			isConnected = false;
			if(oscServer)oscServer.close();
			if(oscClient)oscClient.close();
		}
	  });

});

