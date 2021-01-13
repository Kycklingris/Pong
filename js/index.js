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
  prev = 0;

const config = {iceServers: [{urls: "stun:stun.1.google.com:19302"}]};
const pc = new RTCPeerConnection(config);
const dc = pc.createDataChannel("chat", { negotiated: true, id: 0 });

function mainloop() {


}

function deltatimer() {
  let e = Date.now();
  delta = e - prev;
  prev = e;
  console.log(delta);
}

region.onmousemove = function cursor(e) {
  var y = e.clientY;
  var ty = y / space.clientHeight;
  ty = ty * 100 - 8.5;
};

function pmove() {
  

}



  const log = e => receive(e);
  dc.onopen = function () {
    document.querySelector("#popup").style.display = "none";
  };
  dc.onmessage = e => log(e.data);

  pc.oniceconnectionstatechange = e => log(pc.iceConnectionState);

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

  function recieve(e) {
    console.log(e);

  }

  function hide() {
    if (document.querySelector("#popup").style.display == "none") {
      document.querySelector("#popup").style.display = "block";
    } else {
      document.querySelector("#popup").style.display = "none";
    }
  };

  function submit3() {
    if (pc.signalingState != "have-local-offer") return;
    generate.disabled = submit.disabled = true;
    pc.setRemoteDescription({ type: "answer", sdp: textfield.value });
    textfield.value = "";
    textfield.placeholder = "";
}