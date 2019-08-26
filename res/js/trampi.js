class Trampi {
  constructor() {

    this.canvas = document.getElementById("trampi_canvas")
    this.ctx = this.canvas.getContext("2d")
    this.ctx.font = "15px Arial"

    this.canvasHeight = 320
    this.canvasWidth = 320
    this.score = 0

    this.floorHeight = 20
    this.floorPos = this.canvasHeight - this.floorHeight
    this.enemies = []

    this.player = new TrampiPlayer()
    this.player.bindMovement()

    setInterval(this.draw, 10)
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
      } else {
        enemy.height = 20
        enemy.y = 280
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
        this.enemies.push(new TrampiEnemy())
      }
    }, 800)
  }

  drawFloor = () => {
    this.ctx.beginPath()
    this.ctx.rect(0, this.floorPos, this.canvasHeight, this.floorHeight)
    this.ctx.fillStyle = "#444444"
    this.ctx.fill()
    this.ctx.closePath()
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
      this.enemies[res].isDead = true
      this.player.playEnemyKillSound()
      setTimeout(() => {
        this.enemies.splice(res, 1)
      }, 300)
      this.player.jump()
      this.player.multiplier++
    } else if (res === -2) {
      this.player.playDeathSound()
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
    this.drawFloor()

    this.player.calculatePhysics()
    this.drawPlayer()
    this.drawEnemies()
    this.checkCollisions()
    this.drawScore()
    this.player.move()
  }
}

class TrampiPlayer {
  constructor() {
    this.gravity = 4
    this.jumpDuration = 200
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

      if (enemy.isDead) {
        return -1
      }

      if (this.x + this.width > enemy.x && this.x < enemy.x + enemy.width && this.y + this.height > enemy.y) {
        return -2
      } else if (this.x + this.width > enemy.x && this.x < enemy.x + enemy.width && this.y + this.height == enemy.y) {
        return i
      } else {
        return -1
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

class TrampiEnemy {
  constructor() {
    this.direction = Math.round(Math.random())
    this.x = this.direction ? -50 : 370
    this.y = 260
    this.speed = 2
    this.width = 40
    this.height = 40
    this.destroy = false
    this.isDead = false
    this.points = 50

    this.image = new Image()
    this.image.src = "res/img/red.svg"
  }

  move = () => {
    if (this.direction) {
      this.x += this.speed
    } else {
      this.x -= this.speed
    }

    if (this.x > 370 || this.x < -50) {
      this.destroy = true
    }
  }
}

window.onload = () => {
  new Trampi()
}
