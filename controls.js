import Point from './Point.js'
import Line from './Line.js'
import Util from './Util.js'

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

