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
const sliders = document.querySelectorAll(".slider");
const values = document.querySelectorAll(".value");
const cookiequest = document.querySelector("#cookies");
const gurka = document.querySelector("#gurka");
const joinButt = document.querySelector("#submit");

const circle = document.querySelector("#circle");
const smokel = document.querySelector("#smokel");
const smoker = document.querySelector("#smoker");
const dustl = document.querySelector("#dustl");
const dustr = document.querySelector("#dustr");


var settings = [0.045, 6, 75, 17, 0.04, 5];

var collisionWorker = new Worker('js/collision.js');

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
  bSize = 6,
  win = 5,
  paused = true,
  onlineplay = false,
  host = false,
  p1 = 0,
  p2 = 0,
  prevbSpeed = 0,
  cookies = false,
  pausTime = false,
  pausTimeout = null,
  maxAngle = null,
  joinInterval = null,
  Id = null;


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
  if (py-2 > ty && py > 0) {
    py -= speed * delta;
  } else if (py+2 < ty && py < 100) {
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
  gurka.style.transform = "rotate(" +  bAngle + "deg)";
  gurka.style.transition = "all 1.5s";
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

//Send to collisionworker
function collision() {
  var d = [
    bY,
    bX,
    bSize,
    pSize,
    py,
    py2
  ];
  collisionWorker.postMessage(d);
}

//Webworker message handling
collisionWorker.onmessage = function (e) {
  console.log("message " + e.data);
  if (e.data.includes("1")) {
    bAngle *= -1;
    bY = 47 - bSize / 4;
    if (host) {
      dc.send("boll: " + bAngle + ' ' + bX + ' ' + bY);
    }
  } else if (e.data.includes("2")) {
    bAngle *= -1;
    bY = -47 + bSize / 4;
    if (host) {
      dc.send("boll: " + bAngle + ' ' + bX + ' ' + bY);
    }
  } else if (e.data.includes("3")) {
    reset();
    score("p1");
    if (host) {
      dc.send("boll: " + bAngle + ' ' + bX + ' ' + bY);
    }
  } else if (e.data.includes("4")) {
    reset();
    score();
    if (host) {
      dc.send("boll: " + bAngle + ' ' + bX + ' ' + bY);
      score();
    }
  } else if (e.data.includes("5")) {
    bAngle += 180 + ((bY - py + 50 - 8.5) / maxAngle * 360);
    bX = -49 + bSize / 4;
    if (host) {
      dc.send("boll: " + bAngle + ' ' + bX + ' ' + bY);
    }

  } else {

    bAngle += 180 + ((bY - py2 + 50 - 8.5) / maxAngle * 360);
    bX = 49 - bSize / 4;
    if (host) {
      dc.send("boll: " + bAngle + ' ' + bX + ' ' + bY);
    }
  }
};




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
    fullReset();

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
}

function getId() {
  joinButt.disabled = false;
  textfield.value = pc.id;
  textfield.select();
  textfield.setSelectionRange(0, 99999);
  document.execCommand("copy");
}

function join(x) {
  joinButt.disabled = true;
  if (dc && x) {
    dc.close();
    clearInterval(joinInterval);
  }

  if (!dc) {
    Id = textfield.value;
    joinInterval = setInterval(tryJoin, 1500);
    return;
  }

  dc.on('close', function () {
    var msg = document.createElement("p");
      var text = document.createTextNode("Connection closed!");
      msg.appendChild(text);
      messages.appendChild(msg);
      messages.scrollTo(0, document.body.scrollHeight);
      startButton.style.display = "none";
  });
  data();
}

