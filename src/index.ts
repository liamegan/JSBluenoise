import { Vec2 } from "wtc-math";
import { Grid } from "le-jsgrid";
import { floatRandomBetween } from "@liamegan1/le-utils"

class BlueNoise {
  static defaults = {
    size: new Vec2(512, 512),
    offset: new Vec2(0, 0),
    r: 100,
    k: 32,
    d: 5,
    initialList: null,
    rigidity: 0,
    drawing: null
  }
  #activeList = []
  #newPositions = []
  #grid
  #r
  #k
  #d
  #size
  #offset
  #rigidity
  #drawing

  constructor(settings) {
    settings = Object.assign({}, BlueNoise.defaults, settings)
    this.#r = settings.r
    this.#k = settings.k
    this.#d = settings.d
    this.#size = settings.size
    this.#offset = settings.offset
    this.#rigidity = settings.rigidity
    this.#grid = new Grid({
      size: this.#size,
      cellSize: this.#r / Math.SQRT2,
      // cellSize: 1. / Math.SQRT2 / this.#r,
      fill: -1
    })
    this.#drawing = settings.drawing;
    if (!(settings.initialList instanceof Array))
      settings.initialList = [new Vec2(this.#size.x * 0.5, this.#size.y * 0.5)]
    this.addElementAtPosition(...settings.initialList)
  }
  addElementAtPosition(...positions) {
    positions.forEach((pos) => {
      this.#grid.addChildAtPosition(pos, pos)
      this.#activeList.push(pos)
      this.#newPositions.push(pos)
    })
  }
  draw(purge = true) {
    this.news.forEach((newPos, i) => {
      const r = 3
      const pos = newPos.addNew(this.#offset)
      this.#drawing.circle(pos, r)
      if (purge) this.news[i] = null
    })
    this.#newPositions = this.news.filter((v) => v !== null)
    // this.news.length = 0;
  }
  step() {
    const loopL = Math.min(this.active.length, this.#d)
    for (let l = 0; l < loopL; l++) {
      const ri = Math.floor(floatRandomBetween(0, this.active.length))
      const c = this.active[ri]
      let numfound = 0
      for (var i = 0; i < this.#k; i++) {
        const a = floatRandomBetween(0, Math.PI * 2)
        const l = floatRandomBetween(this.#r, this.#r * 2)
        let pos = new Vec2(Math.cos(a) * l, Math.sin(a) * l).add(c)
        // console.log(this.grid.getChildAtPosition(pos));
        if (this.grid.getChildAtPosition(pos) === -1) {
          const gridPos = this.grid.getGridPos(pos)
          let tooClose = false
          for (var i = -1; i <= 1; i++) {
            for (var j = -1; j <= 1; j++) {
              if (i == 0 && j == 0) continue
              const p = this.grid.getChildAtGridPosition(
                gridPos.addNew(new Vec2(i, j))
              )
              if (p !== -1 && p instanceof Vec2) {
                const d = pos.distance(p)
                if (d < this.#r * 0.5) tooClose = true
              }
            }
          }
          if (!tooClose) {
            const gridPosition = this.grid
              .getRealPos(this.grid.getGridPos(pos))
              .addNew(this.grid.cellSize.scaleNew(0.5))
            pos = Vec2.lerp(pos, gridPosition, this.#rigidity)
            this.grid.addChildAtPosition(pos, pos)
            this.active.push(pos)
            this.news.push(pos)
            numfound++
            break
          }
        }
      }
      if (numfound === 0) {
        this.active.splice(ri, 1)
      }
    }
  }

  get active() {
    return this.#activeList
  }
  get news() {
    return this.#newPositions
  }
  get grid() {
    return this.#grid
  }
  get offset() {
    return this.#offset
  }
}

export { BlueNoise }