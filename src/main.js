import Point from './point.js'
import Line from './line.js'
import State from './state.js'

import LineDrawer from './drawers/line-drawer.js'
import PointDrawer from './drawers/point-drawer.js'

import Util from './util.js'

import {
  WIDTH, HEIGHT, NUM_INITIAL_LINES,
  LINE_THICKNESS, POINT_SIZE, HALF_POINT_SIZE,
  JIGGLE_FACTOR,
  IS_DRAWING_INTERSECTION_POINTS,
} from './config.js'

let CTX
let SELECTED = null

let STATE = new State(drawLines)

document.addEventListener('DOMContentLoaded', main)

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
  //canvas.addEventListener('mouseout', wrapCoordinates(finishLine))
  
  let randomFillButton = document.getElementById('random-fill')
  randomFillButton.addEventListener('click', randomFill)

  let grayscaleFillButton = document.getElementById('grayscale-fill')
  grayscaleFillButton.addEventListener('click', grayscaleFill)

  let showAllIntersectsButton = document.getElementById('show-all-intersects')
  showAllIntersectsButton.addEventListener('click', showAllIntersects)

  CTX = canvas.getContext('2d')
}

function wrapCoordinates(func) {
  return (ev) => {
    let xx = ev.offsetX
    let yy = ev.offsetY
    func(xx, yy)
  }
}

let LINE_GROUPS = []
let LINE_POINTS = []

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

  let forceLastPoint = true
  drawLines(forceLastPoint)
}

function finishLine(xx, yy) {
  if (STATE.isFillMode) {
    return    
  }

  IS_LINING = false

  let distance = Point.distanceP(LINE_POINTS[LINE_POINTS.length - 1], LAST_XX, LAST_YY)
  if (distance > 5) {
    LINE_POINTS.push(new Point(LAST_XX, LAST_YY))
  }

  LINE_GROUPS.push(LINE_POINTS)
  LINE_POINTS = []

  drawLines()
}

function getLines() {
  let lines =[]
  LINE_GROUPS.forEach(group => {
    for (let i = 1; i < group.length; i++) {
      let line = {p1: group[i - 1], p2: group[i]}
      lines.push(line)
    }
  })
  return lines
}

function pointIntersections(lines) {
  // lines is an array of [{p1, p2}] objects with .xx and .yy values
  // points is an array of arrays like [[xx,yy], [xx,yy]]
  // yeah, it's inconsistent and annoying.
  let points = []

  for (let i = 0; i < lines.length; i++) {
    let line1 = lines[i]

    for (let j = i + 1; j < lines.length; j++) {
      let line2 = lines[j]

      let point = doIntersect(line1, line2)
      if (point) {
        points.push(point)
      }
    }
  }

  // always add the very last point
  let last = lines[lines.length - 1]
  points.push([last.p2.xx, last.p2.yy])
  
  LINE_GROUPS.forEach(linePoints => {
    // always add the first point of each line
    let first = linePoints[0]
    points.push([first.xx, first.yy])
    //PointDrawer.draw(CTX, first.p1)

    // always add the very last point
    let last = linePoints[linePoints.length - 1]
    points.push([last.xx, last.yy])

    if (IS_DRAWING_INTERSECTION_POINTS) {
      PointDrawer.draw(CTX, last)
    }
  })

  return points
}

function fill(xx, yy, color, backgroundColor) {
  if (!STATE.isFillMode) return

  let lines = getLines()
  let points = pointIntersections(lines)
  let closest = threeClosestPoints(points, xx, yy)
  fillThreePoints(...closest, color, backgroundColor)
}

function randomFill() {
  STATE.isFillMode = true

  for (let i = 0; i < 100; i++) {
    let color = randomRGB()
    let backgroundColor = randomRGB()
    fill(Math.random() * WIDTH, Math.random() * HEIGHT, color, backgroundColor)
  }

  STATE.isFillMode = false
}

