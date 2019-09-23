import Point from './Point.js'
import Line from './Line.js'
import Util from './Util.js'

import {
  WIDTH, HEIGHT, NUM_INITIAL_LINES,
  LINE_THICKNESS, POINT_SIZE, HALF_POINT_SIZE,
  JIGGLE_FACTOR,
  USE_PRECONFIGURED_LINES,
  PRECONFIGURED_LINES
} from './config.js'

export default class Control {
  constructor(state) {
    this.state = state

    this.resetButton = document.getElementById('reset')
    this.resetButton.addEventListener('click', () => this.reset())

    this.newLineButton = document.getElementById('new-line')
    this.newLineButton.addEventListener('click', () => this.newLine())

    this.closeButton = document.getElementById('close')
    this.closeButton.addEventListener('click', () => this.close())

    this.clearButton = document.getElementById('clear')
    this.clearButton.addEventListener('click', () => this.clearAll())

    this.alignButton = document.getElementById('align')
    this.alignValue = document.getElementById('align-value')
    this.alignButton.addEventListener('click', () => this.toggleAlign())

    this.oneColorButton = document.getElementById('all-one-color')
    this.oneColorButton.addEventListener('click', () => this.allOneColor())

    this.toggleJigglingButton = document.getElementById('toggle-jiggling')
    this.toggleJigglingValue = document.getElementById('toggle-jiggling-value')
    this.toggleJigglingButton.addEventListener('click', () => this.toggleJiggling())


    this.toggleRandomColorsButton = document.getElementById('toggle-random-colors')
    this.toggleRandomColorsValue = document.getElementById('toggle-random-colors-value')
    this.toggleRandomColorsButton.addEventListener('click', () => this.toggleRandomColors())

    this.toggleDrawEvenlySpacedButton = document.getElementById('toggle-draw-evenly-spaced')
    this.toggleDrawEvenlySpacedButton.addEventListener('click', () => this.toggleDrawingEvenlySpaced())

    this.toggleMidpointsButton = document.getElementById('toggle-drawing-midpoints')
    this.toggleMidpointsValue = document.getElementById('toggle-drawing-midpoints-value')
    this.toggleMidpointsButton.addEventListener('click', () => this.toggleMidpoints())
  }

  reset() {
    this.state.lines = []
    if (USE_PRECONFIGURED_LINES) {
      PRECONFIGURED_LINES.forEach(line => {
        this.state.lines.push(line)
        this.state.lastLine = line
      })

      Line.alignControlPoints(this.state.lines[0], this.state.lines[1])
    } else {
      for (let i = 0; i < NUM_INITIAL_LINES; i++) {
        this.newLine()
      }
    }

    this.state.draw()
    return true
  }

  close() {
    let line = Line.randomLine()
    line.start = this.state.lastLine.end
    line.end = this.state.lines[0].start

    this.state.lines.push(line)
    this.state.draw()
    return true
  }

  newLine() {
    let line = Line.randomLine()
    if (this.state.lastLine) {
      line.start = this.state.lastLine.end
      line.points[0] = this.state.lastLine.end

      Line.alignControlPoints(this.state.lastLine, line)
    }
    this.state.lastLine = line

    this.state.lines.push(line)
    this.state.draw()

    return true
  }

  clearAll() {
    this.state.lines = []
    this.state.draw()
  }


  allOneColor() {
    let color = Util.randomRGB()
    this.state.lines.forEach(line => {
      line.color = color
    })
    this.state.draw()
    return true
  }

  toggleJiggling() {
    this.state.isJiggling = !this.state.isJiggling
    this.toggleJigglingValue.textContent = this.state.isJiggling
    return true
  }

  toggleRandomColors() {
    this.state.isRandomColors = !this.state.isRandomColors
    this.toggleRandomColorsValue.textContent = this.state.isRandomColors
    this.state.draw()
    return true
  }

  toggleDrawingEvenlySpaced() {
    this.state.isDrawingEvenlySpaced = !this.state.isDrawingEvenlySpaced
    this.state.draw()
    return true
  }

  toggleMidpoints() {
    this.state.isDrawingMidpoints = !this.state.isDrawingMidpoints
    this.toggleMidpointsValue.textContent = this.state.isDrawingMidpoints

    this.state.draw()
    return true
  }

  toggleAlign() {
    this.state.isControlPointsAligned = !this.state.isControlPointsAligned
    this.alignValue.textContent = this.state.isControlPointsAligned
    return true
  }
}

