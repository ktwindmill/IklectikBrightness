// Learning Processing
// Daniel Shiffman
// http://www.learningprocessing.com

// Example 16-11: Simple color tracking

// A variable for the color we are searching for.
//let trackColor; 


let closestColorX = 0;
let closestColorY=0;
let c;
let b;
let count;
let col;
let arrayOfNumbers = [];
let threshold;
let arrayOfTextObjects = ['this', 'that', 'those', 'there', 'here', 'them', 'these', 'everything', 'everyone', 'nothing'];
// let arrayOfTextActions = ['take','touch','travel','stop','stop','swallow','halve','reverse','count','melt','hold'];
let arrayOfTextActions;// = ['clock','magnetic','it','the','and','this','wheel','machines','most','fits','windmills'];
let instructions;
let zones;
let newString;

//serial communication
let serial;
let portName = "/dev/tty.usbmodem1411";
let inData; 
let outByte = 0;
let counter = 0;

var socket;
var isConnected = false;
let oscHubIP = '10.100.9.204';


//text generation
let lines;

//markov generator object
let markov;

//output element
let output;


let deviceList = [];


function getDevices(devices) {
  // console.log(devices); // To see all devices
  arrayCopy(devices, deviceList);
  for (let i = 0; i < devices.length; ++i) {
    let deviceInfo = devices[i];
    if (deviceInfo.kind == 'videoinput') {
      console.log("Device name :", devices[i].label);
      console.log("DeviceID :", devices[i].deviceId);
    }
  }
}



function preload() {
  //preload zone mapping
  img = loadImage('testMap.png');
    
  //preload seed data
  // lines = loadStrings('clockwork.txt');
  lines = loadStrings('etiqutte.txt');
  navigator.mediaDevices.enumerateDevices().then(getDevices);

}


