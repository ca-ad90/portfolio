const cvs = document.getElementById("canvas");
const ctx = cvs.getContext("2d");
var gameIsStarted = false
document.body.style.cursor = "none";
var r, balls, b, br
var GamePoints = 0
const colors = [
  "green",
  "blue",
  "purple",
  "yellow",
  "red",
  "lightblue",
  "pink",
  "orange",
];
var b = [{
  speed: 4
}];
var mouseSpeed = 0.68;
var m = {
  x: 0,
  y: 0,
};

function distance(_a, _b, _c) {
  var l1 = _a;
  var ba = _b;
  var l2 = _c;
  var hig;

  var circ = l1 + l2 + ba;
  var s = circ / 2;
  hig = (2 * Math.sqrt(s * (s - l1) * (s - ba) * (s - l2))) / ba;
  return hig;
}


class gBoard {
  constructor(w, h) {
    this.p = 0
    this.cont = {
      w: w,
      h: h,
      x: 0,
      y: 0,
      fill: "transparent",
      stroke: "transparent",
    };
    this.topCont = {
      w: 0,
      h: 0,
      x: 0,
      y: this.cont.y,
      fill: "transparent",
      stroke: "transparent",
    };
    this.gameCont = {
      w: w,
      h: h,
      x: 0,
      y: 0,
      fill: "black",
      stroke: "transparent",
    };
  }

  contKeys() {
    var k = Object.keys(this);
    return k;
  }

  draw() {
    if(gameIsStarted){
     document.getElementById("point").innerText = GamePoints 
    } else {
      document.getElementById("point").innerText = "CLICK TO START" 
    }
    
    cvs.width = this.cont.w;
    cvs.height = this.cont.h;

    var x = this.contKeys();

    x.forEach((e) => {
      var a = this[e];
      ctx.beginPath();
      ctx.fillStyle = a.fill;
      ctx.strokeStyle = a.stroke;
      ctx.lineWidth = 1;
      ctx.rect(a.x, a.y, a.w, a.h);
      ctx.stroke();
      ctx.fill();
    });
  }
  clear() {
    ctx.clearRect(
      this.gameCont.x,
      this.gameCont.y,
      this.gameCont.w,
      this.gameCont.h
    );
  }
  update() {
    this.clear();
    this.draw();
  }
}
var gb = new gBoard(window.innerWidth, window.innerHeight);
gb.draw();


class block {
  constructor(points, fill) {
    this.points = points;
    this.fill = fill;
    this.stroke = `rgba(${fill.r},${fill.g},${fill.b},0.5)`
  }

  colbox() {
    var min = {
      x: this.points[0][0],
      y: this.points[0][1],
    };
    var max = {
      x: this.points[0][0],
      y: this.points[0][1],
    };

    this.points.forEach((e) => {
      if (e[0] < min.x) {
        min.x = e[0];
      }
      if (e[0] > max.x) {
        max.x = e[0];
      }

      if (e[1] < min.y) {
        min.y = e[1];
      }
      if (e[1] > max.y) {
        max.y = e[1];
      }
    });
    var bs = 1;
    b.forEach((e) => {
      if (e.speed > bs) {
        bs = e.speed;
      }
    });
    min.x = min.x - bsize / 2 - bs;
    max.x = max.x + bsize / 2 + bs;
    min.y = min.y - bsize / 2 - bs;
    max.y = max.y + bsize / 2 + bs;
    var cBox = {
      min: min,
      max: max,
    };
    return cBox;
  }
  side() {
    var sides = [];
    for (var i = 0; i < this.points.length; i++) {
      var max = this.points.length - 1;
      var q = i == max ? 0 : i + 1;
      sides[i] = {
        x: [this.points[i][0], this.points[q][0]],
        y: [this.points[i][1], this.points[q][1]],
      };
    }
    return sides;
  }

