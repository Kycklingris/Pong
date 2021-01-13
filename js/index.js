/*jshint esversion: 9 */
function startup() {
    const generate = document.querySelector('generate');
    const submit = document.querySelector('submit');
    const textfield = document.querySelector('textfield');
}

function generate() {
        var p1 = new SimplePeer({ initiator: true, trickle: false });
        p1.on('signal', data => {
            textfield.textContent = JSON.stringify(data);
        });
        
}

function submit() {

}
    

generate.onclick = generate();
submit.onclick = submit();

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