/*jshint esversion: 9 */
const generate = document.querySelector('#generate');
const submit = document.getElementById('submit'); 
const textfield = document.querySelector('#input');
const ball = document.querySelector("#ball");
const region = document.querySelector("#cursorcapture");
const player = document.querySelector("#playerl");
const enemy = document.querySelector("#playerr");
const space = document.querySelector("#gamespace");

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
  bAngle = 330 ,
  bSpeed = 0.045,
  paused = true,
  onlineplay = false;



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
      pmove();
      bmove();
      collision();
      online();
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
  if (onlineplay) {
    dc.send("pong: " + ty);
  }
  
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
  } else if (bY <= -47) {
    bAngle *= -1;
    bY = -46.8;
  }
 
  //paddle collsion
  var paddel = py / 82.24200000000017 * 100 - 50;
  if (bX <= -48 && bY <= paddel + 15.5 && bY >= paddel - 11.5) {
    bAngle -= 45;
    bX = -47.8;
  } else if (bX <= -49) {
    bX = 0;
    bY = 0;

  }

  var paddel2 = py2 / 82.24200000000017 * 100 - 50;
  if (bX >= 48 && bY <= paddel2 + 15.5 && bY >= paddel2 - 11.5) {
    bAngle += 45;
    bX = 47.8;
  } else if (bX >= 49) {
    bX = 0;
    bY = 0;

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
    if (py2-0.5 > ty2 && py2 > 0) {
        py2 -= speed * delta;
      } else if (py2+0.5 < ty2 && py2 < 100) {
        py2 += speed * delta;
      }
    if (py2 < 0) {
        py2 = 0;
      } else if (py2 > 100) {
        py2 = 100;
      }
  enemy.style.marginTop = py2 + "vh";
}

// WebRTC recieved data
dc.addEventListener('message', e => {
  if (e.data.includes("pong: ")) {
    var tmp = e.data.split(" ");
    ty2 = 100 - tmp[1];
  } else if (e.data.includes("ball: ")) {
    var tmp2 = e.data.split(" ");

  }
});

// Dont ask
var log = e => console.log(e);
dc.onopen = function () {
  hide();
  onlineplay = true;
};
dc.onmessage = e => log(e.data);
pc.oniceconnectionstatechange = e => log(pc.iceConnectionState);
// Ok, ask again

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
  if (document.querySelector("#popup").style.display == "none") {
    paused = true;
    document.querySelector("#popup").style.display = "block";
  } else {
    document.querySelector("#popup").style.display = "none";
    paused = false;
  }
}

function AngleToRadians(angle) {
  return angle / 180* Math.PI;
}

//Start mainloop
mainloop();