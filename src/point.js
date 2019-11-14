const DEFAULT_POINT_COLOR = 'red'

export default class Point {
  constructor(xx=0, yy=0) {
    this.xx = xx
    this.yy = yy
    this.color = DEFAULT_POINT_COLOR

    this.chooseRandomDirection()
  }

  chooseRandomDirection() {
    let JIGGLE_FACTOR = 1
    this.direction = Math.random() * 360
    this.dxx = JIGGLE_FACTOR * Math.cos(this.direction)
    this.dyy = JIGGLE_FACTOR * Math.sin(this.direction)
  }

  static lerp(p1, p2, percent) {
    let dx = p2.xx - p1.xx
    let dy = p2.yy - p1.yy
    let xx = p1.xx + dx * percent
    let yy = p1.yy + dy * percent
    return new Point(xx, yy)
  }

  static mid(p1, p2) {
    return Point.lerp(p1, p2, .5)
  }

  static distanceXY(x1, y1, x2, y2) {
    let dx = x2 - x1
    let dy = y2 - y1
    return Math.sqrt(dx * dx + dy * dy)
  }

  static distancePP(p1, p2) {
    return Point.distanceXY(p1.xx, p1.yy, p2.xx, p2.yy)
  }

  static distanceP(pp, xx, yy) {
    return Point.distanceXY(pp.xx, pp.yy, xx, yy)
  }

  lerpTo(p2, percent) {
    return Point.lerp(this, p2, percent)
  }
  
  distanceTo(other) {
    return Point.distancePP(this, other)
  }

  midTo(p2) {
    return this.lerpTo(this, p2, .5)
  }
}
