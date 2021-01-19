
var bounce = false;

function collision(bY, bX, bSize, pSize, py, py2) {
    if (bY >= 48 - bSize / 4) {
        postMessage("1");
        
    } else if (bY <= -48 + bSize / 4) {
        postMessage("2");
    }
 
    //paddle left collsion
    if (bX <= -49.5 + (bSize / 4)) {
        if (bX <= -55 - bSize / 2) {
            postMessage("3");
        } else if (Math.abs((py-50+ (pSize/2) -bY) / (pSize/2 + bSize/2)) <= 1 && !bounce) {
            bouncer();
            bounce = true;
            postMessage("5");
        }
    }

  //paddle right collision
    if (bX >= 49.5 - (bSize / 4)) {
        if (Math.abs((py2-50+ (pSize/2) -bY) / (pSize/2 + bSize/2)) <= 1 && !bounce) {
        bouncer();
        bounce = true;
        postMessage("6");
        } else if (bX >= 55 - bSize / 2) {
            postMessage("4");
        }

    }

}

function bouncer() {
  setTimeout(function(){ 
    bounce = false;
    }, 750);
}

onmessage = function (e) {
    collision(e.data[0], e.data[1], e.data[2], e.data[3], e.data[4], e.data[5]);
};