function tryJoin() {
  var msg = document.createElement("p");
  var text = document.createTextNode("Retrying...");
  msg.appendChild(text);
  messages.appendChild(msg);
  messages.scrollTo(0, document.body.scrollHeight);     
  
  dc = pc.connect(Id, {
    reliable: true
  });

  dc.on('open', function () {
    clearInterval(joinInterval);
    join();
    setTimeout(function(){ 
      dc.send("accept");
    }, 500);
    var msg = document.createElement("p");
    var text = document.createTextNode("Connected");
    msg.appendChild(text);
    messages.appendChild(msg);
    messages.scrollTo(0, document.body.scrollHeight);     
    startButton.style.display = "block";
    return;
  });

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


function online() {
  enemy.style.marginTop = py2 + "vh";
}

//Choosing host
function start() {
  dc.send("start");
  host = true;
  onlineplay = true;
  fullReset();
  paus();
}

function start2() {
  host = false;
  onlineplay = true;
  fullReset();
}

function data() {
  var tmp = null;
  dc.on('data', function (e) {
    if (e.includes("pong: ")) {
      tmp = e.split(" ");
      py2 = 83 - Number(tmp[1]);
    } else if (e.includes("boll: ")) {
      tmp = e.split(" ");
      bAngle = Number(tmp[1]) - 180;
      bX = 0 - Number(tmp[2]);
      bY = 0 - Number(tmp[3]);

    } else if (e.includes("scorem")) {
      tmp = e.split(" ");
      p2 = tmp[1];
      score2.innerHTML = p2;
    } else if (e.includes("scoreu")) {
      tmp = e.split(" ");
      p1 = tmp[1];
      score1.innerHTML = p1;
    } else if (e.includes("paus")) {
      paus(true);
    } else if (e.includes("Other: ")) {
      var msg = document.createElement("p");
      var text = document.createTextNode(e);
      msg.appendChild(text);
      messages.appendChild(msg);
      messages.scrollTo(0, document.body.scrollHeight);
    } else if (e.includes("start")) {
      start2();

    } else if (e.includes("reset")) { //  dc.send("reset " + settings[0] + " " + settings[1] + " " + settings[2] + " " + settings[3] + " " + settings[4] + " " + settings[5] + " " + bAngle);
      tmp = e.split(" ");
      settings[0] = tmp[1];
      settings[1] = tmp[2];
      settings[2] = tmp[3];
      settings[3] = tmp[4];
      settings[4] = tmp[5];
      settings[5] = tmp[6];
      bAngle = tmp[7];
      load();
    } else if (e.includes("win")) {
      
    } else if (e.includes("accept")) {
      var h = document.createElement("p");
      var j = document.createTextNode("Connected");
      h.appendChild(j);
      messages.appendChild(h);
      messages.scrollTo(0, document.body.scrollHeight);
      startButton.style.display = "block";
    } else if (e.includes("")) {
      
    }
  });
  
}




//Show/Hide P2P popup
function hide() {
    if (document.querySelector("#popup").style.display == "none") {
      document.querySelector("#popup").style.display = "block";
      document.querySelector("#settings").style.display = "block";
      document.querySelector("#wiper").style.display = "block";
    } else {
      document.querySelector("#popup").style.display = "none";
      document.querySelector("#settings").style.display = "none";
      document.querySelector("#wiper").style.display = "none";
    }
    startButton.style.display = "none";
}

function AngleToRadians(angle) {
  return angle / 180* Math.PI;
}

function paus(x) {
    if (!pausTime) {
      pausTime = true;
      if (!x && onlineplay) {
        dc.send("paus");
      }
      hide();
  
      if (!paused) {
        paused = true;
        pausTime = false;
      } else {
        pausTimeout = setTimeout(function () {
          paused = false;
          pausTime = false;
        }, 1000);
    
      }
    }
  } 

function score(x) {
  if (x == "p1") {
    if (host) {
      p1++;
      score1.innerHTML = p1;
      dc.send("scorem " + p1);
    } else if (!onlineplay){
      p1++;
      score1.innerHTML = p1;
    }
  } else {
    if (host) {
      p2++;
      score2.innerHTML = p2;
      dc.send("scoreu " + p2);
    } else if (!onlineplay){
      p2++;
      score2.innerHTML = p2;
    }
  }
}

function save() {
  settings[0] = Number((sliders[0].value - 100)/100 * 0.045);
  settings[1] = Number((sliders[1].value - 100)/100 * 6);
  settings[2] = Number((sliders[2].value - 100)/100 * 75);
  settings[3] = Number((sliders[3].value - 100)/100 * 17);
  settings[4] = Number((sliders[4].value - 100)/100 * 0.04);
  settings[5] = Number(sliders[5].value);

  if (cookies) {
    saveCookie();
  }
  fullReset();
}

function askCookie() {
  cookiequest.style.display = "none";
  cookies = true;
  saveCookie();
}

function saveCookie() {

  var date = new Date();
  date.setTime(date.getTime() + 12960000000);
  var expires = "expires="+ date.toUTCString();
  for (var l = 1; l < 7; l++) {
    document.cookie = String(l) + "=" + String(settings[l-1]) + ";" + expires + ";path=/";
  }
}

function load() {
  bSpeed = settings[0];
  bSize = settings[1];
  maxAngle = settings[2];
  pSize = settings[3];
  speed = settings[4];
  win = settings[5];
  player.style.height = pSize + "vh";
  enemy.style.height = pSize + "vh";

  ball.style.height = bSize + "vh";
  ball.style.width = bSize + "vh";
}

function reset() {
  bX = 0;
  bY = 0;
  bSpeed = 0;
  circleAni(true);
 
  setTimeout(function(){ 
    bSpeed = settings[0];
    
    circleAni(false);
    }, 1500);

}

function circleAni(x) {
  if (x) {
    circle.style.display = "block";
    circle.style.webkitAnimationPlayState = "running";
  } else {
    circle.style.display = "none";
    circle.style.webkitAnimationPlayState = "paused";
  }
}



function fullReset() {
  p1 = 0;
  p2 = 0;
  score1.innerHTML = p1;
  score2.innerHTML = p2;

  bAngle = Math.random(0, 360);

  if (onlineplay && !host) {
    bAngle = bAngle - 180;
  }

  load();

  if (host) {
    dc.send("reset " + settings[0] + " " + settings[1] + " " + settings[2] + " " + settings[3] + " " + settings[4] + " " + settings[5] + " " + bAngle);
  }
  reset();
}

function resetVal(x) {
  if (x < 6) {
    sliders[x - 1].value = 200;
    values[x-1].innerHTML = sliders[x-1].value -200; 
  } else {
    sliders[x - 1].value = 5;
    values[x - 1].innerHTML = sliders[x - 1].value; 
  }
  
}

sliders[0].oninput = function () {
  values[0].innerHTML = sliders[0].value -200;
};
sliders[1].oninput = function () {
  values[1].innerHTML = sliders[1].value -200;
};
sliders[2].oninput = function () {
  values[2].innerHTML = sliders[2].value -200;
};
sliders[3].oninput = function () {
  values[3].innerHTML = sliders[3].value -200;
};
sliders[4].oninput = function () {
  values[4].innerHTML = sliders[4].value -200;
};
sliders[4].oninput = function () {
  values[4].innerHTML = sliders[4].value -200;
};
sliders[5].oninput = function () {
  values[5].innerHTML = sliders[5].value;
};


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
document.addEventListener("keyup", function(event) {
  if (event.keyCode === 27) {
    event.preventDefault();
    paus();
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


function initialize() {
  console.log(document.cookie);
  if (document.cookie != "") {
    cookies = true;
    var x2 = document.cookie.split("; ");
    for (var i = 0; i < x2.length; i++) {
      var x3 = x2[i].split("=");
      var i2 = x3[0]-1;
      settings[i2] = Number(x3[1]);
      if (i2 == 5) {
        sliders[5].value = x3[1];
        values[5].innerHTML = sliders[5].value;
      } else if (i2 == 4) { 
        sliders[4].value =  x3[1] / 0.04 * 100  + 100;
        values[4].innerHTML = sliders[4].value-200;
      } else if (i2 == 3) {
        sliders[3].value = x3[1] / 17 * 100 + 100;
        values[3].innerHTML = sliders[3].value-200;
      } else if (i2 == 2) {
        sliders[2].value = x3[1] / 75 * 100 + 100;
        values[2].innerHTML = sliders[2].value-200;
      } else if (i2 == 1) {
        sliders[1].value = x3[1] / 6 * 100 + 100;
        values[1].innerHTML = sliders[1].value-200;
      } else if (i2 == 0) {
        sliders[0].value = x3[1] / 0.045 * 100 + 100;
        values[0].innerHTML = sliders[0].value-200;
      }
    }
    load();
  } else {
    cookies = false;
    cookiequest.style.display = "block";
  }
  bAngle = Math.random(0, 360);


  initializeRTC();
  mainloop();
}


//Start mainloop
initialize();