  draw() {
    ctx.beginPath();
    ctx.strokeStyle = this.stroke
    ctx.fillStyle = `rgb(${this.fill.r},${this.fill.g},${this.fill.b},1)`;
    this.points.forEach((e, i) => {
      if (i == 0) {
        ctx.moveTo(this.points[0][0], this.points[0][1]);
      } else {
        ctx.lineTo(e[0], e[1]);
      }
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}
class cSide extends block {
  constructor(points, fill, s) {
    super(points, fill);
    this.x1 = s.x[0];
    this.x2 = s.x[1];
    this.y1 = s.y[0];
    this.y2 = s.y[1];
    this.k = parseFloat(((this.y1 - this.y2) / (this.x1 - this.x2)).toFixed(4));
    this.m = parseFloat((this.y1 - this.k * this.points[0][0]).toFixed(4));
  }
}
class raSec extends block {
  constructor(points, fill, posX, posY, width, height, type) {
    super(points, fill);
    this.id = "r";
    this.fill = fill;
    this.x = posX;
    this.y = posY;
    this.w = width;
    this.h = height;
    this.type = type
    this.points = points;
    this.cBox = this.colbox();
    this.k = parseFloat(
      (
        (this.points[0][1] - this.points[1][1]) /
        (this.points[0][0] - this.points[1][0])
      ).toFixed(4)
    );
    this.m = parseFloat(
      (this.points[0][1] - this.k * this.points[0][0]).toFixed(4)
    );
    ctx.beginPath();
    var sides = this.side();
    this.sides = sides.map((e) => {
      e = new cSide(this.points, this.fill, e);
      return e;
    });

    ctx.beginPath();
    ctx.closePath();
    ctx.stroke();
    this.draw();
  }
  move() {
    if (cvs.e == "mousemove" || cvs.e =="pointermove" || cvs.e == "touchmove") {

      var oPos = this.points[0][0];
      if (this.type == 1) {

        this.points = createPoints(this.w, this.h, this.type, m.x);
      }
      if (this.type == 0) {
        this.points = createPoints(this.w, this.h, this.type, m.x);
      }

      var cx = this.x + this.w / 2;
      var nPos = this.x - this.w / 2 + (m.x - this.x);

      var maxMove = this.checkPos() - this.x
      var moveLength = Math.abs(this.x - nPos)

      if (maxMove < moveLength) {
        nPos = this.x
      }
      nPos = Math.min(Math.max(this.w + (gb.gameCont.x / 2), nPos), gb.gameCont.w - (this.w - (gb.gameCont.x)))

      this.x = nPos
      this.points = createPoints(this.w, this.h, this.type, this.x);

    } else {}

  }

  checkPos() {
    var max = Infinity
    var maxMove
    var out
    var rightX = {
      max: Math.max(this.points[0][0], this.points[3][0]),
      min: Math.min(this.points[0][0], this.points[3][0]),
      off: Math.max(this.points[0][0], this.points[3][0]) - Math.min(this.points[0][0], this.points[3][0]),
    }

    var leftX = {
      max: Math.max(this.points[1][0], this.points[2][0]),
      min: Math.min(this.points[1][0], this.points[2][0]),
      off: Math.max(this.points[1][0], this.points[2][0]) - Math.min(this.points[1][0], this.points[2][0]),
    }

    var rightY = {
      min: this.points[0][1],
      max: this.points[3][1]
    }
    var leftY = {
      min: this.points[1][1],
      max: this.points[2][1]
    }

    for (var i = 1; i < 2; i++) {
      var p = this.sides[i]

      b.forEach(e => {
        var c = this.x + this.w / 2
        var maxX = Math.max(e.cBox.max.x, e.cBox.min.x)
        var minX = Math.min(e.cBox.max.x, e.cBox.min.x)
        var maxY = Math.max(e.cBox.max.y, e.cBox.min.y)


        if (e.x > c) {
          var s = 1

        } else {
          var s = -1
        }
        if (maxY < Math.min(leftY.max, rightY.max)) {
          if (s < 0) {
            if (maxX > leftX.min && maxX < leftX.max) {
              maxMove = Math.min(maxX - (leftX.min - (leftX.off / 2)), 0)
            } else if (minX > rightX.min && minX < rightX.max) {
              maxMove = Math.min(minX - (rightX.min - (rightX.off / 2)), 0)
            }
          }
        } else {
          maxMove = Infinity
          
        }
        
        var h = Math.abs(p.y2 - p.y1)
        var tW = Math.abs(p.x2 - p.x1)
        var maxW = p.x2 > p.x1 ? p.x2 : p.x1
        var maxH = p.y2 > p.y1 ? p.y2 : p.y1


        var h2 = Math.abs(maxH - maxY)
        var hp = h2 / h
        var tp = hp * tW
        var w1 = maxW - maxX
        var hw = s * (w1 + tp)
        out = e.cBox.min.x - hw
        if (this.cBox.min.y > maxY - 1) {
          out = Infinity
          return out
        }
      })
      


      if (out < max) {
        max = out
      }


    }
    ctx.stroke()
        return maxMove

    return max
  }

  onCol(a) {
    if (a) {
      b[0].speed += 0.1;
    }
  }
  update() {
    b.forEach((e, i) => {
      //
      this.onCol(b[i].inColBox(this));
    });

    this.move();
  }
}
class brick extends block {
  static collition = false
  constructor(points, fill, index, paint) {
    super(points, fill);
    this.index = index;
    this.id = "br";
    this.cBox = this.colbox();
    this.paint = paint;
    var sides = this.side();
    this.sides = sides.map((e) => {
      e = new cSide(this.points, this.fill, e);
      return e;
    });
    if (this.paint) {
      this.draw();
    }
  }

  onCol(a) {
    if (a) {
      GamePoints += 10
      this.paint = false;
    }
  }
  update() {
    if (!brick.collition) {
      if (this.paint) {
        b.forEach((e, index) => {
          this.onCol(b[index].inColBox(this));
        });
      }
    }

  }
}
var t = [];
class ball {
  constructor(posX, posY, vx, vy, speed, size, ns, pX, pY) {
    this.x = posX;
    this.y = posY;
    this.vx = vx;
    this.vy = vy;
    this.pX = pX;
    this.pY = pY;
    this.speed = speed;
    this.size = size;
    this.nPosX = this.x + this.vx * this.speed;
    this.nPosY = this.y + this.vy * this.speed;
    this.ns = ns;
    this.k = parseFloat(this.vy / this.vx);
    this.m = parseFloat(this.y - this.k * this.x);
    this.cBox = this.colbox();
    this.draw();

    ctx.beginPath();
    ctx.moveTo(this.cBox.min.x, this.cBox.min.y);
    ctx.lineTo(this.cBox.min.x, this.cBox.max.y);
    ctx.lineTo(this.cBox.max.x, this.cBox.max.y);
    ctx.lineTo(this.cBox.max.x, this.cBox.min.y);
    ctx.closePath();
    ctx.stroke();
    this.draw();
  }
  colbox() {
    var vx = Math.abs(this.vx) / this.vx;
    var vy = Math.abs(this.vy) / this.vy;
    var min = {
      x: this.x - this.size * 1.5 - this.speed,
      y: this.y - this.size * 1.5 - this.speed,
    };
    var max = {
      x: this.x + this.size * 1.5 + this.speed,
      y: this.y + this.size * 1.5 + this.speed,
    };

    var cBox = {
      min: min,
      max: max,
    };
    return cBox;
  }

  inColBox(obj) {
    if (
      this.cBox.max.x > obj.cBox.min.x &&
      this.cBox.min.x < obj.cBox.max.x &&
      this.cBox.max.y > obj.cBox.min.y &&
      this.cBox.min.y < obj.cBox.max.y
    ) {
      var col = false;
      for (var i = 0; i < obj.sides.length; i++) {
        if (this.iSect(obj, i)) {
          col = true;
          this.collide(obj, i);
          break;
        }
      }
      return col;
    }
  }

  collide(ob, side) {
    var obj = ob.sides[side]
    var vx = this.bounce(obj).vx;
    var vy = this.bounce(obj).vy;
    this.vx = vx;
    this.vy = vy;
    brick.collition = true
  }
  move() {
    var minY = this.nPosY - this.size / 2;
    var maxY = this.nPosY + this.size / 2;
    var minX = this.nPosX - this.size / 2;
    var maxX = this.nPosX + this.size / 2;

    if (minY <= gb.gameCont.y) {
      this.ns = {
        x: this.nPosX,
        y: this.nPosY,
      };

      this.vy = this.vy * -1;
      this.speed += 0.1;
    }
    if (minY >= gb.gameCont.h) {
      gameIsStarted = false
      init()
    }


    if (maxX > gb.gameCont.w + gb.gameCont.x || minX < gb.gameCont.x) {
      this.ns = {
        x: this.nPosX,
        y: this.nPosY,
      };
      this.vx = this.vx * -1;
      this.speed += 0.1;
    }
    var dx = this.speed * this.vx;
    var dy = this.speed * this.vy;
    this.x += dx;
    this.y += dy;
    this.nPosX += dx;
    this.nPosY += dy;
  }

  iSect(ob, i) {
    var obj = ob.sides[i]

    var a = Math.hypot(obj.x1 - this.nPosX, obj.y1 - this.nPosY);
    var c = Math.hypot(obj.x2 - this.nPosX, obj.y2 - this.nPosY);
    var b = Math.hypot(obj.x2 - obj.x1, obj.y2 - obj.y1);
    var h = Math.abs(distance(a, b, c));

    var pa = Math.hypot(obj.x1 - this.x, obj.y1 - this.y);
    var pc = Math.hypot(obj.x2 - this.x, obj.y2 - this.y);
    var ph = Math.abs(distance(pa, b, pc));
    if (h > ph) {
      return
    }

    var colframe
    var ma = a - pa
    var mc = c - pc
    var mh = h - ph
    var ca = (a - this.size) / ma
    var cc = (c - this.size) / mc
    var ch = (h - this.size) / mh

    var x = a < c ? a : c;
    var y = a < c ? c : a;
    var A =
      Math.acos(
        (Math.pow(x, 2) + Math.pow(b, 2) - Math.pow(y, 2)) / (2 * c * b)
      ) / Math.PI;
    var B = Math.asin((x * Math.sin(A)) / y) / Math.PI;







    if (0.5 < A || 0.5 < B) {
      if ((ca < 1 && ca > 0) || (cc < 1 && cc > 0)) {
        this.draw();
        r.draw();
        var dirvx = this.vx == 0 ? 1 : (Math.abs(this.vx) / this.vx)
        var dirvy = this.vy == 0 ? 1 : (Math.abs(this.vy) / this.vy)
        var qx = -1 * dirvx * Math.abs(obj.x1 - this.x)
        var qy = -1 * dirvy * Math.abs(obj.y1 - this.y)
        var qv = Math.atan2(qy, qx)
        var qvx = Math.cos(qv)
        var qvy = Math.sin(qv)

        var wx = dirvx * Math.abs(obj.x2 - this.x)
        var wy = dirvy * Math.abs(obj.y2 - this.y)
        var wv = Math.atan2(wy, wx)
        var wvx = -1 * Math.cos(wv)
        var wvy = -1 * Math.sin(wv)
        this.corner = true;
        if ((ca < 1 || ca > 0)) {
          var outAng = {
            vx: qvx,
            vy: qvy
          }
          this.cAng = outAng
        }
        if ((cc < 1 && cc > 0)) {
          var outAng = {
            vx: wvx,
            vy: wvy
          }
          this.cAng = outAng
        }
        this.pX = this.x;
        this.pY = this.y;

        return true;
      } else {
        return;
      }
    }

    var vA = Math.atan(h / (b / 2));
    var vB = Math.atan(b / 2 / h);

    var v = Math.atan2(obj.y1 - this.nPosY, obj.x1 - this.nPosX);
    var vx = Math.cos(v);
    var vy = Math.sin(v);
    var lilength = 200;
    var x1 = obj.x1 - lilength * vx;
    var y1 = obj.y1 - lilength * vy;
    var x2 = obj.x1 + lilength * vx;
    var y2 = obj.y1 + lilength * vy;

    if ((ch < 1 && ch > 0)) {
      this.pX = this.x;
      this.pY = this.y;
      return true;
    }
  }

  bounce(obj) {
    var n = {}
    if (this.corner) {
      n = this.cAng
    } else {

      var incoming = Math.atan2(this.vy, this.vx) / Math.PI;
      var obsang =
        Math.atan(-1 * ((obj.y2 - obj.y1) / (obj.x2 - obj.x1))) / Math.PI;

      var normal = 0.5 - obsang;
      var out = (2 * normal - 1 - incoming) * Math.PI;
      var hypo = Math.hypot(Math.abs(this.vy), Math.abs(this.vx));

      var nx = Math.cos(out) * hypo;
      var ny = Math.sin(out) * hypo;
      var bx = Math.cos(normal * Math.PI)
      var by = Math.sin(normal * Math.PI)
      var ox = Math.cos(-1 * obsang * Math.PI)
      var oy = Math.sin(-1 * obsang * Math.PI)
      n = {
        vy: ny,
        vx: nx,
      };
    }
    r.draw();
    this.draw();





    return n;
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.fill();
  }

  update() {
    this.move();
  }
}

var bsize
var rwidth = Math.max(Math.min(200,gb.gameCont.w/8),100);
var rHeight = 15;

function createPoints(width, height, type, x) {
  var x1;
  var width = width;
  var height = height;
  var L = Math.max(gb.gameCont.w * 1.5, gb.gameCont.h)

  var offset = L - gb.gameCont.h+rHeight ;

  var R = gb.gameCont.y - offset;

  var centerX = gb.gameCont.x + gb.gameCont.w / 2;

  var w2 = width / 2;

  var outArr = new Array(4);

  for (var i = 0; i < outArr.length; i++) {
    outArr[i] = [];
  }

  if (type == 1) {
    if (x == undefined) {
      x1 = 0.5;

    } else {
      var C = L + (L / 1.5) * (mouseSpeed * 0) * 1.5;
      var D = C * 2;
      var Q = C - centerX;
      var x1 = 1 - (x + Q) / D;
    }

    function d(start, l, mx) {
      var z = mx

      var d = {
        x: 0,
        y: 0
      }
      var s = start
      var x = s + Math.cos(z * Math.PI) * l;
      d.x = x;
      var y = s + Math.sin(z * Math.PI) * l;
      d.y = y;
      return d;
    }

    outArr[0][0] = d(d(centerX, L, x1).x, width / 2, x1).y;
    outArr[0][1] = d(d(R, L, x1).y, (-1 * width) / 2, x1).x;

    outArr[1][0] = d(d(centerX, L, x1).x, (-1 * width) / 2, x1).y;
    outArr[1][1] = d(d(R, L, x1).y, width / 2, x1).x;

    outArr[2][0] = d(d(centerX, L + height, x1).x, (-1 * width) / 2, x1).y;
    outArr[2][1] = d(d(R, L + height, x1).y, width / 2, x1).x;

    outArr[3][0] = d(d(centerX, L + height, x1).x, width / 2, x1).y;
    outArr[3][1] = d(d(R, L + height, x1).y, (-1 * width) / 2, x1).x;
  }
  if (type == 0) {
    if (x == undefined) {
      x1 = centerX - w2;
    } else {
      x1 = x;
    }
    outArr[0][0] = x1;
    outArr[0][1] = gb.gameCont.y + gb.gameCont.h - 50 - height;

    outArr[1][0] = outArr[0][0] + width;
    outArr[1][1] = gb.gameCont.y + gb.gameCont.h - 50 - height;

    outArr[2][0] = outArr[1][0];
    outArr[2][1] = gb.gameCont.y + gb.gameCont.h - 50;

    outArr[3][0] = outArr[1][0] - width;
    outArr[3][1] = gb.gameCont.y + gb.gameCont.h - 50;
  }

  return outArr;
}

var layout = [
  [0, 0, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 0]

]

var layout1 = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1]
]

function createBricks(l, offX, type = 0) {
  var startX, startY
  var max = 0
  l.forEach(e => {
    max = Math.max(e.length, max)
  })
  var h = (gb.gameCont.h*0.4) / l.length
  var w = (gb.gameCont.w * 0.8) / max
  var offY = gb.gameCont.y + (h * 2)
  var bb = [];
  var c = 0;
  var col = max
  var bCount = l[0].filter(e => e != 0).length
  var row = l.length
  var mw = gb.gameCont.w / col
  type = 1

  startX = offX == "c" ? gb.gameCont.x + ((gb.gameCont.w - (w * max)) / 2) : offX
  startY = offY
  bsize = Math.min(w/Math.PI,h/Math.PI)
  if (type == 1) {
    startX = offX == "c" ? gb.gameCont.x + ((gb.gameCont.w - (w * (max / 2))) / 2) : offX
  }

  function triangle(x, y, dir) {
    var triArr = []
    switch (dir) {
      case 0:
        triArr = [
          [x, y],
          [x + w, y],
          [x + (w / 2), y + h]
        ]
        break;
      case 1:
        triArr = [
          [x, y + h],
          [x + (w / 2), y],
          [x + w, y + h],
        ]
        break;
    }
    return triArr
  }
  for (var i = 0; i < row; i++) {
    for (var j = 0; j < col; j++) {
      if (type == 0) {
        var sx = w * j + startX;
        var sy = h * i + startY;
        if (l[i][j] != 0) {
          bb[c] = [
            [sx, sy],
            [sx + w, sy],
            [sx + w, sy + h],
            [sx, sy + h],
          ];
          c++;
        }
      } else {
        if (l[i][j] != 0) {
          var tmp = []
          if (j % 2) {
            var corr = Math.floor(j / 2)
            var sx = ((w * corr) + startX) + (w / 2)
            var sy = (h * i) + startY
            if (i % 2) {
              tmp = triangle(sx, sy, 1)
            } else {
              tmp = triangle(sx, sy, 0)

            }

          } else {
            var corr = j / 2
            var sx = (w * corr) + startX
            var sy = h * i + startY

            if (i % 2) {
              tmp = triangle(sx, sy, 0)
            } else {
              tmp = triangle(sx, sy, 1)
            }

          }

          bb[c] = tmp
          c++
        }
      }
    }
  }
  
  return bb;
}
var  brock = createBricks(layout, "c", 1);
function color(n, a, r, c) {
  var clr = {}
  var del = n / a;
  var x = del * Math.PI * 2;
  var r = r || 0
  var c = c || 0
  var shiftR = r / a * Math.PI
  var rdel = (Math.sin(x + shiftR) + 1) * 50
  var gdel = (Math.sin(x + shiftR + 2 / 3 * Math.PI) + 1) * 50
  var bdel = (Math.sin(x + shiftR + 4 / 3 * Math.PI) + 1) * 50

  clr.r = (rdel / 100) * 255;
  clr.g = (gdel / 100) * 255;
  clr.b = (bdel / 100) * 255;
  return clr
}
br = brock.map((e, i) => {
  var l = brock.length
  e = new brick(e, color(i, l), i, true);
  return e;
});



function init() {
  brock = createBricks(layout, "c", 1);

  var gb = new gBoard(window.innerWidth, window.innerHeight);
gb.draw();
  GamePoints = 0
  r = new raSec(
    createPoints(rwidth, rHeight), {
      r: 100,
      g: 100,
      b: 100
    },
    gb.gameCont.w / 2 - rwidth,
    0,
    rwidth,
    rHeight,
    1
  );
  balls = [0];
  b = balls.map((e) => {
    e = new ball(
      gb.gameCont.w / 2 - bsize / 2,
      gb.gameCont.h/1.25,
      -1,
      -1,
      5,
      bsize,
      "",
      null,
      null
    );
    return e;
  });

  function color(n, a, r, c) {
    var clr = {}
    var del = n / a;
    var x = del * Math.PI * 2;
    var r = r || 0
    var c = c || 0
    var shiftR = r / a * Math.PI
    var rdel = (Math.sin(x + shiftR) + 1) * 50
    var gdel = (Math.sin(x + shiftR + 2 / 3 * Math.PI) + 1) * 50
    var bdel = (Math.sin(x + shiftR + 4 / 3 * Math.PI) + 1) * 50

    clr.r = (rdel / 100) * 255;
    clr.g = (gdel / 100) * 255;
    clr.b = (bdel / 100) * 255;
    return clr
  }
  br = brock.map((e, i) => {
    var l = brock.length
    e = new brick(e, color(i, l), i, true);
    return e;
  });
}

cvs.addEventListener("touchmove",mhandler)
cvs.addEventListener("pointermove",mhandler)
function mhandler(ev) {
  cvs.e = ev.type;
  
  if (cvs.e == "pointermove") {
    m.x = ev.offsetX;
    m.y = ev.offsetY;
    
    
  }
  if (cvs.e == "touchmove") {
    m.x = ev.touches[0].clientX;
    m.y = ev.touches[0].clientY;
    
  }
  m.x = m.x < 40 ? 40 : m.x > window.innerWidth - 40 ? window.innerWidth - 40 : m.x
}


function thandler(ev) {
  cvs.e = ev.type;
  
  if (cvs.e == "mousemove") {
    m.x = ev.offsetX;
    m.y = ev.offsetY;
    
    
  }
  if (cvs.e == "touchmove") {
    m.x = ev.touches[0].clientX;
    m.y = ev.touches[0].clientY;
    
  }
  m.x = m.x < 40 ? 40 : m.x > window.innerWidth - 40 ? window.innerWidth - 40 : m.x
}


function update() {
  gb.update();
  r.update();
  b.forEach((e) => {
    e.update();
  });

  br.forEach((e) => {
    e.update();
  });

  b = b.map((e) => {
    e = new ball(e.x, e.y, e.vx, e.vy, e.speed, e.size, e.ns);
    return e;
  });

  br = br.map((e) => {
    e = new brick(e.points, e.fill, e.index, e.paint);
    return e;
  });
  r = new raSec(r.points, r.fill, r.x, r.y, r.w, r.h, r.type);
  //requestAnimationFrame(update)
  brick.collition = false
  if(gameIsStarted){
    var bajs = setTimeout(update, 20);
  }
  
}
var oldW = window.innerWidth
window.onresize = function () {
  
  var newBrickArr = createBricks(layout,"c",1)
  gb = new gBoard(window.innerWidth, window.innerHeight);
  gb.draw();
  rWidth = Math.max(Math.min(200,gb.gameCont.w/8),100);;
  rHeight = 15;


  var o = (window.innerWidth - oldW) / 2
if(gameIsStarted){
  b = b.map((e) => {
    e = new ball(e.x, e.y, e.vx, e.vy, e.speed, bsize, e.ns);
    return e;
  });
  
  br = br.map((e,i) => {
    let newPoints = newBrickArr[i]
    e = new brick(newPoints, e.fill, e.index, e.paint);
    return e;
  });
  r = new raSec(r.points, r.fill, r.x, r.y, rWidth, rHeight, r.type);
}
  oldW = window.innerWidth
}
cvs.addEventListener('click', ()=>{
  if(!gameIsStarted){
    gameIsStarted = true
  init()
  update();
  
}
})  
init()
update();
setTimeout(function(){
  update();
  setTimeout(function(){
    update();
  },50)
},50)



update();