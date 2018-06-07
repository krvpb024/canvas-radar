// 環境變數
var updateFPS = 30
var showMouse = true
var time = 0
var bgColor = 'black'

// 控制
var controls = {
  value: 0
}
var gui = new dat.GUI()
gui.add(controls, 'value', -2, 2).step(0.01).onChange(function (value) {})

// ------------------------
// Vec2

class Vec2 {
  constructor (x, y) {
    this.x = x
    this.y = y
  }
  set (x, y) {
    this.x = x
    this.y = y
  }
  move (x, y) {
    this.x += x
    this.y += y
  }
  add (v) {
    return new Vec2(this.x + v.x, this.y + v.y)
  }
  sub (v) {
    return new Vec2(this.x - v.x, this.y - v.y)
  }
  mul (s) {
    return new Vec2(this.x * s, this.y * s)
  }
  get length () {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }
  set length (nv) {
    let temp = this.unit.mul(nv)
    this.set(temp.x, temp.y)
  }
  clone () {
    return new Vec2(this.x, this.y)
  }
  toString () {
    return `(${this.x}, ${this.y})`
  }
  equal (v) {
    return this.x == v.x && this.y == v.y
  }
  get angle () {
    return Math.atan2(this.y, this.x)
  }
  get unit () {
    return this.mul(1 / this.length)
  }
}
var a = new Vec2(3, 4)

// ------

var canvas = document.getElementById('mycanvas')
var ctx = canvas.getContext('2d')
ctx.circle = function (v, r) {
  this.arc(v.x, v.y, r, 0, Math.PI * 2)
}
ctx.line = function (v1, v2) {
  this.moveTo(v1.x, v1.y)
  this.lineTo(v2.x, v2.y)
}

function initCanvas () {
  ww = canvas.width = window.innerWidth
  wh = canvas.height = window.innerHeight
}
initCanvas()

function init () {

}
function update () {
  time++
}
function draw () {
  // 清空背景
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, ww, wh)

  // -------------------------
  //   在這裡繪製

  let degToPi = Math.PI / 180

  // 繪製中心線段
  ctx.beginPath()
  ctx.moveTo(ww / 2, 0)
  ctx.lineTo(ww / 2, wh)
  ctx.moveTo(0, wh / 2)
  ctx.lineTo(ww, wh / 2)
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'
  ctx.stroke()

  ctx.save()
  // 抓到滑鼠跟中心的差距向量
  ctx.translate(ww / 2, wh / 2)
  let delta = mousePos.sub(new Vec2(ww / 2, wh / 2))
  // 取得角度跟距離
  let mouseAngle = delta.angle
  let mouseDistance = delta.length


  // 繪製以距離為半徑的圓形
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(delta.x, delta.y)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(0, 0, mouseDistance, 0, Math.PI * 2)
  ctx.stroke()

  ctx.fillStyle = 'white'
  ctx.fillText(parseInt(mouseAngle / Math.PI * 180) + '度', 10, -10)
  ctx.fillText('r=' + mouseDistance, mouseDistance + 10, 10)

  // 繪製光
  ctx.beginPath()
  ctx.moveTo(0, 0)
  let light_r = mouseDistance
  ctx.save()
  // 從
  ctx.rotate(mouseAngle - 10 * degToPi)
  ctx.lineTo(light_r, 0)
  ctx.rotate(20 * degToPi)
  ctx.lineTo(light_r, 0)
  ctx.fillStyle = '#ffd428'
  ctx.fill()
  ctx.restore()

  // 繪製敵人的點點
  let enemies = [
    {r: 100, angle: 45},
    {r: 50, angle: -50},
    {r: 250, angle: 160},
    {r: 140, angle: -120}
  ]

  // 把每個敵人抓出來繪製
  enemies.forEach(p => {
    ctx.save()
    ctx.beginPath()
    ctx.rotate(p.angle * degToPi)
    ctx.translate(p.r, 0)
    ctx.arc(0, 0, 5, 0, Math.PI * 2)

    // 當角度介於燈光的角度跟距離區間時，把顏色變為紅色
    let color = (
      Math.abs(p.angle * degToPi - mouseAngle) < 10 * degToPi &&
        p.r < mouseDistance
    ) ? 'red':'white'
    ctx.fillStyle = color
    ctx.fill()
    ctx.restore()
  })


  ctx.restore()

  // -----------------------
  // 繪製滑鼠座標

  ctx.fillStyle = 'red'
  ctx.beginPath()
  ctx.circle(mousePos, 2)
  ctx.fill()

  ctx.save()
  ctx.beginPath()
  ctx.translate(mousePos.x, mousePos.y)
  ctx.strokeStyle = 'red'
  let len = 20
  ctx.line(new Vec2(-len, 0), new Vec2(len, 0))
  ctx.line(new Vec2(0, -len), new Vec2(0, len))
  ctx.fillText(mousePos, 10, -10)
  ctx.stroke()
  ctx.restore()

  // schedule next render

  requestAnimationFrame(draw)
}
function loaded () {
  initCanvas()
  init()
  requestAnimationFrame(draw)
  setInterval(update, 1000 / updateFPS)
}
window.addEventListener('load', loaded)
window.addEventListener('resize', initCanvas)

// 滑鼠事件跟紀錄
var mousePos = new Vec2(0, 0)
var mousePosDown = new Vec2(0, 0)
var mousePosUp = new Vec2(0, 0)

window.addEventListener('mousemove', mousemove)
window.addEventListener('mouseup', mouseup)
window.addEventListener('mousedown', mousedown)
function mousemove (evt) {
  mousePos.set(evt.offsetX, evt.offsetY)
  // console.log(mousePos)
}
function mouseup (evt) {
  mousePos.set(evt.offsetX, evt.offsetY)
  mousePosUp = mousePos.clone()
}
function mousedown (evt) {
  mousePos.set(evt.offsetX, evt.offsetY)
  mousePosDown = mousePos.clone()
}
