var game

class Trampi {
  constructor() {
    this.canvas = document.getElementById("trampi_canvas")
    this.ctx = this.canvas.getContext("2d")
    this.ctx.font = "25px Arial"

    this.canvasHeight = 600
    this.canvasWidth = 600
    this.score = 5000
    this.isPaused = false

    this.bg = new Image()
    this.bg.src = "res/img/bg.svg"

    this.floorHeight = 20
    this.floorPos = this.canvasHeight - this.floorHeight
    this.enemies = []

    this.player = new TrampiPlayer(this)
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
      if (!enemy.isDead && !this.isPaused) {
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
      if (this.isPaused) {
        return false
      }

      var rand = Math.floor(Math.random() * (100 - 0)) + 1

      if (this.score < 2500) {
        if (rand > 96) {
          this.enemies.push(new Enemy(1, this))
        }
      } else if (this.score < 5000) {
        if (rand > 99) {
          this.enemies.push(new Enemy(2, this))
        } else if (rand > 95) {
          this.enemies.push(new Enemy(1, this))
        }
      } else if (this.score < 10000) {
        if (rand > 99) {
          this.enemies.push(new Enemy(3, this))
        } else if (rand > 97) {
          this.enemies.push(new Enemy(2, this))
        } else if (rand > 95) {
          this.enemies.push(new Enemy(1, this))
        }
      } else {
        if (rand > 99) {
          this.enemies.push(new Enemy(4, this))
        } else if (rand > 97) {
          this.enemies.push(new Enemy(3, this))
        } else if (rand > 95) {
          this.enemies.push(new Enemy(2, this))
        } else if (rand > 93) {
          this.enemies.push(new Enemy(1, this))
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
    this.player = new TrampiPlayer(this)
    this.player.bindMovement()
    this.score = 0
    this.isPaused = false
  }

  draw = () => {
    this.clearCanvas()
    this.drawBackground()

    this.player.calculatePhysics(this.isPaused)
    this.drawPlayer()
    this.drawEnemies()
    this.checkCollisions()
    this.drawScore()
    this.player.move()
    window.requestAnimationFrame(this.draw)
  }
}

class TrampiPlayer {
  constructor(game) {
    this.gravity = 10
    this.jumpDuration = 400
    this.multiplier = 1
    this.game = game
    this.jumpForce = 0

    this.image = new Image()
    this.image.src = "res/img/player.svg"
    this.isJumping = false
    this.isAirborne = false
    this.jumpingInterval = undefined
    this.playerCancelJumpInterval = undefined
    this.speed = 4
    this.height = 100
    this.width = 100
    this.groundLevel = this.game.canvasHeight - 20 - this.height
    this.y = this.groundLevel - 100
    this.x = (this.game.canvasWidth - this.width) / 2
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
    if (this.game.isPaused) {
      return false
    }

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

      if (this.x + this.width > enemy.x + puffer && this.x < enemy.x + enemy.width - puffer && this.y + this.height > enemy.y + 15 && this.y < enemy.y + enemy.height) {
        return -1
      } else if (this.x + this.width > enemy.x && this.x < enemy.x + enemy.width && this.y + this.height > enemy.y && this.y + this.height < enemy.y + 15) {
        return i
      }
    }
  }

  jump = () => {
    clearTimeout(this.jumpTimeout)
    this.jumpForce = 200
    this.jumpTimeout = setTimeout(() => {
      this.playerCancelJumpInterval = setInterval(() => {
        this.jumpForce -= 20
        if (this.jumpForce == 0) {
          clearInterval(this.playerCancelJumpInterval)
        }
      }, 10)
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

      if (e.code === "KeyP") {
        this.game.isPaused = !this.game.isPaused
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
    if (this.game.isPaused) {
      return false
    }

    if (this.isMovingLeft) {
      this.x -= this.speed
    }

    if (this.isMovingRight) {
      this.x += this.speed
    }

    if (this.jumpForce > 0) {
      this.y -= this.jumpForce / 10
    }
  }
}

class Enemy {
  constructor(level, game) {
    this.game = game
    this.direction = Math.round(Math.random())
    this.speed = 0
    this.width = 100
    this.height = 100
    this.destroy = false
    this.isDead = false

    this.image = new Image()
    this.x = this.direction ? -50 : this.game.canvasWidth + 50

    if (level === 4) {
      this.minspeed = 40
      this.maxspeed = 50
      this.points = 150
      this.height = 110
      this.y = this.game.canvasHeight - this.height - 380
      this.image.src = "res/img/ho.svg"
    } else if (level === 3) {
      this.minspeed = 28
      this.maxspeed = 35
      this.points = 100
      this.width = 120
      this.y = this.game.canvasHeight - this.height - 200
      this.image.src = "res/img/nico.svg"
    } else if (level === 2) {
      this.minspeed = 25
      this.maxspeed = 50
      this.points = 75
      this.width = 70
      this.y = this.game.canvasHeight - this.height - 40
      this.image.src = "res/img/gian.svg"
    } else {
      this.minspeed = 20
      this.maxspeed = 28
      this.points = 50
      this.y = this.game.canvasHeight - this.height - 20
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

    if (this.x > this.game.canvasWidth + 50 || this.x < -50) {
      this.destroy = true
    }
  }
}

window.onload = () => {
  window.game = new Trampi()
}
