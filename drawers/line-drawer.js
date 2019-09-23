import Point from '../point.js'
import Util from '../util.js'
import PointDrawer from './point-drawer.js'

import {
  WIDTH, HEIGHT, LINE_THICKNESS,
  CONTROL_LINE_COLOR,
  LINE_SPACING_THRESHOLD,
  LINE_SPACING_THICKNESS
} from '../config.js'

export default class LineDrawer {
  static draw(ctx, state, line) {
    PointDrawer.draw(ctx, line.start)
    PointDrawer.draw(ctx, line.end)

    if (state.isDrawingMidpoints) {
      PointDrawer.draw(ctx, line.control1)
      PointDrawer.draw(ctx, line.control2)

      ctx.strokeStyle = CONTROL_LINE_COLOR
      Util.line(ctx, line.control1, line.start)
      Util.line(ctx, line.control2, line.end)
    }

    LineDrawer.lerp(ctx, state, line)
  }

  static lerp(ctx, state, line) {
    if (state.isRandomColors) {
      line.color = Util.randomRGB()
    }
    ctx.fillStyle = line.color

    let distanceFromLastPoint = 0
    let lastPoint = line.start

    // take a step pixel by pixel
    let resolution = Math.max(WIDTH, HEIGHT);
    for (let i = 0; i < resolution; i++) {
      let percent = i / resolution

      let startToControl = Point.lerp(line.start, line.control1, percent)
      let controlToControl = Point.lerp(line.control1, line.control2, percent)
      let controlToEnd = Point.lerp(line.control2, line.end, percent)

      let curve1 = Point.lerp(startToControl, controlToControl, percent)
      let curve2 = Point.lerp(controlToControl, controlToEnd, percent)

      let finalPoint = Point.lerp(curve1, curve2, percent)

      ctx.fillStyle = line.color
      ctx.fillRect(finalPoint.xx, finalPoint.yy, LINE_THICKNESS, LINE_THICKNESS)

      if (state.isDrawingEvenlySpaced) {
        distanceFromLastPoint += finalPoint.distanceTo(lastPoint)
        lastPoint = finalPoint

        if (distanceFromLastPoint > LINE_SPACING_THRESHOLD) {
          ctx.fillStyle = 'white'
          ctx.fillRect(finalPoint.xx, finalPoint.yy, LINE_SPACING_THICKNESS, LINE_SPACING_THICKNESS)
          distanceFromLastPoint = 0
        }
      }
    }
  }
}
