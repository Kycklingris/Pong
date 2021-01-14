/*jshint esversion: 9 */
const generate = document.querySelector('#generate');
const submit = document.getElementById('submit'); 
const textfield = document.querySelector('#input');
const ball = document.querySelector("#ball");
const region = document.querySelector("#cursorcapture");
const player = document.querySelector("#playerl");
const enemy = document.querySelector("#playerr");
const space = document.querySelector("#gamespace");
const startButton = document.querySelector("#start");
const score1 = document.querySelector("#score1");
const score2 = document.querySelector("#score2");
const messagefield = document.querySelector("#msg");
const messages = document.querySelector("#messages");
const wiper = document.querySelector("#wiper");

var popup = true,
  delta = 0,
  prev = 0,
  speed = 0.04,
  py = 41.121,
  py2 = 41.121,
  ty = 0,
  ty2 = 0,
  bX = 1,
  bY = 0,
  bAngle = -180,
  bSpeed = 0.045,
  paused = true,
  onlineplay = false,
  host = false,
  p1 = 0,
  p2 = 0,
  bounce = false,
  prevbSpeed = 0;


var pc = null;
var dc = null;
var lastpeerid = null;

function mainloop() {


    deltatimer();
  if (!paused) {
    if (!onlineplay) {
      pmove();
      bmove();
      collision();
      bot();
    }
    if (onlineplay) {
      online();
      pmove();
      collision();
      bmove();
      if (host) {
        setInterval(dc.send("boll: " + bAngle + ' ' + bX + ' ' + bY), 400);
      }
    }

  }

  requestAnimationFrame(mainloop);
}

// Time between frames
function deltatimer() {
  let e = Date.now();
  delta = e - prev;
  prev = e;
}

region.onmousemove = function cursor(e) {
  var y = e.clientY;
   ty = y / space.clientHeight;
  ty = ty * 100 - 8.5;

};

// Player Movement
function pmove() {
  if (py-0.5 > ty && py > 0) {
    py -= speed * delta;
  } else if (py+0.5 < ty && py < 100) {
    py += speed * delta;
  }
  if (py < 0) {
    py = 0;
  } else if (py > 100) {
    py = 100;
  }
  player.style.marginTop = py + "vh";
  if (onlineplay) {
    dc.send("pong: " + py);
  }
}

// Ball Movement
function bmove() {
  var angle = AngleToRadians(bAngle);
  bX += bSpeed * Math.cos(angle) * delta;
  bY += bSpeed * -Math.sin(angle) * delta;
  ball.style.marginTop = bY + "vh";
  ball.style.marginLeft = bX + "vw";
}

// Collision...
function collision() {
  if (bY >= 47) {
    bAngle *= -1;
    bY = 46.8;
    if (host) {
      dc.send("boll: " + bAngle + ' ' + bX + ' ' + bY);
    }
  } else if (bY <= -47) {
    bAngle *= -1;
    bY = -46.8;
    if (host) {
      dc.send("boll: " + bAngle + ' ' + bX + ' ' + bY);
    }
  }
 
  //paddle left collsion
  if (bX <= -48 && bY >= py - 52 && bY <= py + 15 && !bounce) {
    bAngle += 180 - ((bY - py + 50 - 8.5) / 75 * 360);
    bX = -47.8;
    timer();
    bounce = true;
    
    if (host) {
      dc.send("boll: " + bAngle + ' ' + bX + ' ' + bY);
    }
  } else if (bX <= -49) {
    bX = 0;
    bY = 0;
    if (host) {
      dc.send("boll: " + bAngle + ' ' + bX + ' ' + bY);
      score("p1");
    } else if (!onlineplay) {
      p2++;
      score2.innerHTML = p2;
    }
  }

  //paddle right collision
  if (bX >= 48 && bY >= py2 - 52 && bY <= py2 + 15 && !bounce) {
    bAngle += 180 - ((bY - py2 + 50 - 8.5) / 75 * 360);
    bX = 47.5;
    timer();
    bounce = true;
    if (host) {
      dc.send("boll: " + bAngle + ' ' + bX + ' ' + bY);
    }
  } else if (bX >= 50) {
    
    bX = 0;
    bY = 0;
    if (host) {
      dc.send("boll: " + bAngle + ' ' + bX + ' ' + bY);
      score();
    } else if (!onlineplay) {
      p1++;
      score1.innerHTML = p1; 
    }

    }
  }


//bot for singelplayer
function bot() {
  var Y = bY + 50 - 8.5;
  if (py2-0.5 > Y && py2 > 0) {
    py2 -= speed * delta;
  } else if (py2+0.5 < Y && py2 < 100) {
    py2 += speed * delta;
  }
  if (py2 > 100) {
    py2 = 82.24200000000017;
  } else if (py2 < 0) {
    py2 = 0;
  }
  enemy.style.marginTop = py2 + "vh";
}

function online() {
  enemy.style.marginTop = py2 + "vh";
}

//Choosing host
function start() {
  dc.send("start");
  host = true;
  hide();
  onlineplay = true;
}

function start2() {
  host = false;
  bAngle -= 180;
  hide();
  onlineplay = true;
  
}


