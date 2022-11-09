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
let avgHue;
let avgBrightness;
let avgSat;
let count;
let col;
let workColor; //blue
let restColor; // red
let arrayOfNumbers = [];
let threshold;
//let arrayOfTextObjects = ['this', 'that', 'those', 'there', 'here', 'them', 'these', 'everything', 'everyone', 'nothing'];
//let arrayOfTextActions = ['take','touch','travel','stop','stop','swallow','halve','reverse','count','melt','hold'];
let earBeginnings = ['whisper to the ear, tell it ','tune the ear, ','what does it think if you tell it','speak up, say loudly to the ear ','shout - ','give it these instructions, tell the ear to '];
let stomachBeginnings = ['what can you see there in the stomach, can you ','remember, always ','when dealing with a digesting organ it is important to remember to, ', 'move the guts around, touch ','what do you make of it? go, react in the stomach lining ']
let mouthBeginnings = ['shh, listen to what the mouth is saying, move to its will ','the mouth is talking to you. ','pay attention, this is important, ','listen to the mouth, and tell it to the ear. repeat ','repeat what the mouth is saying with your body. consider ','can you tune the mouth baring in mind ']
let arrayOfTextActions = [];// = ['clock','magnetic','it','the','and','this','wheel','machines','most','fits','windmills'];
let textActionsIndex = 0;
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
  img = loadImage('IklectikMaps/V1.png');
    
  //preload seed data
  // lines = loadStrings('clockwork.txt');
  lines = loadStrings('cleancombined.txt');
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

  createCanvas(640, 480);

  //video set up
  frameRate(60);
  colorMode(HSB, 100);

  workColor = color(50,100,100); //blue
  restColor = color(0,100,100); // red
  noStroke();

  pixelDensity(1);
  // video = createCapture({video:{deviceId:"0x100000954"}});
  video = createCapture(VIDEO);
  video.size(320,240);
  // The above function actually makes a separate video
  // element on the page.  The line below hides it since we are
  // drawing the video to the canvas
  video.hide();
     
  threshold = 80;//200 under the 255 mode 
    
  col = color('hsb(0, 100%, 100%)');
       
  //serial set up
  serial = new p5.SerialPort();
  serial.on('error',serialError);
  serial.open(portName);   
    
  //osc set up
  //setupOsc(input, output);
  //setupOsc(6666, 9999);
    
  //debugging
  count = 0;
    
    
    
  //markov generator
  // Join everything together in one long string
  // Keep carriage returns so these will show up in the markov generator
  // let text = lines.join('\n').toLowerCase();
  // let beginWords = arrayOfTextActions.join('\n');
  
  let text = lines[0];
   
  //clean text
  //text = text.replace(/[0-9]/g, "");
  //text = text.replace(/[\-\.,/#"!$%\^&\*;:{}=\-_~()@\+\?><\[\]\+]/g, "");
  //text = text.replace(/\s{2,}/g," ");
  console.log(text);
  // N-gram length and maximum length
  markov = new MarkovGenerator(7, 15);
  // arrayOfTextActions = markov.seedNgramBeginnings(text);
  let tempArray = markov.seedBeginnings(text); //quick test of the structure
  arrayOfTextActions.push(tempArray);
  arrayOfTextActions.push(tempArray);
  console.log(arrayOfTextActions);
  // markov.feedNgrams(text);
  markov.feed(text);
  // markov.feed(beginWords);
  console.log(markov);
    
    
}

