import Point from './point.js'
import Line from './line.js'

export const WIDTH = window.innerWidth
export const HEIGHT = window.innerHeight
export const RANDOM_LINE_SPREAD = 100
export const NUM_INITIAL_LINES = 2

export const USE_PRECONFIGURED_LINES = false

// this point needs to be the same instance between
// the end of the first line and the start of the second
let sharedPoint = new Point(400, 200)
export const PRECONFIGURED_LINES = [
  new Line(
    new Point(50, 200),
    new Point(50, 150),
    new Point(284, 282),
    sharedPoint
  ),
  new Line(
    sharedPoint,
    new Point(600, 280),
    new Point(341, 61),
    new Point(252, 59)
  )
]

export const LINE_THICKNESS = 3
export const POINT_SIZE = 6
export const HALF_POINT_SIZE = POINT_SIZE / 2
export const JIGGLE_FACTOR = 1

export const BORDER_PADDING = 30
export const CONTROL_LINE_COLOR = 'black'
export const LINE_SPACING_THRESHOLD = 20
export const LINE_SPACING_THICKNESS = 5

export const IS_JIGGLING_INITIAL = false
export const IS_RANDOM_COLORS_INITIAL = false
export const IS_DRAWING_MIDPOINTS_INITIAL = true
export const IS_DRAWING_EVENLY_SPACED_INITIAL = false
export const IS_CONTROL_POINTS_ALIGNED_INITIAL = true
