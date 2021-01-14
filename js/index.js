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

var popup = false,
  delta = 0,
  prev = 0,
  speed = 0.04,
  py = 0,
  py2 = 0,
  ty = 0,
  ty2 = 0,
  bX = 1,
  bY = 0,
  bAngle = 330,
  bSpeed = 0.045,
  paused = true,
  onlineplay = false,
  host = false,
  p1 = 0,
  p2 = 0;


var pc = null;
var dc = null;
var lastpeerid = null;


/*
const config = { iceServers: [{ urls: "stun:stun.1.google.com:19302" }] };
const pc = new RTCPeerConnection(config);
const dc = pc.createDataChannel("chat", { negotiated: true, id: 0 });
*/
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
 
  //paddle collsion
  var paddel = py / 82.24200000000017 * 100 - 50;
  if (bX <= -48 && bY <= paddel + 15.5 && bY >= paddel - 11.5) {
    bAngle -= 45;
    bX = -47.8;
    if (host) {
      dc.send("boll: " + bAngle + ' ' + bX + ' ' + bY);
    }
  } else if (bX <= -49) {
    bX = 0;
    bY = 0;
    if (host) {
      dc.send("boll: " + bAngle + ' ' + bX + ' ' + bY);
      dc.send("scorem");
      p2++;
      score2.innerHTML = p2;
    } else if (!onlineplay) {
      p2++;
      score2.innerHTML = p2;
    }
  }

  var paddel2 = py2 / 82.24200000000017 * 100 - 50;
  if (bX >= 48 && bY <= paddel2 + 15.5 && bY >= paddel2 - 11.5) {
    bAngle += 45;
    bX = 47.8;
    if (host) {
      dc.send("boll: " + bAngle + ' ' + bX + ' ' + bY);
    }
  } else if (bX >= 49) {
    
    bX = 0;
    bY = 0;
    if (host) {
      dc.send("boll: " + bAngle + ' ' + bX + ' ' + bY);
      dc.send("scoreu");
      p1++;
      score1.innerHTML = p1; 
    } else if (!onlineplay) {
      p1++;
      score1.innerHTML = p1; 
    }

    }
  }


//bot for singelplayer
function bot() {
  var Y = ((bY / 100) * 82.24200000000017) + 50;
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

// WebRTC recieved data

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
    alert("connected");
    startButton.style.display = "block";
    data();
  });

  pc.on("disconnected", function () {
    paused = true;
    alert("Connection lost. Please Reconnect");
    console.log('Connection lost. Please Reconnect');

    pc.id = lastpeerid;
    pc._lastServerId = lastpeerid;
    pc.reconnect();

  });

  pc.on("error", function (err) {
    console.log(err);
    alert('' + err);
  });

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
    alert("Connected");      
    startButton.style.display = "block";
  });


  dc.on('close', function () {
    alert("Connection closed");
  });
  
  data();
}

function data() {
  dc.on('data', function (e) {
    if (e.includes("pong: ")) {
      var tmp = e.split(" ");
      py2 = 83 - tmp[1];
    } else if (e.includes("boll: ")) {
      var tmp2 = e.split(" ");
      bAngle = tmp2[1] - 180;
      bX = 0 - tmp2[2];
      bY = 0 - tmp2[3];

    } else if (e.includes("scorem")) {
      p1++;
      score1.innerHTML = p1;

    } else if (e.includes("scoreu")) {
      p2++;
      score2.innerHTML = p2;

    } else if (e.includes("paus")) {
      paused = !paused;
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


//Show/Hide P2P popup
function hide() {
  if (!onlineplay) {
    if (document.querySelector("#popup").style.display == "none") {
      paused = true;
      document.querySelector("#popup").style.display = "block";
    } else {
      document.querySelector("#popup").style.display = "none";
      paused = false;
    }
    startButton.style.display = "none";
  }

}

function AngleToRadians(angle) {
  return angle / 180* Math.PI;
}

function send() {
  if (onlineplay) {
    dc.send("Other: " + messagefield.value);
  }
  var msg = document.createElement("p");
  var text = document.createTextNode("You: " + messagefield.value);
  msg.appendChild(text)
  messages.appendChild(msg);
  messages.scrollTo(0, document.body.scrollHeight);
  messagefield.value = "";

}

space.addEventListener("click", function (event) {

  if (!onlineplay) {
    hide();
  } else if (host) {
    dc.send("paus");
    paused = !paused;
  }
});
region.addEventListener("click", function (event) {
  if (!onlineplay) {
    hide();
  } else if (host) {
    dc.send("paus");
    paused = !paused;
  }
});

//Start mainloop
mainloop();
initializeRTC();