//Peerjs start, lite med peerjs är kopierat, följde typ bara quick start, lite svårt att säga exakt vad dock.
function initializeRTC() {
  pc = new Peer(null, {
    debug: 2
  });

  pc.on('open', function (id) {
    if (pc.id === null) {
      console.log('Recieved null id from peer open');
      pc.id = lastpeerid;
    } else {
      lastpeerid = pc.id;
    }
    console.log('ID: ' + pc.id);
  });

  pc.on('connection', function (c) {
      // Allow only a single connection
      if (dc && dc.open) {
          c.on('open', function() {
              c.send("Already connected to another client");
              setTimeout(function() { c.close(); }, 500);
          });
          return;
      }

      dc = c;
      console.log("Connected to: " + dc.peer);
    var msg = document.createElement("p");
      var text = document.createTextNode("Connected");
      msg.appendChild(text);
      messages.appendChild(msg);
      messages.scrollTo(0, document.body.scrollHeight);
    startButton.style.display = "block";
    data();
  });

  pc.on("disconnected", function () {
    paused = true;
    var msg = document.createElement("p");
      var text = document.createTextNode("Connection lost. Please reconnect");
      msg.appendChild(text);
      messages.appendChild(msg);
      messages.scrollTo(0, document.body.scrollHeight);
    console.log('Connection lost. Please Reconnect');

    pc.id = lastpeerid;
    pc._lastServerId = lastpeerid;
    pc.reconnect();

  });

  pc.on("error", function (err) {
    console.log(err);
    var msg = document.createElement("p");
      var text = document.createTextNode("" + err);
      msg.appendChild(text);
      messages.appendChild(msg);
      messages.scrollTo(0, document.body.scrollHeight);
  });

  getId();
}

function getId() {
  textfield.value = pc.id;
  textfield.select();
  textfield.setSelectionRange(0, 99999);
  document.execCommand("copy");
}

function join() {

  if (dc) {
    dc.close();
  }

  dc = pc.connect(textfield.value, {
    reliable: true
  });

  dc.on('open', function () {
    var msg = document.createElement("p");
      var text = document.createTextNode("Connected");
      msg.appendChild(text);
      messages.appendChild(msg);
      messages.scrollTo(0, document.body.scrollHeight);     
    startButton.style.display = "block";
  });

  dc.on('close', function () {
    var msg = document.createElement("p");
      var text = document.createTextNode("Connection closed!");
      msg.appendChild(text);
      messages.appendChild(msg);
      messages.scrollTo(0, document.body.scrollHeight);
  });
  
  data();
}

function data() {
  dc.on('data', function (e) {
    if (e.includes("pong: ")) {
      var tmp = e.split(" ");
      py2 = 83 - Number(tmp[1]);
    } else if (e.includes("boll: ")) {
      var tmp2 = e.split(" ");
      bAngle = Number(tmp2[1]) - 180;
      bX = 0 - Number(tmp2[2]);
      bY = 0 - Number(tmp2[3]);

    } else if (e.includes("scorem")) {
      score("p1");

    } else if (e.includes("scoreu")) {
      score();

    } else if (e.includes("paus")) {
      paus();
    } else if (e.includes("Other: ")) {
      var msg = document.createElement("p");
      var text = document.createTextNode(e);
      msg.appendChild(text);
      messages.appendChild(msg);
      messages.scrollTo(0, document.body.scrollHeight);
    } else if (e.includes("start")) {
      start2();

    }
  });
  
}

function score(x) {
  if (x == "p1") {
    p1++;
    score1.innerHTML = p1;

    if (host) {
      dc.send("scorem");
    }
  } else {
    p2++;
    score2.innerHTML = p2;
    if (host) {
      dc.send("scorem");
    }
  }
}


//Show/Hide P2P popup
function hide() {
  if (!onlineplay) {
    if (document.querySelector("#popup").style.display == "none") {
      document.querySelector("#popup").style.display = "block";
    } else {
      document.querySelector("#popup").style.display = "none";
    }
    startButton.style.display = "none";
  }

}

function AngleToRadians(angle) {
  return angle / 180* Math.PI;
}

function timer() {
  setTimeout(function(){ 
        bounce = false; 
    }, 750);
}

function paus() {
  if (host) {
    dc.send("paus");
  } else {
  hide();
  }
  paused = !paused;
  if (paused) {
    wiper.style.display = "block";
  } else {
    wiper.style.display = "none";
  }

}

function send() {
  if (messagefield.value != "") {
    if (onlineplay) {
      dc.send("Other: " + messagefield.value);
    }
    var msg = document.createElement("p");
    var text = document.createTextNode("You: " + messagefield.value);
    msg.appendChild(text);
    messages.appendChild(msg);
    messages.scrollTo(0, document.body.scrollHeight);
    messagefield.value = "";
  }
}

//copied
messagefield.addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    document.querySelector("#msgbutt").click();
  }
});

space.addEventListener("click", function (event) {
  paus();
});
region.addEventListener("click", function (event) {
  paus();
});
wiper.addEventListener("click", function (event) {
  paus();
});

//Start mainloop
mainloop();
initializeRTC();