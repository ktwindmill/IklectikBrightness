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
let earR = 0;
let earG = 0;
let earB = 0;
let count;
let col;
let workColor; //blue
let restColor; // red
let arrayOfNumbers = [];
let threshold;
//let arrayOfTextObjects = ['this', 'that', 'those', 'there', 'here', 'them', 'these', 'everything', 'everyone', 'nothing'];
//let arrayOfTextActions = ['take','touch','travel','stop','stop','swallow','halve','reverse','count','melt','hold'];
let earBeginnings = ['whisper to the ear, tell it ','tune the ear, ','what does the ear think if you tell it ','speak up, say loudly to the ear ','shout to the ear - ','give the ear these instructions, tell the ear '];
let stomachBeginnings = ['what can you see there in the stomach, can you ','remember, with stomachs, always ','when dealing with a digesting organ or stomach it is important to remember ', 'move the guts around, touch the stomach ','what do you make of it? go, react in the stomach lining '];
let mouthBeginnings = ['shh, listen to what the mouth is saying, move to its will ','the mouth is talking to you. ','pay attention, this is important to the mouth ','listen to the mouth. repeat ','repeat what the mouth is saying with your body. consider ','can you tune the mouth baring in mind '];
//index 0 will be work words
//index 1 will be rest words
let arrayOfTextActions = [
  ['grow', 'build', 'test', 'fix', 'log', 'move', 'grease', 'tighten', 'twist', 'pull', 'blast','wire'], 
  ['slide', 'break', 'lose', 'rest', 'fall', 'hold', 'melt', 'sleep', 'degrade', 'stop','sit','reverse']
];
let textActionsIndex = 0;
let instructions;
let zone = "";
let newString;
let textlog;
let nounJSON;

//serial communication
let serial;
let portName = "/dev/cu.usbmodem1411";
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
let courier;

function preload() {
  //preload zone mapping
  img = loadImage('IklectikMaps/V2.png');
  courier = loadFont('fonts/CourierNew.ttf');
  //preload seed data
  // lines = loadStrings('clockwork.txt');
  lines = loadStrings('cleancombined.txt');
  nounJSON = loadJSON('nouns.json');

}


function setup() {
  colorMode(HSB, 100);
  let myCanvas = createCanvas(960, 480);
  myCanvas.parent("canvasContainer");
  background(255);
  workColor = color(50,100,100); //blue
  restColor = color(0,100,100); // red
  noStroke();
  
  //video set up
  frameRate(60);
  pixelDensity(1);
  video = createCapture(VIDEO);
  video.size(320,240);
  // The above function actually makes a separate video
  // element on the page.  The line below hides it since we are
  // drawing the video to the canvas
  video.hide();
     
  threshold = 80;//200 under the 255 mode but now we are using HSB 100
    
  col = color('hsb(0, 100%, 100%)');//red
       
  //serial set up
  serial = new p5.SerialPort();
  serial.on('error',serialError);
  serial.open(portName);   
    
  //osc set up
  //params: input, output
  setupOsc(6666, 9999);
    
  //debugging
  count = 0;
    
  //markov generator
  let text = lines[0];
  // console.log(text);

  // N-gram length and maximum length
  markov = new MarkovGenerator(7, 10);
  // arrayOfTextActions = markov.seedNgramBeginnings(text);
   //quick test of the structure
  // let tempArray = markov.seedBeginnings(text);
  // arrayOfTextActions.push(tempArray);
  // arrayOfTextActions.push(tempArray);
  console.log(arrayOfTextActions);
  // markov.feedNgrams(text);
  markov.feed(text);
  // markov.feed(beginWords);
  // console.log(markov);
    
  textlog = document.getElementById("log");
    
}

