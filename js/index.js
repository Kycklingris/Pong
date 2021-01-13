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
  maxFPS = 60,
  timestep = 1000 / 60,
  prev = 0,
  speed = 0.018,
  py = 0,
  ty = 0,
  bX = 1,
  bY = 0,
  bAngle = 75,
  bSpeed = 0.18;



const config = { iceServers: [{ urls: "stun:stun.1.google.com:19302" }] };
const pc = new RTCPeerConnection(config);
const dc = pc.createDataChannel("chat", { negotiated: true, id: 0 });

function mainloop() {
  deltatimer();
  pmove();
  bmove();
  collision();

  requestAnimationFrame(mainloop);
}

// Time between frames
function deltatimer() {
  let e = Date.now();
  delta = e - prev;
  prev = e;
  console.log(delta);
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
  player.style.marginTop = py + "vh";
}

// Ball Movement
function bmove() {
  var angle = AngleToRadians(bAngle);
  bX += bSpeed * Math.cos(angle);
  bY += bSpeed * -Math.sin(angle);
  ball.style.marginTop = bY + "vh";
  ball.style.marginLeft = bX + "vw";
}

function collision() {
  if (bY >= 46.7 || bY <= -46.7) {
    bAngle = -bAngle;
  } else if (bX >= 48.7) {
    bAngle = bAngle +45;
  } else if(bX <= -48.7) {
    bAngle = -45;
  }
}


// Dont ask
const log = e => receive(e);
dc.onopen = function () {
  hide();
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


// WebRTC recieved data
function recieve(e) {
  console.log(e);

}

//Show/Hide P2P popup
function hide() {
  if (document.querySelector("#popup").style.display == "none") {
    document.querySelector("#popup").style.display = "block";
  } else {
    document.querySelector("#popup").style.display = "none";
  }
}

function AngleToRadians(angle) {
  return angle / 180* Math.PI;
}

//Start mainloop
mainloop();