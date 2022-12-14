/*------------------------------------------------------------------------
  Example sketch for Adafruit Thermal Printer library for Arduino.
  Demonstrates a few text styles & layouts, bitmap printing, etc.

  IMPORTANT: DECLARATIONS DIFFER FROM PRIOR VERSIONS OF THIS LIBRARY.
  This is to support newer & more board types, especially ones that don't
  support SoftwareSerial (e.g. Arduino Due).  You can pass any Stream
  (e.g. Serial1) to the printer constructor.  See notes below.
  ------------------------------------------------------------------------*/

  #include "Adafruit_Thermal.h"
  #include "SoftwareSerial.h"

  #include "ear.h"
  #include "mouth_right.h"
  //#include "ear_middle.h"
 // #include "eye_right.h"
  #include "stomach_middle.h"
  //#include "earK.h"
  //#include "ear1.h"
  //#include "mouthK.h"
  //#include "mouthK2.h"
  //#include "mouthK3.h"
  //#include "st.h"
  //#include "st2.h"
  //#include "st3.h"

#define TX_PIN 5// Arduino transmit  BLUE WIRE  labeled RX on printer
#define RX_PIN 6 // Arduino receive   GREEN WIRE   labeled TX on printer

SoftwareSerial mySerial(RX_PIN, TX_PIN); // Declare SoftwareSerial obj first
Adafruit_Thermal printer(&mySerial);     // Pass addr to printer constructor

String message ="";

// -----------------------------------------------------------------------

void setup() {


  // NOTE: SOME PRINTERS NEED 9600 BAUD instead of 19200, check test page.
  Serial.begin(9600);
  mySerial.begin(9600);  // Initialize SoftwareSerial
  printer.begin();        // Init printer (same regardless of serial type)

    // printer.upsideDownOn();
      printer.justify('C');
      printer.setSize('M');
        //  printer.printBitmap(104, 100, ear); 
       printer.println("hello");

}

void loop() {

  // check if data has been sent from the computer:
  if (Serial.available() > 0) {

 
    message = Serial.readString();
//     printer.upsideDownOn();
//     printer.justify('C');
//     printer.setSize('M');
//     printer.println(message+"\r\n");

//    // needs to be looking for if any part of the string contains the bodypart 
    if (message.indexOf("ear") != -1) {
       //printer.upsideDownOn();
      printer.justify('C');
      printer.setSize('M');

     
    //  if(img == 0){
        printer.printBitmap(104, 100, ear); 
    //  }
      
     // if(img == 1){
     //   printer.printBitmap(304, 150, ear_middle); 
     // }
         
          printer.println(message+"\r\n");
         
     }


     if (message.indexOf("mouth") != -1) {
       // printer.upsideDownOn();
        printer.justify('C');
        printer.setSize('M');


        //if(img == 0){
          printer.printBitmap(304, 150, mouth_right); 
        //}

       // if(img == 1){
       //   printer.printBitmap(304, 150, mouthKbmp); 
      //  }

          printer.println(message+"\r\n");
     }
     
     if (message.indexOf("stomach") != -1) {
       // printer.upsideDownOn();
        printer.justify('C');
        printer.setSize('M');

       // if(img == 0){
          printer.printBitmap(304, 150, stomach_middle); 
       // }

       // if(img == 1){
       //   printer.printBitmap(304, 150, st2bmp); 
      //  }

          printer.println(message+"\r\n");
     }

    //   {
    //       printer.println("not working");

    //  }
    //printer.printBitmap(104, 100, ear);  
  //printer.printBitmap(344, 340, eye); 

  }
}
