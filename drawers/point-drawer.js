import {
  POINT_SIZE, HALF_POINT_SIZE
} from '../config.js'

export default class PointDrawer {
  static draw(ctx, point) {
    ctx.fillStyle = point.color
    let xx = point.xx - HALF_POINT_SIZE
    let yy = point.yy - HALF_POINT_SIZE
    ctx.fillRect(xx, yy, POINT_SIZE, POINT_SIZE)
  }
}
