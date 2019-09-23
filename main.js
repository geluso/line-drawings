import Point from './point.js'
import Line from './Line.js'
import State from './State.js'

import LineDrawer from './drawers/line-drawer.js'

import Util from './util.js'

import {
  WIDTH, HEIGHT, NUM_INITIAL_LINES,
  LINE_THICKNESS, POINT_SIZE, HALF_POINT_SIZE,
  JIGGLE_FACTOR
} from './config.js'

let CTX
let SELECTED = null

let STATE = new State(draw)

main()

window.requestAnimationFrame(jiggleLoop)
function jiggleLoop() {
  if (STATE.isJiggling) {
    jiggle()
  }
  window.requestAnimationFrame(jiggleLoop)
}

document.addEventListener('mousedown', wrapCoordinates(startLine))
document.addEventListener('mousemove', wrapCoordinates(updateLine))
document.addEventListener('mouseup', wrapCoordinates(finishLine))

function main() {
  let canvas = document.getElementById('screen')  
  canvas.width = WIDTH
  canvas.height = HEIGHT
  
  CTX = canvas.getContext('2d')
}

function draw() {
  CTX.clearRect(0, 0, WIDTH, HEIGHT)
  STATE.lines.forEach(line => {
    LineDrawer.draw(CTX, STATE, line)
  })
}

function getAllPoints() {
  let points = STATE.lines.reduce((accum, line) => {
    return accum.concat(line.points)
  }, [])
  return points
}

function select(xx, yy) {
  let minDistance
  let closest

  getAllPoints().forEach(pp => {
    let distance = Point.distanceP(pp, xx, yy)
    if (!closest || distance < minDistance) {
      closest = pp
      minDistance = distance
    }
  })

  return closest
}

function wrapCoordinates(func) {
  return (ev) => {
    let xx = ev.offsetX
    let yy = ev.offsetY
    func(xx, yy)
  }
}

function mousedown(xx, yy) {
  SELECTED = select(xx, yy)
}

function mousemove(xx, yy) {
  if (SELECTED) {
    SELECTED.xx = xx
    SELECTED.yy = yy

    for (let i = 1; i < STATE.lines.length; i++) {
      let line1 = STATE.lines[i - 1]
      let line2 = STATE.lines[i]
      Line.alignControlPoints(line1, line2)
    }

    let firstLine = this.state.lines[0]
    let lastLine = this.state.lines[this.state.lines.length - 1]
    if (lastLine.end === firstLine.start) {
      Line.alignControlPoints(lastLine, firstLine)
    }

    draw()
  }
}

function mouseup(xx, yy) {
  SELECTED = null
}

const LINE_POINTS = []
let IS_FIRST = true
let IS_LINING = false

let IS_FIRST_XX = false
let IS_FIRST_YY = false
let LAST_XX = 0
let LAST_YY = 0

let IS_LEFT = false
let IS_RIGHT = false
let IS_UP = false
let IS_DOWN = false

let IS_FIRST_LEFT = false
let IS_FIRST_RIGHT = false
let IS_FIRST_UP = false
let IS_FIRST_DOWN = false

function startLine(xx, yy) {
  IS_LINING = true

  IS_FIRST = true
  IS_FIRST_XX = true
  IS_FIRST_YY = true
  LAST_XX = xx
  LAST_YY = yy

  LINE_POINTS.push(new Point(xx, yy))

  IS_LEFT = false
  IS_RIGHT = false
  IS_UP = false
  IS_DOWN = false

  IS_FIRST_LEFT = false
  IS_FIRST_RIGHT = false
  IS_FIRST_UP = false
  IS_FIRST_DOWN = false

  console.log('start line')
  drawLines()
}

function updateLine(xx, yy) {
  if (!IS_LINING) return

  IS_LEFT = xx < LAST_XX
  IS_RIGHT = xx > LAST_XX

  IS_UP = yy < LAST_YY
  IS_DOWN = yy > LAST_YY

  // restrict to only moving in one quadrant. no backsies
  if (IS_FIRST_XX && (xx !== LAST_XX)) {
    IS_FIRST_XX = false
    IS_FIRST_LEFT = IS_LEFT
    IS_FIRST_RIGHT = IS_RIGHT
  }

  if (IS_FIRST_YY && (yy !== LAST_YY)) {
    IS_FIRST_YY = false
    IS_FIRST_UP = IS_UP
    IS_FIRST_DOWN = IS_DOWN
  }

  let STRIKE_X = false
  let STRIKE_Y = false
  if (IS_FIRST_LEFT && IS_LEFT || IS_FIRST_RIGHT && IS_RIGHT) {
    LAST_XX = xx
  } else {
    STRIKE_X = true
  }

  if (IS_FIRST_UP && IS_UP || IS_FIRST_DOWN && IS_DOWN) {
    LAST_YY = yy
  } else {
    STRIKE_Y = true
  }

  if (STRIKE_X && STRIKE_Y) {
    startLine(xx, yy)
  }

  console.log('update line')
  drawLines()
}

function finishLine(xx, yy) {
  IS_LINING = false

  console.log('finish line')
  LINE_POINTS.push(new Point(LAST_XX, LAST_YY))
  drawLines()
}

function drawLines() {
  CTX.clearRect(0, 0, WIDTH, HEIGHT)

  for (let i = 1; i < LINE_POINTS.length; i++) {
    let p1 = LINE_POINTS[i - 1] 
    let p2 = LINE_POINTS[i] 
    Util.line(CTX, p1, p2)
  }

  let last1 = LINE_POINTS[LINE_POINTS.length - 1]
  let last2 = new Point(LAST_XX, LAST_YY)
  Util.line(CTX, last1, last2)
}

function jiggle() {
  getAllPoints().forEach(pp => {
    pp.xx += pp.dxx
    pp.yy += pp.dyy

    if (pp.xx < 0 || pp.yy < 0 || pp.xx > WIDTH || pp.yy > HEIGHT) {
      pp.chooseRandomDirection()
    }

    pp.xx = Math.max(pp.xx, 0)
    pp.xx = Math.min(pp.xx, WIDTH)

    pp.yy = Math.max(pp.yy, 0)
    pp.yy = Math.min(pp.yy, HEIGHT)
  })

  for (let i = 1; i < STATE.lines.length; i++) {
    let line1 = STATE.lines[i - 1]
    let line2 = STATE.lines[i]
    Line.alignControlPoints(line1, line2)
  }

  draw()
}