function grayscaleFill() {
  STATE.isFillMode = true

  let choices = ['black', 'gray', 'lightgray']
  let backgroundColor = 'white'
  for (let i = 0; i < 100; i++) {
    let index = Math.floor(choices.length * Math.random())
    let color = choices[index]
    fill(Math.random() * WIDTH, Math.random() * HEIGHT, color, backgroundColor)
  }

  STATE.isFillMode = false
}

function showAllIntersects() {
  let lines = getLines()
  let points = pointIntersections(lines)
  points.forEach(intersect => {
    PointDrawer.draw(CTX, new Point(intersect[0], intersect[1]))
  })
}

function threeClosestPoints(points, xx, yy) {
  points.sort((p1, p2) => {
    let d1 = Point.distanceXY(p1[0], p1[1], xx, yy)
    let d2 = Point.distanceXY(p2[0], p2[1], xx, yy)
    return d1 - d2
  })
  let closest = [points[0], points[1], points[2]]
  return closest
}

function fillThreePoints(p1, p2, p3, color, backgroundColor) {
  if (!p1 || !p2 || !p3) return
  let path = CTX.beginPath()
  CTX.moveTo(p1[0], p1[1])
  CTX.lineTo(p2[0], p2[1])
  CTX.lineTo(p3[0], p3[1])
  CTX.closePath()

  color = color || randomRGB()
  backgroundColor = backgroundColor || 'white'

  CTX.fillStyle = color
  document.body.style.backgroundColor = backgroundColor

  CTX.fill()
}

function randomRGB() {
  let red = Math.random() * 256
  let green = Math.random() * 256
  let blue = Math.random() * 256
  return `rgb(${red}, ${green}, ${blue})`
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
  // console.log('intersect', intersect)
  // console.log('first', firstStart, firstEnd)
  // console.log('second', lastStart, lastEnd)

  if (intersect) {
    let isAlongLine1 = alongLine(intersect, line1)
    let isAlongLine2 = alongLine(intersect, line2)
    if (!isAlongLine1 || !isAlongLine2) {
      //console.log('not along either line')
      return false
    }

    let xx = intersect[0]
    let yy = intersect[1]
    //CTX.strokeText(`${xx},${yy}`, xx, yy)
    //PointDrawer.draw(CTX, new Point(intersect[0], intersect[1]))
  }

  return intersect
}

function alongLine(intersect, line) {
  let minXX = Math.min(line.p1.xx, line.p2.xx)
  let maxXX = Math.max(line.p1.xx, line.p2.xx)

  let minYY = Math.min(line.p1.yy, line.p2.yy)
  let maxYY = Math.max(line.p1.yy, line.p2.yy)

  let xx = intersect[0]
  let yy = intersect[1]

  let insideX = minXX <= xx && xx <= maxXX
  let insideY = minYY <= yy && yy <= maxYY
  //console.log('in xx', insideX, minXX, xx, maxXX)
  //console.log('in yy', insideX, minYY, yy, maxYY)
  return insideX && insideY
}

function drawLines(isForcingLastPoint=false) {
  CTX.clearRect(0, 0, WIDTH, HEIGHT)

  LINE_GROUPS.forEach(drawOneLineGroup)
  drawOneLineGroup(LINE_POINTS, isForcingLastPoint)
}

function drawOneLineGroup(lines, isForcingLastPoint) {
  for (let i = 1; i < lines.length; i++) {
    let p1 = lines[i - 1] 
    let p2 = lines[i] 
    Util.line(CTX, p1, p2)
  }

  if (isForcingLastPoint) {
    let last1 = lines[lines.length - 1]
    let last2 = new Point(LAST_XX, LAST_YY)
    Util.line(CTX, last1, last2)
  }

  lines.forEach((point, index) => {
    CTX.strokeStyle = 'black'
    // CTX.strokeText(`#${index} ${point.xx},${point.yy}`, point.xx, point.yy)
  })
}

