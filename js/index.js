/*jshint esversion: 9 */
function startup() {
    
}

const generate = document.getElementById('generate');
const submit = document.getElementById('submit'); 
const textfield = document.getElementById('input');

const config = {iceServers: [{urls: "stun:stun.1.google.com:19302"}]};
const pc = new RTCPeerConnection(config);
const dc = pc.createDataChannel("chat", {negotiated: true, id: 0});
const log = msg => div.innerHTML += `<br>${msg}`;
dc.onopen = () => chat.select();
dc.onmessage = e => log(`> ${e.data}`);
pc.oniceconnectionstatechange = e => log(pc.iceConnectionState);

chat.onkeypress = function(e) {
  if (e.keyCode != 13) return;
  dc.send(chat.value);
  log(chat.value);
  chat.value = "";
};

async function createOffer() {
  button.disabled = true;
  await pc.setLocalDescription(await pc.createOffer());
  pc.onicecandidate = ({candidate}) => {
    if (candidate) return;
    offer.value = pc.localDescription.sdp;
    offer.select();
    answer.placeholder = "Paste answer here";
  };
}

offer.onkeypress = async function(e) {
  if (e.keyCode != 13 || pc.signalingState != "stable") return;
  button.disabled = offer.disabled = true;
  await pc.setRemoteDescription({type: "offer", sdp: offer.value});
  await pc.setLocalDescription(await pc.createAnswer());
  pc.onicecandidate = ({candidate}) => {
    if (candidate) return;
    answer.focus();
    answer.value = pc.localDescription.sdp;
    answer.select();
  };
};

answer.onkeypress = function(e) {
  if (e.keyCode != 13 || pc.signalingState != "have-local-offer") return;
  answer.disabled = true;
  pc.setRemoteDescription({type: "answer", sdp: answer.value});
};

ddEventListener('DOMContentLoaded', () => {
    startup();
});


/*

<button id="button" onclick="createOffer()">Offer:</button>
<textarea id="offer" placeholder="Paste offer here"></textarea>
Answer: <textarea id="answer"></textarea><br><div id="div"></div>
Chat: <input id="chat"><br>



peer2.on('signal', data => {
    // when peer2 has signaling data, give it to peer1 somehow
    peer1.signal(data);
});

peer1.on('connect', () => {
    // wait for 'connect' event before using the data channel
    peer1.send('hey peer2, how is it going?');
});

peer2.on('data', data => {
    // got a data channel message
    console.log('got a message from peer1: ' + data);
});

 */

/*
var slider = document.getElementById("myRange");
        var output = document.getElementById("zoomerimg");
        var mapboundries = document.getElementById("wowmap")
        var zoomerimg = document.getElementById("zoomerimg")
        var zoomer = document.getElementById("zoomer")
        document.onmousemove = function(e) {
            var x = e.clientX;
            var y = e.clientY;
            zoomer.style.marginLeft = x + "px"
            zoomer.style.marginTop = y + "px"
            y = y  + window.scrollY - mapboundries.offsetTop;
            var translatex = x / mapboundries.clientWidth;
            var translatey = y / mapboundries.clientHeight;

            var translatex = translatex * zoomerimg.clientWidth-150
            var translatey = translatey * zoomerimg.clientHeight-150
            zoomerimg.style.transform = 'translateX(-' + translatex + 'px)'
            zoomerimg.style.transform += 'translateY(-' + translatey + 'px)'

        }
        function mappress() {
            if (zoomer.style.display == "inline") {
                zoomer.style.display = "none"
            } else {
                zoomer.style.display = "inline"
            }
        }
        slider.oninput = function() {
            output.style.width = this.value*100 + "%";
        }

        */