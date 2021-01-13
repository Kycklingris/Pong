/*jshint esversion: 9 */
function startup() {
    
}

const generate = document.getElementById('generate');
const submit = document.getElementById('submit'); 
const textfield = document.getElementById('input');
var p = new SimplePeer({ initiator: false, trickle: false });

p.on('error', err => console.log('error', err))

function generate2() {
    p = new SimplePeer({ initiator: true, trickle: false });
    p.on('signal', data => {
        textfield.textContent = JSON.stringify(data);
    });
    
}

function submit2() {
    p = new SimplePeer({ initiator: false, trickle: false });
    p.signal(JSON.parse(document.querySelector('#input').value));
}

p.on('connect', () => {
    console.log('connect');
    p.send('whatever' + Math.random());
});

p.on('data', data => {
    console.log('data:' + data);
});

document.addEventListener('DOMContentLoaded', () => {
    startup();
});


/*
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