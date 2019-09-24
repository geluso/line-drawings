import Point from './point.js'
import Line from './Line.js'
import State from './State.js'

import LineDrawer from './drawers/line-drawer.js'
import PointDrawer from './drawers/point-drawer.js'

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

function main() {
  let canvas = document.getElementById('screen')  
  canvas.width = WIDTH
  canvas.height = HEIGHT

  canvas.addEventListener('mousedown', wrapCoordinates(fill))
  canvas.addEventListener('mousedown', wrapCoordinates(startLine))
  canvas.addEventListener('mousemove', wrapCoordinates(updateLine))
  canvas.addEventListener('mouseup', wrapCoordinates(finishLine))

  
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
  if (STATE.isFillMode) {
    return    
  }

  IS_LINING = true

  IS_FIRST = true
  IS_FIRST_XX = true
  IS_FIRST_YY = true
  LAST_XX = xx
  LAST_YY = yy

  if (LINE_POINTS.length === 0) {
    LINE_POINTS.push(new Point(LAST_XX, LAST_YY))
  } else {
    let distance = Point.distanceP(LINE_POINTS[LINE_POINTS.length - 1], LAST_XX, LAST_YY)
    console.log('start distance', distance)
    if (distance > 5) {
      LINE_POINTS.push(new Point(LAST_XX, LAST_YY))
    }
  }

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
  if (STATE.isFillMode) {
    return    
  }

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
  if (STATE.isFillMode) {
    return    
  }

  IS_LINING = false

  let distance = Point.distanceP(LINE_POINTS[LINE_POINTS.length - 1], LAST_XX, LAST_YY)
  console.log('distance', distance)
  if (distance > 5) {
    LINE_POINTS.push(new Point(LAST_XX, LAST_YY))
  }

  drawLines()

  let lines = getLines()
  if (lines.length >= 3) {
    let points = pointIntersections(lines)
    if (points.length === 3) {
      let p1 = points[0]
      let p2 = points[1]
      let p3 = points[2]
      fillThreePoints(p1, p2, p3)
    }
  }
}

function getLines() {
  let lines =[]
  for (let i = 1; i < LINE_POINTS.length; i++) {
    let line = {p1: LINE_POINTS[i - 1], p2: LINE_POINTS[i]}
    lines.push(line)
  }
  return lines
}

function pointIntersections(lines) {
  let points = []
  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      let line1 = lines[i]
      let line2 = lines[j]
      let point = doIntersect(line1, line2)
      if (point) {
        points.push(point)
      }
    }
  }
  return points
}

function fill(xx, yy) {
  if (!STATE.isFillMode) return

  let lines = getLines()
  let points = pointIntersections(lines)
  let closest = threeClosestPoints(points, xx, yy)
  fillThreePoints(...closest)
}

function threeClosestPoints(points, xx, yy) {
  points.sort((p1, p2) => {
    let d1 = Point.distanceXY(p1[0], p1[1], xx, yy)
    let d2 = Point.distanceXY(p2[0], p2[1], xx, yy)
    return d1 - d2
  })
  let closest = [points[0], points[1], points[2]]
  console.log('closest', closest)
  return closest
}

function fillThreePoints(p1, p2, p3) {
  if (!p1 || !p2 || !p3) return
  let path = CTX.beginPath()
  CTX.moveTo(p1[0], p1[1])
  CTX.lineTo(p2[0], p2[1])
  CTX.lineTo(p3[0], p3[1])
  CTX.closePath()

  CTX.fillStyle = 'black'
  CTX.fill()
}

function doIntersect(line1, line2) {
  if (line1 === line2) return

  let firstStart = line1.p1
  let firstEnd = line1.p2

  let lastStart = line2.p1
  let lastEnd = line2.p2

  let args = [
    [firstStart.xx, firstStart.yy], [firstEnd.xx, firstEnd.yy],
    [lastStart.xx, lastStart.yy], [lastEnd.xx, lastEnd.yy],
  ]

  let intersect = math.intersect(...args)
  if (intersect) {
    console.log('draw int point')
    PointDrawer.draw(CTX, new Point(intersect[0], intersect[1]))
  }

  return intersect
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

  LINE_POINTS.forEach((point, index) => {
    CTX.strokeStyle = 'black'
    CTX.strokeText(`#${index} ${point.xx},${point.yy}`, point.xx, point.yy)
  })

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

