class Trampi {
  constructor() {
    this.canvas = document.getElementById("trampi_canvas")
    this.ctx = this.canvas.getContext("2d")
    this.ctx.font = "15px Arial"

    this.canvasHeight = 320
    this.canvasWidth = 320
    this.score = 0

    this.bg = new Image()
    this.bg.src = "res/img/bg.svg"

    this.floorHeight = 20
    this.floorPos = this.canvasHeight - this.floorHeight
    this.enemies = []

    this.player = new TrampiPlayer()
    this.player.bindMovement()

    window.requestAnimationFrame(this.draw)
    this.generateEnemies()
  }

  drawScore = () => {
    this.ctx.fillText("Score: " + this.score, 10, 20)
    this.ctx.fillText("Multiplier: " + this.player.multiplier, 10, 50)
  }

  drawEnemies = () => {
    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i]
      if (!enemy.isDead) {
        enemy.move()
      }
      if (enemy.destroy) {
        this.enemies.splice(i, 1)
      } else {
        this.ctx.drawImage(enemy.image, enemy.x, enemy.y, enemy.width, enemy.height)
      }
    }
  }

  generateEnemies = () => {
    setInterval(() => {
      if (Math.round(Math.random())) {
        if (Math.round(Math.random())) {
          this.enemies.push(new Enemy3())
        } else {
          this.enemies.push(new Enemy())
        }
      }
    }, 600)
  }

  drawBackground = () => {
    this.ctx.drawImage(this.bg, 0, 0, 320, 320)
  }

  drawPlayer = () => {
    this.ctx.drawImage(this.player.image, this.player.x, this.player.y, this.player.height, this.player.width)
  }

  clearCanvas = () => {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
  }

  checkCollisions = () => {
    var res = this.player.checkEnemyCollision(this.enemies)
    if (res >= 0) {
      this.score += this.enemies[res].points * this.player.multiplier
      this.enemies[res].kill()
      setTimeout(() => {
        this.enemies.splice(res, 1)
      }, 300)
      this.player.jump()
      this.player.multiplier++
    } else if (res === -1) {
      this.reset()
    }
  }

  reset = () => {
    this.enemies = []
    this.player = new TrampiPlayer()
    this.player.bindMovement()
    this.score = 0
  }

  draw = () => {
    this.clearCanvas()
    this.drawBackground()

    this.player.calculatePhysics()
    this.drawPlayer()
    this.drawEnemies()
    this.checkCollisions()
    this.drawScore()
    this.player.move()
    window.requestAnimationFrame(this.draw)
  }
}

class TrampiPlayer {
  constructor() {
    this.gravity = 5
    this.jumpDuration = 400
    this.multiplier = 1

    this.image = new Image()
    this.image.src = "res/img/player.svg"
    this.isJumping = false
    this.isAirborne = false
    this.jumpingInterval = undefined
    this.playerCancelJumpInterval = undefined
    this.speed = 3
    this.height = 42
    this.width = 42
    this.groundLevel = 300 - this.height
    this.y = this.groundLevel - 100
    this.x = 150
    this.isMovingLeft = false
    this.isMovingRight = false
  }

  playDeathSound = () => {
    let music = ["E5 e", "E6 q"]

    let ac = typeof AudioContext !== "undefined" ? new AudioContext() : new webkitAudioContext()
    let tempo = 280

    let sequence = new TinyMusic.Sequence(ac, tempo, music)
    sequence.loop = false
    sequence.smoothing = 0.9
    sequence.play()
  }

  playEnemyKillSound = () => {
    let music = ["E5 e", "E6 q"]

    let ac = typeof AudioContext !== "undefined" ? new AudioContext() : new webkitAudioContext()
    let tempo = 280

    let sequence = new TinyMusic.Sequence(ac, tempo, music)
    sequence.loop = false
    sequence.smoothing = 0
    sequence.play()
  }

  calculatePhysics = () => {
    if (this.y < this.groundLevel) {
      this.y += this.gravity
      this.isAirborne = true
    } else {
      this.isAirborne = false
      this.multiplier = 1
    }
  }

  checkEnemyCollision = enemies => {
    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i]

      if (this.x + this.width > enemy.x && this.x < enemy.x + enemy.width && this.y + this.height > enemy.y && this.y < enemy.y + enemy.height) {
        return -1
      } else if (this.x + this.width > enemy.x && this.x < enemy.x + enemy.width && this.y + this.height == enemy.y) {
        return i
      }
    }
  }

  jump = () => {
    clearInterval(this.playerCancelJumpInterval)
    this.isJumping = true
    this.playerCancelJumpInterval = setTimeout(() => {
      this.isJumping = false
    }, this.jumpDuration)
  }

  bindMovement = () => {
    document.getElementById("left").addEventListener("touchstart", () => {
      this.isMovingLeft = true
    })

    document.getElementById("left").addEventListener("touchend", () => {
      this.isMovingLeft = false
    })

    document.getElementById("right").addEventListener("touchstart", () => {
      this.isMovingRight = true
    })

    document.getElementById("right").addEventListener("touchend", () => {
      this.isMovingRight = false
    })

    document.getElementById("up").addEventListener("touchstart", () => {
      if (!this.isAirborne) {
        this.jump()
      }
    })

    document.addEventListener("keypress", e => {
      if (e.code === "KeyA") {
        this.isMovingLeft = true
      }

      if (e.code === "KeyD") {
        this.isMovingRight = true
      }

      if (e.code === "Space" && !this.isAirborne) {
        this.jump()
      }
    })

    document.addEventListener("keyup", e => {
      if (e.code === "KeyA") {
        this.isMovingLeft = false
      }

      if (e.code === "KeyD") {
        this.isMovingRight = false
      }
    })
  }

  move = () => {
    if (this.isMovingLeft) {
      this.x -= this.speed
    }

    if (this.isMovingRight) {
      this.x += this.speed
    }

    if (this.isJumping) {
      this.y -= this.gravity * 2
    }
  }
}

class Enemy {
  constructor() {
    this.direction = Math.round(Math.random())
    this.x = this.direction ? -50 : 370
    this.y = 260
    this.speed = 0
    this.minspeed = 20
    this.maxspeed = 28
    this.calculateSpeed(this.minspeed, this.maxspeed)
    this.width = 40
    this.height = 40
    this.destroy = false
    this.isDead = false
    this.points = 50

    this.image = new Image()
    this.image.src = "res/img/nino.svg"
  }

  calculateSpeed = (min, max) => {
    this.speed = (Math.floor(Math.random() * (max - min)) + min) / 10
  }

  kill = () => {
    this.isDead = true
    this.height = 20
    this.y += 20
  }

  move = () => {
    if (!this.isDead) {
      if (this.direction) {
        this.x += this.speed
      } else {
        this.x -= this.speed
      }
    }

    if (this.x > 370 || this.x < -50) {
      this.destroy = true
    }
  }
}

class Enemy2 extends Enemy {
  constructor() {
    super()
    this.y = 200
    this.minspeed = 23
    this.maxspeed = 32
    this.points = 75

    this.image = new Image()
    this.image.src = "res/img/red_.svg"
  }
}

class Enemy3 extends Enemy {
  constructor() {
    super()
    this.y = 180
    this.minspeed = 28
    this.maxspeed = 35
    this.points = 100

    this.image = new Image()
    this.image.src = "res/img/nico.svg"
  }
}

window.onload = () => {
  new Trampi()
}