function draw() {
  noStroke();

  // Draw the video
  image(video,0,0,320,240);
  image(img, 320, 0, 320, 240);

  
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

  //smple greyscale zone image
  let mapC = img.get(closestColorX,closestColorY);
  // console.log(mapC.toString(), mapC[0]);
        
  //Left over code from when we were generating text from the brightness coordinates
  // let textCoordX = int(map(closestColorX, 0, 320, 0,9));
  // console.log(textCoordX);
  //let textCoordY = int(map(closestColorY, 0, height, 0,9));

  if (frameCount % 120 == 0 ) {
    if(mapC[0] == 0){
        
        //Left over code from when we were generating text from the brightness coordinates
        //let tempString = arrayOfTextActions[textCoordX]+' '+arrayOfTextObjects[textCoordY]+' '+'eye';
        //console.log(tempString);

        zone = "STOMACH";
        
        //STOMACH
        let tempIndex = int(random(arrayOfTextActions[textActionsIndex].length-1));
        let begIndex = int(random(stomachBeginnings.length-1));
        //console.log(begIndex);
        generate(arrayOfTextActions[textActionsIndex][tempIndex]);
        instructions = stomachBeginnings[begIndex] + newString;
        serial.write(instructions);
        createParagraph(instructions);
        
        if(isConnected){
          sendOsc('/eye',newString);
          // console.log('eye');
        }
      }
          
      if(mapC[0] == 88){
        //let tempString = arrayOfTextActions[textCoordX]+' '+arrayOfTextObjects[textCoordY]+' '+'ear';
        //console.log(tempString);
          
        zone = "MOUTH";

        //  MOUTH
        let tempIndex = int(random(arrayOfTextActions[textActionsIndex].length-1));
        let begIndex = int(random(mouthBeginnings.length-1));
        //console.log(begIndex);
        generate(arrayOfTextActions[textActionsIndex][tempIndex]);
        instructions = mouthBeginnings[begIndex] + newString;
        serial.write(instructions);
        createParagraph(instructions);
              
        // generate(tempString);
          
        if(isConnected){
        sendOsc('/eye',newString);
        // console.log('eye');
        }
      }
         
      if(mapC[0] == 255){

        zone = "EAR";
          
        //EAR
        let tempIndex = int(random(arrayOfTextActions[textActionsIndex].length-1));
        let begIndex = int(random(stomachBeginnings.length-1));
        //console.log(begIndex);
        generate(arrayOfTextActions[textActionsIndex][tempIndex]);
        instructions = earBeginnings[begIndex]+ newString;
        serial.write(instructions);
        createParagraph(instructions);
              
          //generate(tempString);
          
          if(isConnected){
          sendOsc('/eye',newString);
        // console.log('eye');
        }
          
      }
      
        //  console.log(counter);
          
         
     }
       
    

      //red ellipse
      fill(col);

      push();
      translate(closestColorX,closestColorY,);
      stroke("blue");
      strokeWeight(5);
      line(0,-15,0,15);
      line(-15,0,15,0);
      // ellipse(0,0, 30);
      pop();

      push();
      translate(closestColorX+320,closestColorY,);
      stroke("blue");
      strokeWeight(5);
      line(0,-15,0,15);
      line(-15,0,15,0);
      // ellipse(0,0, 30);
      pop();

      noStroke();
    
      //Color checking diagram
      let avgCol = color(int(avgHue), int(avgSat), int(avgBrightness));
      //  console.log(int(avgHue), int(avgSat), int(avgBrightness));
      fill(avgCol);
      rect(0,240,320,240);

      //color checker bg
      fill("black");
      rect(320,240,320,240);

      fill(color(workColor._getHue(),int(avgSat), int(avgBrightness)));
      rect(320,240,320,10);

      let distWork = abs(workColor._getHue() - int(avgHue));
      let distRest = abs(restColor._getHue() - int(avgHue));

      //when distRange is a negative value color is closer to work
      let distRange = distWork-distRest;
      textActionsIndex = (distRange < 0) ? 0 : 1; // Work index = 0 , Rest index = 1
      //console.log(distWork,distRest,distWork-distRest,textActionsIndex);

      let yGauge = map(distRange,-50,50,240,height,true);
      fill(avgCol);
      rect(320,yGauge,320,10);

      // fill(restColor);
      fill(color(restColor._getHue(),int(avgSat), int(avgBrightness)));
      rect(320,height-10,320,10);

      // stroke('white');
      // strokeWeight(3);
      fill("white");
      rect(640,0,320,240);

      rectMode(CENTER);
      fill("black");
      textAlign(CENTER);
      textFont(courier);
      textSize(50);
      text(zone,800,120);
      rectMode(CORNER);

      fill("black");
      rect(640,240,320,240);

      fill("white");
      rect(640,360,320,2);

      if(textActionsIndex == 0){
        rectMode(CENTER);
        fill("white");
        text("WORK",800,320);
        rectMode(CORNER);
      }else{
        rectMode(CENTER);
        fill("white");
        text("REST",800,430);
        rectMode(CORNER);
      }

      rectMode(CENTER);
      fill("white");
      textSize(20);
      text("Color:"+earR,160,height-20);
      rectMode(CORNER);


      if (frameCount % 120 == 0 ) {
        stroke("red");
        strokeWeight(10);
        noFill();
        rect(5,5,width-10,height-10);
      }

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

	if (address == '/ear/color') {
		earR = value[0];
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

  
function createParagraph(text){
  let para = document.createElement("p");
  let node = document.createTextNode(text);
  para.appendChild(node);
  textlog.prepend(para);
}