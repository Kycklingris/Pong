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
const winText = document.querySelector("#winText");

const circle = document.querySelector("#circle");
const smokel = document.querySelector("#smokel");
const smoker = document.querySelector("#smoker");
const dustl = document.querySelector("#dustl");
const dustr = document.querySelector("#dustr");

const ogSettings = [0.045, 6, 75, 17, 0.04, 5];
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
  Id = null,
  pausLock = false;


var pc = null;
var dc = null;
var lastpeerid = null;

function mainloop(now) {
  delta = now - prev;
  prev = now;

  if (!paused) {
    if (!onlineplay) {
      bot();
    }
    if (onlineplay) {
      online();
      if (host) {
        setInterval(dc.send("boll: " + bAngle + ' ' + bX + ' ' + bY), 400);
      }
    }
    winCheck();
    collision();
    pmove();
    bmove();

  }
    requestAnimationFrame(mainloop);
}


region.onmousemove = function cursor(e) {
  var y = e.clientY;
   ty = y / space.clientHeight;
  ty = ty * 100 - pSize/2;

};

// Player Movement
function pmove() { 
  if (py-1 > ty && py > 0) {
    py -= speed * delta;
  } else if (py+1 < ty && py < 100) {
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

function winCheck() {
  if (p1 >= win) {
    fullReset();
    displayWinText("You win!");
    paus(true);

  } else if (p2 >= win) {
    fullReset();
    displayWinText("You lose!");
    paus(true);
  }
}

function displayWinText(e) {
  winText.style.display = "block";
  winText.innerHTML = e;
  setTimeout(function () {
    winText.style.display = "none";
  }, 1500);
}


//bot for singelplayer
function bot() {
  var Y = bY + 50 - pSize/2;
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

//Collision Webworker message handling
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
    score();
    if (host) {
      dc.send("boll: " + bAngle + ' ' + bX + ' ' + bY);
    }
  } else if (e.data.includes("4")) {
    reset();
    score("p1");
    if (host) {
      dc.send("boll: " + bAngle + ' ' + bX + ' ' + bY);
    }
  } else if (e.data.includes("5")) {
    bAngle += 90;
    bX = -49 + bSize / 4;
    if (host) {
      dc.send("boll: " + bAngle + ' ' + bX + ' ' + bY);
    }

  } else {

    bAngle += 180 + ((bY - py2 + 50 - pSize/2) / maxAngle * 360);
    bX = 49 - bSize / 4;
    if (host) {
      dc.send("boll: " + bAngle + ' ' + bX + ' ' + bY);
    }
  }
};




function initializeRTC() {
  pc = new Peer(null, {
    debug: 2
  });

  pc.on('open', function () {  // kopierat
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
      if (dc && dc.open) {    // kopierat
          c.on('open', function() {
              c.send("Already connected to another client");
              setTimeout(function() { c.close(); }, 500);
          });
          return;
      }
    dc = c;
    data();
  });

  pc.on("disconnected", function () {  // kopierat men ändrat vart den skickar det.
    paus();
    chat("Connection to server lost, reconnecting");
    console.log('Connection to server lost, reconnecting');
    fullReset();

    pc.id = lastpeerid;
    pc._lastServerId = lastpeerid;
    pc.reconnect();

  });

  pc.on("error", function (err) { // kopierat men ändrat vart den skickar det.
    console.log(err);
    chat("" + err);
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
  }
  if (x) {
    clearInterval(joinInterval);
  }

  if (!dc) {
    Id = textfield.value;
    joinInterval = setInterval(tryJoin, 2000);
    return;
  }

  data();
}

function tryJoin() {
  chat("Retrying...");  
  
  dc = pc.connect(Id, {
    reliable: true
  });

  dc.on('open', function () {
    clearInterval(joinInterval);
    join();
    setTimeout(function(){ 
    dc.send("accepted");
    }, 500);
    chat("connected");  
    startButton.style.display = "block";
    onlineplay = true;
    pausLock = true;
    return;
  });
  dc.on('close', function () {
      chat("Disconnected");
      resetRTC();
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

function resetRTC() {
  if (pc) {
    pc.destroy();
  }
  joinButt.disabled = false;
  startButton.style.display = "none";
  fullReset();
  initializeRTC();
  onlineplay = false;
  host = null;
}


function online() {
  enemy.style.marginTop = py2 + "vh";
}

//Choosing host
function start() {
  dc.send("start");
  host = true;
  startButton.style.display = "none";
  fullReset();
  paus();
  pausLock = false;
}

function start2() {
  host = false;
  startButton.style.display = "none";
  fullReset();
  pausLock = false;
}

function data() {
  var tmp = null;
  dc.on('data', function (e) {
    if (e.includes("pong: ")) {
      tmp = e.split(" ");
      py2 = 100 - pSize - Number(tmp[1]);                // kanske fel
    } else if (e.includes("boll: ")) {
      tmp = e.split(" ");
      bAngle = Number(tmp[1]) - 180;
      bX = 0 - Number(tmp[2]);
      bY = 0 - Number(tmp[3]);

    } else if (e.includes("scorem")) {
      tmp = e.split(" ");
      p2 = tmp[1];
      score2.innerHTML = p2;
      reset();
    } else if (e.includes("scoreu")) {
      tmp = e.split(" ");
      p1 = tmp[1];
      score1.innerHTML = p1;
      reset();
    } else if (e.includes("paus")) {
      paus(true);
    } else if (e.includes("Other: ")) {
      chat(e);
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
      fullReset();
    } else if (e.includes("Already connected to another client")) {
      chat("Fuck off I'm already playing with someone else!");

      
    }else if (e.includes("accepted")) {
      console.log("Connected to: " + dc.peer);
      chat("Connected");
      startButton.style.display = "block";
      onlineplay = true;
      pausLock = true;
    }else if (e.includes("")) {
      
    }
  });
  
}




function chat(x) {
  var msg = document.createElement("p");
  var text = document.createTextNode(x);
  msg.appendChild(text);
  messages.appendChild(msg);
  messages.scrollTo(0, document.body.scrollHeight);
}
function AngleToRadians(angle) {
  return angle / 180* Math.PI;
}

// Show/Hide settings
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

  for (var i = 0; i < sliders.length; i++) {
    if (i == 2 || i == 5) {
      settings[i] = Number(sliders[i].value);
    } else if (sliders[i].value < 0) {
      settings[i] = ogSettings[i] / Math.abs(Number(sliders[i].value));
    } else if (sliders[i].value > 0) {
      settings[i] = ogSettings[i] * Math.abs(Number(sliders[i].value));
    } else {
      settings[i] = ogSettings[i]; 
    } 
  }
  console.log(settings);

  if (cookies) {
    saveCookie();
  }
  
  if (onlineplay) {
    dc.send("reset " + settings[0] + " " + settings[1] + " " + settings[2] + " " + settings[3] + " " + settings[4] + " " + settings[5] + " " + bAngle);
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

  for (var i = 0; i < sliders.length; i++) {
    if (i == 2 || i == 5) {
      sliders[i].value = settings[i];
      values[i].innerHTML = sliders[i].value;
    } else if (settings[i] < ogSettings[i]) {
      sliders[i].value = -ogSettings[i]/settings[i];
      values[i].innerHTML = sliders[i].value;
    } else if (settings[i] > ogSettings[i]) {
      sliders[i].value = settings[i]/ogSettings[i];
      values[i].innerHTML = sliders[i].value;
    } else {
      sliders[i].value = 0;
      values[i].innerHTML = sliders[i].value;
    }
  }
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
  reset();
}

function resetVal(x) {
  if (x == 6) {
    sliders[x - 1].value = 5;
    values[x - 1].innerHTML = sliders[x - 1].value; 
    
  } else if( x == 5){
    sliders[x - 1].value = 0;
    values[x-1].innerHTML = sliders[x-1].value; 
  } else if( x == 4){
    sliders[x - 1].value = 0;
    values[x-1].innerHTML = sliders[x-1].value; 
  } else if( x == 3){
    sliders[x - 1].value = 50;
    values[x-1].innerHTML = sliders[x-1].value; 
  } else if( x == 2){
    sliders[x - 1].value = 0;
    values[x-1].innerHTML = sliders[x-1].value; 
  } else if( x == 1){
    sliders[x - 1].value = 0;
    values[x-1].innerHTML = sliders[x-1].value; 
  }
  
}

sliders[0].oninput = function () {
  values[0].innerHTML = sliders[0].value;
};
sliders[1].oninput = function () {
  values[1].innerHTML = sliders[1].value;
};
sliders[2].oninput = function () {
  values[2].innerHTML = sliders[2].value;
};
sliders[3].oninput = function () {
  values[3].innerHTML = sliders[3].value;
};
sliders[4].oninput = function () {
  values[4].innerHTML = sliders[4].value;
};
sliders[4].oninput = function () {
  values[4].innerHTML = sliders[4].value;
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
    if (!pausLock) {
      paus();
    } 
  }
});
space.addEventListener("click", function (event) {
if (!pausLock) {
      paus();
    } 
});
region.addEventListener("click", function (event) {
  if (!pausLock) {
      paus();
    } 
});
wiper.addEventListener("click", function (event) {
  if (!pausLock) {
      paus();
    } 
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