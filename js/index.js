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



const config = { iceServers: [{ urls: "stun:stun.1.google.com:19302" }] };
const pc = new RTCPeerConnection(config);
const dc = pc.createDataChannel("chat", { negotiated: true, id: 0 });

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
dc.addEventListener('message', e => {
  if (e.data.includes("pong: ")) {
    var tmp = e.data.split(" ");
    py2 = 83 - tmp[1];
  } else if (e.data.includes("boll: ")) {
    var tmp2 = e.data.split(" ");
    bAngle = tmp2[1] - 180 ;
    bX = 0 - tmp2[2];
    bY = 0 - tmp2[3];

  } else if (e.data.includes("scorem")) {
      p1++;
      score1.innerHTML = p1;

  } else if (e.data.includes("scoreu")) {
      p2++;
      score2.innerHTML = p2;

  } else if (e.data.includes("paus")) {
    paused = !paused;
  } else if (e.data.includes("Other: ")) {
    var msg = document.createElement("p");
    var text = document.createTextNode(e.data);
    msg.appendChild(text)
    messages.appendChild(msg);
    messages.scrollTo(0, document.body.scrollHeight);
  } else if (e.data.includes("start")) {
    start2();

  }
});

// Dont ask
var log = e => console.log(e);
dc.onmessage = e => log(e.data);
pc.onconnectionstatechange = function (event) {
  switch (pc.connectionState) {
    case "connected":
      startButton.style.display = "block";
      break;
    case "disconnected":
    case "failed":
      generate.disabled = submit.disabled = false;
      alert("connection failed!");
      break;
    case "closed":
      generate.disabled = submit.disabled = false;
      alert("connection closed!");
      break;
  }
};

// Creating WebRTC offer
async function createOffer() {
  generate.disabled = true;
  await pc.setLocalDescription(await pc.createOffer());
  pc.onicecandidate = ({ candidate }) => {
    if (candidate) return;
    textfield.value = pc.localDescription.sdp;
    textfield.select();
    textfield.setSelectionRange(0, 99999);
    document.execCommand("copy");
    alert("Offer copied, send to second player.");
    textfield.value = "";
    textfield.placeholder = "Input Answer Here:";
  };
}

// Accepting WebRTC offer
async function submit2() {
  submit3();
  if (pc.signalingState != "stable") return;
  generate.disabled = submit.disabled = true;
  await pc.setRemoteDescription({ type: "offer", sdp: textfield.value });
  await pc.setLocalDescription(await pc.createAnswer());
  pc.onicecandidate = ({ candidate }) => {
    if (candidate || generate.disabled == false) return;
    textfield.value = pc.localDescription.sdp;
    textfield.select();
    textfield.setSelectionRange(0, 99999);
    document.execCommand("copy");
    alert("Answer copied, send to second player.");
    textfield.value = "";
    textfield.placeholder = "";
    
  };
}

// Accepting return offer
function submit3() {
  if (pc.signalingState != "have-local-offer") return;
  generate.disabled = submit.disabled = true;
  pc.setRemoteDescription({ type: "answer", sdp: textfield.value });
  textfield.value = "";
  textfield.placeholder = "";
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