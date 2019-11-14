import Point from './point.js'
import Line from './line.js'
import Util from './util.js'

import {
  WIDTH, HEIGHT
} from './config.js'

export default class Control {
  constructor(state) {
    this.state = state

    this.fillModeButton = document.getElementById('fill-mode')
    this.fillModeButton.addEventListener('click', () => this.toggleFillMode())
  }

  toggleFillMode() {
    this.state.isFillMode = true
    return true
  }
}

