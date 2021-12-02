// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

//Imports P5. Instantiates the sketch at the bottom of this file.
const p5 = require("p5");
const fs = require("fs");

const sound = require("p5/lib/addons/p5.sound");
//Imports our custom function to decide what color the fill shall be.
const { getFillColor } = require("./js/src/colorController");
const appcontrol = require("electron").remote.app;


const sketch = (p) => {
  let movies = [];
  let images = [];
  const IDLE = 0;
  const PLAYING = 1;
  const IMAGE = 2;

  let state = IDLE;
  let mic;
  let micLevel;
  let trigger = 0.1;
  let currentMovie;
  let currentImage;
  let ratio;

  let idleVideo;
  
  p.setup = () => {
    // Create the canvas
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.imageMode(p.CENTER);
    let path = appcontrol.getAppPath();
    mic = new p5.AudioIn((error) => console.log(error));
    mic.start();

    fs.readdir(path + "/data/clips/", (err, files) => {
      if (err) {
        throw err;
      }
      // files object contains all files names
      // log them on console
      files.forEach((file) => {
        movies.push(
          p
            .createVideo([path + "/data/clips/" + file], () => {
            })
            .hide()
        );
        
      });
    });

    fs.readdir(path + "/data/pics/", (err, files) => {
      if (err) {
        throw err;
      }
      // files object contains all files names
      // log them on console
      files.forEach((file) => {
        images.push(
          p.loadImage([path + "/data/pics/" + file], () => {
            // console.log("done");
          })
          // .hide()
        );
        // console.log(file);
      });
    });

    
      idleVideo = p.createVideo([path + "/data/titulos de espera.mp4"], () => {
      })
      .hide()

      idleVideo.loop();

    

    setInterval(()=>{
      micLevel = mic.getLevel(0.1);
    }, 20);
  };

  

  p.draw = () => {
    p.background(0);
    
    p.fill(255);    
    console.log(micLevel);
    if (micLevel > trigger) {
      p.mousePressed();
      p.fill(255,0,0);
    }
    p.rect(0, p.height - 5,  micLevel * p.width, p.height);

    switch (state) {
      case IDLE:  
          ratio = idleVideo.width / idleVideo.height;
          p.image(
            idleVideo,
            p.width / 2,
            p.height / 2,
            p.width,
            p.width / ratio
          );
        break;
      case PLAYING:
        ratio = currentMovie.width / currentMovie.height;
        p.image(
          currentMovie,
          p.width / 2,
          p.height / 2,
          p.width,
          p.width / ratio
        );
        break;
      case IMAGE:
        ratio = currentImage.width / currentImage.height;
        p.image(
          currentImage,
          p.width / 2,
          p.height / 2,
          p.width,
          p.width / ratio
        );
        break;
    }
  };

  let lastTimeout;
  p.mousePressed = () => {
    if (state !== IDLE) return;
    console.log("next");
    if (Math.random() > 0.5) {
      setImage();
    } else {
      setMovie();
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  setMovie = function () {
    if (currentMovie) {
      currentMovie.stop();
    }

    currentMovie = movies[Math.floor(Math.random() * movies.length)];
    currentMovie.play();
    state = PLAYING;

    currentMovie.elt.onended = () => {
      state = IDLE;
    };
  };
  setImage = function () {
    currentImage = images[Math.floor(Math.random() * images.length)];
    state = IMAGE;
    lastTimeout = setTimeout(() => {
      state = IDLE;
    }, 10E3);
  };
};

//Instantiates P5 sketch to keep it out of the global scope.
const app = new p5(sketch);