function setup() {

  let constraints = {
    video:
    {
    }
  };
  // canvas = createCanvas(width, height);
  background(255);
  // video = createCapture(constraints);
  // console.log(deviceList);
  // for (let x = 0; x < deviceList.length; x++) {
  //   console.log(deviceList[x]);
  // }

  createCanvas(640, 240);

  //video set up
  frameRate(60);
  colorMode(HSB, 255);
  pixelDensity(1);
  // video = createCapture({video:{deviceId:"0x100000954"}});
  video = createCapture(VIDEO);
  video.size(320,240);
  // The above function actually makes a separate video
  // element on the page.  The line below hides it since we are
  // drawing the video to the canvas
  //video.hide();
     
  threshold = 200;
    
  col = color('rgb(255, 0, 0)');
       
  //serial set up
  serial = new p5.SerialPort();
  serial.on('error',serialError);
  serial.open(portName);   
    
  //osc set up
  //setupOsc(input, output);
  setupOsc(6666, 9999);
    
    //debugging
  count = 0;
    
    
    
  //markov generator
  // Join everything together in one long string
  // Keep carriage returns so these will show up in the markov generator
  let text = lines.join('\n').toLowerCase();
  // let beginWords = arrayOfTextActions.join('\n');
  

  text = text.replace(/[0-9]/g, "");
  text = text.replace(/[\-\/#!$%\^&\*;:{}=\-_~()@\+\?><\[\]\+]/g, "");
  // text = text.replace(/\s{2,}/g," ");
  console.log(text);
  // N-gram length and maximum length
  markov = new MarkovGenerator(10, 150);
  arrayOfTextActions = markov.seedBeginnings(text);
  console.log(arrayOfTextActions);
  markov.feed(text);
  // markov.feed(beginWords);
  console.log(markov);
    
    
}

function draw() {
    
    

  // Draw the video
  image(video,0,0,320,240);
  image(img, width/2, 0);

    
    
    
  // if (frameCount % 120 == 0 ) { // if the frameCount is divisible by 60, then a second has passed. it will stop at 0

    counter++;
    
    closestColorX = 0;
    closestColorY = 0;
    count = 0;
    
  
    for(let x = 0; x < 320; x+=2){
      for(let y = 0; y < 240; y+=2){
      
        c = video.get(x,y);
        b = brightness(c);
      // console.log(x);
        
        if(b>threshold){
          closestColorX += x;
          closestColorY += y;
          count++;
        }
        
      }
    }
  
    if (count > 0) {
            closestColorX = closestColorX / count;
            closestColorY = closestColorY / count;
    }
 
    // fill(col);
    // ellipse(closestColorX,closestColorY, 50);
    // ellipse(closestColorX+320,closestColorY, 50);

    let mapC = img.get(closestColorX,closestColorY);
         

         
    let textCoordX = int(map(closestColorX, 0, 320, 0,9));
  // console.log(textCoordX);
    
    let textCoordY = int(map(closestColorY, 0, height, 0,9));

    console.log(frameCount, frameRate());
  
  if (frameCount % 120 == 0 ) {
    if(mapC[0] == 0){
        
      let tempString = arrayOfTextActions[textCoordX]+' '+arrayOfTextObjects[textCoordY]+' '+'eye';
        console.log(tempString);
        
        generate(arrayOfTextActions[textCoordX]);
        newString += " eye";
        serial.write(newString);
        createP(newString);
        
        if(isConnected){
          sendOsc('/eye',newString);
          // console.log('eye');
        }
      }
          
      if(mapC[0] == 88){
        let tempString = arrayOfTextActions[textCoordX]+' '+arrayOfTextObjects[textCoordY]+' '+'ear';
          console.log(tempString);
          generate(arrayOfTextActions[textCoordX]);
          newString += " ear";
          serial.write(newString);
          createP(newString);
              
        // generate(tempString);
          
          if(isConnected){
          sendOsc('/eye',newString);
        // console.log('eye');
        }
      }
         
      if(mapC[0] == 255){
          
        let tempString = arrayOfTextActions[textCoordX]+' '+arrayOfTextObjects[textCoordY]+' '+'stomach';
          console.log(tempString);
          generate(arrayOfTextActions[textCoordX]);
          newString += " stomach";
          serial.write(newString);
          createP(newString);
              
          //generate(tempString);
          
          if(isConnected){
          sendOsc('/eye',newString);
        // console.log('eye');
        }
          
      }
      
        //  console.log(counter);
         
        
         
     }
       
    
   // if(isConnected){
//    sendOsc('/eye',50);
  //  } 


      fill(col);
      ellipse(closestColorX,closestColorY, 50);
      ellipse(closestColorX+320,closestColorY, 50);

}


//Display in the console.log the fortune message and send it to the serial port
function mousePressed() {
  
 let message = "hello"; 
  
   // let r = int(random(0, words.length-1));
   // let msg = words[];
    let msg = closestColorX;
    console.log(msg);
  
  console.log(message);
  serial.write(message);
    
   // console.log(arrayOfTextObjects[1]);
    
}


function keyPressed(){
    
    if (value === 0) {
        
        let bodyPart = '!eye'
        
    }
    
    if (value === 2){
        
        let instruction = 'eye'
    }
}


function serialError(err){
  console.log(err);
}


function receiveOsc(address, value) {
	console.log("received OSC: " + address + ", " + value);

	if (address == '/test') {
		x = value[0];
		y = value[1];
	}
}

function sendOsc(address, value) {
	socket.emit('message', [address].concat(value));
}

function setupOsc(oscPortIn, oscPortOut) {
  socket = io.connect('http://127.0.0.1:8090', { port: 8090, rememberTransport: false });
	socket.on('connect', function() {
		socket.emit('config', {
			server: { port: oscPortIn,  host: '127.0.0.1'},
			client: { port: oscPortOut, host: oscHubIP}
		});
        
           isConnected = true;
        
	});
	socket.on('message', function(msg) {
		if (msg[0] == '#bundle') {
			for (var i=2; i<msg.length; i++) {
				receiveOsc(msg[i][0], msg[i].splice(1));
			}
		} else {
			receiveOsc(msg[0], msg.splice(1));
		}
	});
}


function generate(beg) {
  // Generate some text
  let result = markov.generate(beg);
  // Put in HTML line breaks wherever there was a carriage return
  result = result.replace('\n','<br/><br/>');
  newString = result;

}


//to do:
//create a threshold adjusty function
  