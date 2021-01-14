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

const circle = document.querySelector("#circle");
const smokel = document.querySelector("#smokel");
const smoker = document.querySelector("#smoker");
const dustl = document.querySelector("#dustl");
const dustr = document.querySelector("#dustr");


var settings = [0.045, 6, 75, 17, 0.04, 5];

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
  bounce = false,
  prevbSpeed = 0,
  cookies = false,
  pausTime = false,
  pausTimeout = null,
  maxAngle = null;


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

// Collision...
function collision() {
  if (bY >= 48 - bSize/4) {
    bAngle *= -1;
    bY = 47- bSize/4;
    if (host) {
      dc.send("boll: " + bAngle + ' ' + bX + ' ' + bY);
    }
  } else if (bY <= -48 + bSize/4) {
    bAngle *= -1;
    bY = -47 + bSize/4;
    if (host) {
      dc.send("boll: " + bAngle + ' ' + bX + ' ' + bY);
    }
  }
 
  //paddle left collsion
  if (bX <= -49.5 + (bSize/4) && bY >= py - 50 && bY <= py + pSize && !bounce) {
    bAngle += 180 - ((bY - py + 50 - 8.5) / 75 * 360);
    bX = -49 + bSize/4;
    bouncer();
    bounce = true;
    
    if (host) {
      dc.send("boll: " + bAngle + ' ' + bX + ' ' + bY);
    }
  } else if (bX <= -55 - bSize/2) {
    reset();
    score("p1");
    if (host) {
      dc.send("boll: " + bAngle + ' ' + bX + ' ' + bY);
      score("p1");
    }
  }

  //paddle right collision
  if (bX >= 49.5 - (bSize/4) && bY >= py2 - 50&& bY <= py2 + pSize&& !bounce) {
    bAngle += 180 - ((bY - py2 + 50 - 8.5) / 75 * 360);
    bX = 49 - bSize/4;
    bouncer();
    bounce = true;
    if (host) {
      dc.send("boll: " + bAngle + ' ' + bX + ' ' + bY);
    }
  } else if (bX >= 55 - bSize/2) {
    reset();
    score();
    if (host) {
      dc.send("boll: " + bAngle + ' ' + bX + ' ' + bY);
      score();
    }

    }
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
    var msg = document.createElement("p");
      var text = document.createTextNode("Connected");
      msg.appendChild(text);
      messages.appendChild(msg);
      messages.scrollTo(0, document.body.scrollHeight);
    startButton.style.display = "block";
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

  getId();
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
    var msg = document.createElement("p");
      var text = document.createTextNode("Connected");
      msg.appendChild(text);
      messages.appendChild(msg);
      messages.scrollTo(0, document.body.scrollHeight);     
    startButton.style.display = "block";
  });

  dc.on('close', function () {
    var msg = document.createElement("p");
      var text = document.createTextNode("Connection closed!");
      msg.appendChild(text);
      messages.appendChild(msg);
      messages.scrollTo(0, document.body.scrollHeight);
  });
  
  data();
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
  hide();
  onlineplay = true;
}

function start2() {
  host = false;
  bAngle -= 180;
  hide();
  onlineplay = true;
  
}

function data() {
  dc.on('data', function (e) {
    if (e.includes("pong: ")) {
      var tmp = e.split(" ");
      py2 = 83 - Number(tmp[1]);
    } else if (e.includes("boll: ")) {
      var tmp2 = e.split(" ");
      bAngle = Number(tmp2[1]) - 180;
      bX = 0 - Number(tmp2[2]);
      bY = 0 - Number(tmp2[3]);

    } else if (e.includes("scorem")) {
      score("p1");

    } else if (e.includes("scoreu")) {
      score();

    } else if (e.includes("paus")) {
      paus();
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

}

function AngleToRadians(angle) {
  return angle / 180* Math.PI;
}

function bouncer() {
  setTimeout(function(){ 
    bounce = false;
    }, 750);
}

function paus() {
  if (!pausTime) {
    pausTime = true;
    if (host) {
      dc.send("paus");
    } else {
      hide();
    }
  
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
    p1++;
    score1.innerHTML = p1;

    if (host) {
      dc.send("scorem");
    }
  } else {
    p2++;
    score2.innerHTML = p2;
    if (host) {
      dc.send("scorem");
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
  if (host) {
    dc.send("set: " + bSpeed + " " + bSize + " " + bAngle + " " + pSize + " " + speed + " " + win);
  }
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
  load();
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

  initializeRTC();
  mainloop();
}


//Start mainloop
initialize();