function draw() {
    
    

  // Draw the video
  image(video,0,0,320,240);
  image(img, width/2, 0, 320, 240);

    
    
    counter++;
    
    closestColorX = 0;
    closestColorY = 0;
    count = 0;
    avgHue = 0;
    avgBrightness = 0;
    avgSat = 0;
  
    for(let x = 0; x < 320; x+=2){
      for(let y = 0; y < 240; y+=2){
      
        c = video.get(x,y);
        b = brightness(c);
        avgHue += hue(c);
        avgBrightness += b;
        avgSat += saturation(c);
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

    //average of pixels sampled in nested for loop
    let numPix = (160 * 120)
    avgHue /= numPix; 
    avgBrightness /= numPix; 
    avgSat /= numPix;

    // fill(col);
    // ellipse(closestColorX,closestColorY, 50);
    // ellipse(closestColorX+320,closestColorY, 50);

    
    
    let mapC = img.get(closestColorX,closestColorY);
         

    //Left over code from when we were generating text from the brightness coordinates
    // let textCoordX = int(map(closestColorX, 0, 320, 0,9));
    // console.log(textCoordX);
    //let textCoordY = int(map(closestColorY, 0, height, 0,9));

  
  if (frameCount % 120 == 0 ) {
    if(mapC[0] == 0){
        
        //Left over code from when we were generating text from the brightness coordinates
        //let tempString = arrayOfTextActions[textCoordX]+' '+arrayOfTextObjects[textCoordY]+' '+'eye';
        //console.log(tempString);
        
        //STOMACH
        let tempIndex = int(random(arrayOfTextActions-1));
        let begIndex = int(random(stomachBeginnings.length-1));
        //console.log(begIndex);
        generate(arrayOfTextActions[textActionsIndex][tempIndex]);
        instructions = stomachBeginnings[begIndex] + newString;
        serial.write(instructions);
        createP(instructions);
        
        if(isConnected){
          sendOsc('/eye',newString);
          // console.log('eye');
        }
      }
          
      if(mapC[0] == 88){
        //let tempString = arrayOfTextActions[textCoordX]+' '+arrayOfTextObjects[textCoordY]+' '+'ear';
        //console.log(tempString);
          
          
        //  MOUTH
        let tempIndex = int(random(arrayOfTextActions-1));
        let begIndex = int(random(mouthBeginnings.length-1));
        //console.log(begIndex);
        generate(arrayOfTextActions[textActionsIndex][tempIndex]);
        instructions = mouthBeginnings[begIndex] + newString;
        serial.write(instructions);
        createP(instructions);
              
        // generate(tempString);
          
        if(isConnected){
        sendOsc('/eye',newString);
        // console.log('eye');
        }
      }
         
      if(mapC[0] == 255){
          
        //EAR
        let tempIndex = int(random(arrayOfTextActions-1));
        let begIndex = int(random(stomachBeginnings.length-1));
        //console.log(begIndex);
        generate(arrayOfTextActions[textActionsIndex][tempIndex]);
        instructions = earBeginnings[begIndex]+ newString;
        serial.write(instructions);
        createP(instructions);
              
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
      ellipse(closestColorX,closestColorY, 30);
      ellipse(closestColorX+320,closestColorY, 30);

   
      let avgCol = color(int(avgHue), int(avgSat), int(avgBrightness));
     console.log(int(avgHue), int(avgSat), int(avgBrightness));
      fill(avgCol);
      rect(0,240,320,240);

      fill(0,0,0);
      rect(320,240,320,240);

      fill(color(workColor._getHue(),int(avgSat), int(avgBrightness)));
      rect(320,240,320,20);

      // let distWork = dist(workColor._getHue(),workColor._getSaturation(),workColor._getBrightness(),int(avgHue), int(avgSat), int(avgBrightness));
      // let distRest = dist(restColor._getHue(),restColor._getSaturation(),restColor._getBrightness(),int(avgHue), int(avgSat), int(avgBrightness));

      let distWork = abs(workColor._getHue() - int(avgHue));
      let distRest = abs(restColor._getHue() - int(avgHue));

     
      let distRange = distWork-distRest;
      textActionsIndex = (distRange < 0) ? 0 : 1;
      console.log(distWork,distRest,distWork-distRest,textActionsIndex);
      let yGauge = map(distRange,-50,50,240,height);
      fill(avgCol);
      rect(320,yGauge,320,10);

      

      // fill(restColor);
      fill(color(restColor._getHue(),int(avgSat), int(avgBrightness)));
      rect(320,height-20,320,20);

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
  // let result = markov.generateNgrams(beg);
  let result = markov.generate(beg);
  // Put in HTML line breaks wherever there was a carriage return
  //result = result.replace('\n','<br/><br/>');
  newString = result;

}

  