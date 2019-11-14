export default {
  randomRGB: () => {
    let red = Math.random() * 256
    let green = Math.random() * 256
    let blue = Math.random() * 256
    return `rgb(${red}, ${green}, ${blue})`
  },

  clamp: (min, val, max) => {
    return Math.min(Math.max(val, min), max)
  },

  line: (ctx, p1, p2) => {
    ctx.beginPath()
    ctx.moveTo(p1.xx, p1.yy)
    ctx.lineTo(p2.xx, p2.yy)
    ctx.stroke()
  }
}

