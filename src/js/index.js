import '../css/index.css'
// import { generateColor } from './util'

const canvas = document.querySelector('canvas')
canvas.width = window.innerWidth
canvas.height = window.innerHeight

window.addEventListener('resize', (e) => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
})

const ctx = canvas.getContext('2d')

let mousePos = {
  x: canvas.width / 2,
  y: canvas.height / 2
}

function mouseMoveFunction (e) {
  mousePos = { x: e.x, y: e.y }
}
canvas.addEventListener('mousemove', mouseMoveFunction)

const radarSetting = {
  cx: 0,
  cy: 0,
  cv: 3,
  ca: 0.05,
  cr: 1,
  cb: 200,
  cColor: 'red',
  lx: 0,
  ly: 0,
  lr: 1,
  lAngle: Math.PI / 180 * 0,
  lAngleV: 1,
  lColor: 'black'
}

class Radar {
  constructor ({ cx, cy, cv, ca, cr, cb, cColor, lx, ly, lr, lAngle, lAngleV, lColor }) {
    this.cx = cx
    this.cy = cy
    this.cv = cv
    this.ca = ca
    this.cr = cr
    this.cb = cb
    this.cColor = cColor

    this.lx = lx
    this.ly = ly
    this.lr = lr
    this.lAngle = lAngle
    this.lAngleV = lAngleV
    this.lColor = lColor

    this.status = 'init'

    this.targets = []

    this.try = 0
  }

  drawCircle () {
    ctx.save()
    // clip circle
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.beginPath()
    ctx.arc(this.cx, this.cy, this.cb, 0, Math.PI * 2)
    ctx.clip()

    // growing circle
    ctx.beginPath()
    ctx.arc(this.cx, this.cy, this.cr, 0, Math.PI * 2)
    ctx.lineWidth = 20
    const gradient = ctx.createRadialGradient(this.cx, this.cy, this.cr * 0.8, this.cx, this.cy, this.cr)
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.05)')
    ctx.fillStyle = gradient
    ctx.fill()
    ctx.restore()
  }

  get mousePos () {
    return {
      x: mousePos.x - canvas.width / 2,
      y: mousePos.y - canvas.height / 2
    }
  }

  attachToMouse () {
    const newPos = this.mousePos
    this.cx = newPos.x
    this.cy = newPos.y

    this.lx = newPos.x
    this.ly = newPos.y
  }

  drawLine () {
    const { x, y } = this.mousePos
    ctx.save()
    ctx.beginPath()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.moveTo(x, y)
    ctx.lineTo(this.lx + this.lr, this.ly)
    ctx.stroke()
    ctx.restore()
  }

  rotateLine () {
    const { x, y } = mousePos
    ctx.save()
    ctx.beginPath()
    ctx.translate(x, y)
    ctx.moveTo(0, 0)
    ctx.rotate(this.lAngle)
    ctx.lineTo(this.cb, 0)
    ctx.stroke()
    ctx.restore()
  }

  lockTarget () {
    if (this.status === 'init') {
      canvas.removeEventListener('mousemove', mouseMoveFunction)
      this.status = 'locked'
    }
  }

  updateCircle () {
    if (this.status !== 'init') {
      if (this.cr < this.cb) {
        this.cr += this.cv
        this.cv += this.ca
      } else if (this.cr > this.cb) {
        this.cr = this.cb
      }
    } else {
      if (this.cr < this.cb + 50) {
        this.cr += this.cv
        this.cv += this.ca
      } else {
        this.cr = 0
        this.cv = 0
      }
    }
  }

  updateLine () {
    if (this.status === 'search') {
      this.lAngle = Math.PI / 180 * this.lAngleV
      if (this.lAngleV < 360) {
        this.lAngleV += 4
      } else {
        this.status = 'searchFinish'
      }
    } else if (this.status === 'searchFinish') {
      this.lAngleV = 0
      this.status = 'fire'
      if (this.lr > 0) {
        this.lr = 0
      } else {
        this.lr = 0
        this.status = 'fire'
      }
    } else {
      if (this.lr < this.cb) {
        this.lr += this.cv
      } else {
        this.lr = this.cb
        this.status = 'search'
      }
    }
  }

  run () {
    this.drawCircle()
    this.updateCircle()
    if (this.status === 'locked') {
      this.drawLine()
      this.updateLine()
    } else if (this.status === 'search') {
      this.rotateLine()
      this.updateLine()
    } else if (this.status === 'searchFinish') {
      this.drawLine()
      this.updateLine()
      canvas.addEventListener('mousemove', mouseMoveFunction)
      this.status = 'init'
      Radar.checkEnemies()
    }
  }

  static checkEnemies () {
    const numberOfEnemies = enemies.filter((enemy) => {
      return enemy.status === 'alive'
    })
    h1Span.innerHTML = numberOfEnemies.length
  }
}

class Enemy {
  constructor (x, y) {
    this.x = x || Math.random() * canvas.width
    this.y = y || Math.random() * canvas.height
    this.color = 'red'

    this.status = 'alive'

    this.targets = []
  }

  get distanceToMouse () {
    const distanceToMouse = Math.sqrt(Math.pow(mousePos.x - this.x, 2) + Math.pow(mousePos.y - this.y, 2))
    return distanceToMouse
  }

  get angleToMouse () {
    const x = this.x - mousePos.x
    const y = this.y - mousePos.y
    let angle = Math.atan2(y, x) * 180 / Math.PI
    if (angle < 0) {
      angle += 360
    }
    return angle
  }

  draw () {
    ctx.beginPath()
    ctx.arc(this.x, this.y, 10, 0, Math.PI * 2)
    ctx.fillStyle = this.color
    ctx.fill()
  }

  checkDetected () {
    if (this.distanceToMouse < radar.cb && this.angleToMouse < radar.lAngleV && radar.status !== 'init') {
      this.status = 'detected'
    }
    if (this.status === 'alive') {
      this.color = 'transparent'
    } else if (this.status === 'detected') {
      this.color = 'red'
    }
    const fire = enemies.filter((enemy) => {
      return enemy.status === 'detected'
    })

    // ctx.beginPath()
    // ctx.fillText(this.distanceToMouse, this.x + 20, this.y)
    // ctx.fillText(this.angleToMouse, this.x + 20, this.y + 20)
    // ctx.fillText(radar.lAngleV, this.x + 20, this.y + 40)
    // ctx.stroke()
  }
}

const radar = new Radar(radarSetting)

const enemies = Array.from({ length: 10 })
  .map((enemy) => {
    enemy = new Enemy()
    return enemy
  })

function clickFunction (e) {
  radar.lockTarget()
}
canvas.addEventListener('click', clickFunction)

function init () {
  requestAnimationFrame(init)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  radar.run()
  radar.attachToMouse()
  enemies.forEach((enemy) => {
    enemy.draw()
    enemy.checkDetected()
  })
}

init()

const h1Span = document.querySelector('h1 span')

Radar.checkEnemies()
