class Trampi {
  constructor() {
    this.canvas = document.getElementById("trampi_canvas")
    this.ctx = this.canvas.getContext("2d")
    this.ctx.font = "25px Arial"

    this.canvasHeight = 600
    this.canvasWidth = 600
    this.score = 0

    this.bg = new Image()
    this.bg.src = "res/img/bg.svg"

    this.floorHeight = 20
    this.floorPos = this.canvasHeight - this.floorHeight
    this.enemies = []

    this.player = new TrampiPlayer(this.canvasHeight, this.canvasWidth)
    this.player.bindMovement()

    window.requestAnimationFrame(this.draw)
    this.generateEnemies()
  }

  drawScore = () => {
    this.ctx.fillText("Score: " + this.score, 10, 30)
    this.ctx.fillText("Multiplier: " + this.player.multiplier, 10, 65)
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
      var rand = Math.floor(Math.random() * (100 - 0)) + 1

      if (this.score < 2500) {
        if (rand > 96) {
          this.enemies.push(new Enemy(1, this.canvasWidth, this.canvasHeight))
        }
      } else if (this.score < 5000) {
        if (rand > 99) {
          this.enemies.push(new Enemy(1, this.canvasWidth, this.canvasHeight))
        } else if (rand > 95) {
          this.enemies.push(new Enemy(2, this.canvasWidth, this.canvasHeight))
        }
      } else {
        if (rand > 99) {
          this.enemies.push(new Enemy(1, this.canvasWidth, this.canvasHeight))
        } else if (rand > 97) {
          this.enemies.push(new Enemy(2, this.canvasWidth, this.canvasHeight))
        } else if (rand > 95) {
          this.enemies.push(new Enemy(3, this.canvasWidth, this.canvasHeight))
        }
      }
    }, 50)
  }

  drawBackground = () => {
    this.ctx.drawImage(this.bg, 0, 0, this.canvasHeight, this.canvasWidth)
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
        for (let i = 0; i < this.enemies.length; i++) {
          if (this.enemies[i].isDead) {
            this.enemies.splice(i, 1)
          }
        }
      }, 300)
      this.player.jump()
      this.player.playJumpSound()
      this.player.multiplier++
    } else if (res === -1) {
      this.player.playDeathSound()
      this.reset()
    }
  }

  reset = () => {
    this.enemies = []
    this.player = new TrampiPlayer(this.canvasHeight, this.canvasWidth)
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
  constructor(canvasHeight, canvasWidth) {
    this.gravity = 10
    this.jumpDuration = 400
    this.multiplier = 1

    this.image = new Image()
    this.image.src = "res/img/player.svg"
    this.isJumping = false
    this.isAirborne = false
    this.jumpingInterval = undefined
    this.playerCancelJumpInterval = undefined
    this.speed = 3
    this.height = 100
    this.width = 100
    this.groundLevel = canvasHeight - 20 - this.height
    this.y = this.groundLevel - 100
    this.x = (canvasWidth - this.width) / 2
    this.isMovingLeft = false
    this.isMovingRight = false
  }

  playDeathSound = () => {
    this.deathSound = new Audio("res/audio/uh.mp3")
    this.deathSound.play()
  }

  playJumpSound = () => {
    this.jumpSound = new Audio("res/audio/boing.mp3")
    this.jumpSound.play()
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
      var puffer = enemy.width / 4

      if (this.x + this.width > enemy.x + puffer && this.x < enemy.x + enemy.width - puffer && this.y + this.height > enemy.y && this.y < enemy.y + enemy.height) {
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
        this.playJumpSound()
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
        this.playJumpSound()
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
  constructor(level, canvasWidth, canvasHeight) {
    this.direction = Math.round(Math.random())
    this.speed = 0
    this.width = 100
    this.height = 100
    this.destroy = false
    this.isDead = false
    this.canvasWidth = canvasWidth

    this.image = new Image()
    this.x = this.direction ? -50 : canvasWidth + 50

    if (level === 3) {
      this.minspeed = 40
      this.maxspeed = 50
      this.points = 150
      this.height = 110
      this.y = canvasHeight - this.height - 300
      this.image.src = "res/img/ho.svg"
    } else if (level === 2) {
      this.minspeed = 28
      this.maxspeed = 35
      this.points = 85
      this.width = 120
      this.y = canvasHeight - this.height - 200
      this.image.src = "res/img/nico.svg"
    } else {
      this.minspeed = 20
      this.maxspeed = 28
      this.points = 50
      this.y = canvasHeight - this.height - 20
      this.image.src = "res/img/nino.svg"
    }

    this.calculateSpeed(this.minspeed, this.maxspeed)
  }

  calculateSpeed = (min, max) => {
    this.speed = (Math.floor(Math.random() * (max - min)) + min) / 10
  }

  kill = () => {
    this.isDead = true
    this.height = this.height / 2
    this.y += this.height
  }

  move = () => {
    if (!this.isDead) {
      if (this.direction) {
        this.x += this.speed
      } else {
        this.x -= this.speed
      }
    }

    if (this.x > this.canvasWidth + 50 || this.x < -50) {
      this.destroy = true
    }
  }
}

window.onload = () => {
  new Trampi()
}
