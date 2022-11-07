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
  #include "mouth.h"

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
          printer.printBitmap(104, 100, ear); 
          printer.println(message+"\r\n");
         
     }
     if (message.indexOf("eye") != -1) {
       // printer.upsideDownOn();
        printer.justify('C');
        printer.setSize('M');
          printer.printBitmap(104, 100, mouth); 
          printer.println(message+"\r\n");
     }

    //   {
    //       printer.println("not working");

    //  }
    //printer.printBitmap(104, 100, ear);  
  //printer.printBitmap(344, 340, eye); 

  }
}
