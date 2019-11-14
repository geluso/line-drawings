import {
  WIDTH, HEIGHT, RANDOM_LINE_SPREAD,
  BORDER_PADDING
}  from './config.js'

import Point from './point.js'
import Util from './util.js'

const DEFAULT_LINE_COLOR = 'white'

export default class Line {
  constructor(start, control1, control2, end) {
    this.start = start || new Point()
    this.control1 = control1 || new Point()
    this.control2 = control2 || new Point()
    this.end = end || new Point()

    this.points = [this.start, this.control1, this.control2, this.end]
    this.color = Util.randomRGB()
  }

  static randomLine() {
    let centerX = (WIDTH - RANDOM_LINE_SPREAD) * Math.random()
    let centerY = (HEIGHT - RANDOM_LINE_SPREAD) * Math.random()
    centerX = Util.clamp(BORDER_PADDING, centerX, WIDTH - BORDER_PADDING)
    centerY = Util.clamp(BORDER_PADDING, centerY, HEIGHT - BORDER_PADDING)

    // choose random whether the offset will be positive or negative
    let negs = [
      Math.random() < .5 ? 1 : -1,
      Math.random() < .5 ? 1 : -1,

      Math.random() < .5 ? 1 : -1,
      Math.random() < .5 ? 1 : -1,

      Math.random() < .5 ? 1 : -1,
      Math.random() < .5 ? 1 : -1
    ]

    let startX = negs[0] * RANDOM_LINE_SPREAD * Math.random() + centerX
    let startY = negs[1] * RANDOM_LINE_SPREAD * Math.random() + centerY

    let control2X = negs[2] * RANDOM_LINE_SPREAD * Math.random() + centerX
    let control2Y = negs[3] * RANDOM_LINE_SPREAD * Math.random() + centerY

    let endX = negs[4] * RANDOM_LINE_SPREAD * Math.random() + centerX
    let endY = negs[5] * RANDOM_LINE_SPREAD * Math.random() + centerY

    return new Line(
      new Point(startX, startY),
      new Point(centerX, centerY),
      new Point(control2X, control2Y),
      new Point(endX, endY)
    )
  }

  static alignControlPoints(first, second) {
    let c1 = first.control2
    let c2 = second.control1

    let dx = first.end.xx - first.control2.xx
    let dy = first.end.yy - first.control2.yy

    second.control1.xx = second.start.xx + dx
    second.control1.yy = second.start.yy + dy
  }
}
