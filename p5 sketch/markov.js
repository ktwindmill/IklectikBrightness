// A2Z F18
// Daniel Shiffman
// http://shiffman.net/a2z
// https://github.com/shiffman/A2Z-F18

// This is based on Allison Parrish's great RWET examples
// https://github.com/aparrish/rwet-examples

// Prototype is magic!  By accessing Array.prototype
// we can augment every single Array object with an new function

// Like python's choice this will return a
// random element from an array
Array.prototype.choice = function() {
  let i = floor(random(this.length));
  return this[i];
}

// A Markov Generator class
class MarkovGenerator {

  constructor(n, max) {
    // Order (or length) of each ngram
    this.n = n;
    // What is the maximum amount we will generate?
    this.max = max;
    // An object as dictionary
    // each ngram is the key, a list of possible next elements are the values
    this.ngrams = {};
    // A separate array of possible beginnings to generated text
    this.beginnings = [];
  }
  

  seedBeginnings(text){
    let beginArr = [];
   // let para = text.split(/\n\n/);
    let para = text.split(' ');

    for(let i = 0; i < para.length; i++){
     // let p = para[i];
      //p = p.replace(/\n/g,"");
      //let beginning = p.split(" ")[0];
       let beginning = para[i];
      if(this.beginnings.includes(beginning) == false){
        this.beginnings.push(beginning);
        if(beginArr.length < 12){
          beginArr.push(beginning);
          console.log(beginArr);
        }
      }

    }

    return beginArr;
  }

  seedNgramBeginnings(text){
    let beginArr = [];
    let para = text.split(/\n\n/);

    for(let i = 0; i < para.length; i++){
      let p = para[i];
      p = p.replace(/\n/g,"");
      let beginning = p.substring(0, this.n).toLowerCase();
      if(this.beginnings.includes(beginning) == false){
        this.beginnings.push(beginning);
        if(beginArr.length < 12){
          beginArr.push(beginning);
        }
      }

    }

    return beginArr;
  }

  // A function to feed in text to the markov chain
  feed(text) {

    // Discard this line if it's too short
    if (text.length < this.n) {
      return false;
    }

    // text = text.replace(/\s{2,}/g," ");
   // text = text.replace(/\n/g,"");

    let words = text.split(" ");

    // Now let's go through everything and create the dictionary
    for (let i = 0; i < words.length; i++) {
     let gram = words[i].replace(/ /g,"");
     let next = words[i+1];
     // Is this a new one?
     if (!this.ngrams.hasOwnProperty(gram)) {
       this.ngrams[gram] = [];
     }
     // Add to the list
     this.ngrams[gram].push(next);
   }

  }

  //original ngrams implementation
  feedNgrams(text) {

    // Discard this line if it's too short
    if (text.length < this.n) {
      return false;
    }

    // // Store the first ngram of this line
    // let beginning = text.substring(0, this.n).toLowerCase();
    // this.beginnings.push(beginning);
    // text = text.replace(/\s{2,}/g," ");
    text = text.replace(/\n/g,"");


  //  console.log(this.ngrams);

   // Now let's go through everything and create the dictionary
    for (let i = 0; i < text.length - this.n; i++) {
      let gram = text.substring(i, i + this.n);
      let next = text.charAt(i + this.n);
      // Is this a new one?
      if (!this.ngrams.hasOwnProperty(gram)) {
        this.ngrams[gram] = [];
      }
      // Add to the list
      this.ngrams[gram].push(next);
    }
  }

  // Generate a text from the information ngrams
  generate(beg) {

    // Get a random  beginning
   // let current = this.beginnings.choice();
      
      //choose a beginning
    let current = beg;
    let output = current;

    let iteratorMax = this.max;
    // Generate a new token max number of times
    for (let i = 0; i < iteratorMax; i++) {
      // If this is a valid ngram
      if (this.ngrams.hasOwnProperty(current)) {
        // What are all the possible next tokens
        let possible_next = this.ngrams[current];
        // Pick one randomly
        let next = possible_next.choice();
        // Add to the output
        output += " " + next;
        // Get the last N entries of the output; we'll use this to look up
        // an ngram in the next iteration of the loop
        // current = output.substring(output.length - this.n, output.length);//ngram implementation
        current = next;//output.substring(output.length - this.n, output.length);
        if(i == iteratorMax-1){
          if(!nounJSON.nouns.includes(current)){
            iteratorMax ++;
          }else{
            output += ".";
          }
        }
      }else{
        output += "."
        break;
      }
    }
    // Here's what we got!
    return output;
  }

  generateNgrams(beg) {

    // Get a random  beginning
   // let current = this.beginnings.choice();
      
      //choose a beginning
    let current = beg;
    let output = current;

    // Generate a new token max number of times
    for (let i = 0; i < this.max; i++) {
      // If this is a valid ngram
      if (this.ngrams.hasOwnProperty(current)) {
        // What are all the possible next tokens
        let possible_next = this.ngrams[current];
        // Pick one randomly
        let next = possible_next.choice();
        // Add to the output
        output += next;
        // Get the last N entries of the output; we'll use this to look up
        // an ngram in the next iteration of the loop
        current = output.substring(output.length - this.n, output.length);//ngram implementation
      } else {
        break;
      }
    }
    // Here's what we got!
    return output;
  }
}