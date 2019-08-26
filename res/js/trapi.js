class Trapi {
  constructor() {
    this.canvas = document.getElementById("trapi_canvas")
    this.ctx = this.canvas.getContext("2d")

    this.canvasHeight = 320
    this.canvasWidth = 320
    this.gravity = 4
    this.jumpDuration = 300

    this.floorHeight = 20
    this.floorPos = this.canvasHeight - this.floorHeight

    this.playerImage = new Image()
    this.playerImage.src = "/res/img/player.svg"

    this.playerJumping = false
    this.playerAirborne = false
    this.playerJumpingInterval = undefined
    this.playerCancelJumpInterval = undefined
    this.playerSpeed = 3
    this.playerHeight = 42
    this.playerWidth = 42
    this.playerGroundLevel = this.canvasHeight - this.floorHeight - this.playerHeight
    this.playerY = this.playerGroundLevel - 100
    this.playerX = 40
    this.playerMovingLeft = false
    this.playerMovingRight = false

    this.enemies = []

    setInterval(this.draw, 10)
    this.playerMovementKeybinds()
    this.generateEnemies() 
  }

  calculatePhysics = () => {
    if (this.playerY < this.playerGroundLevel) {
      this.playerY += this.gravity
      this.playerAirborne = true
    } else {
      this.playerAirborne = false
    }
  }

  playerMovementKeybinds = () => {
    document.addEventListener("keypress", e => {
      if (e.code === "KeyA") {
        this.playerMovingLeft = true
      }

      if(e.code === "KeyD"){
        this.playerMovingRight = true
      }

      if(e.code === "Space" && !this.playerAirborne){
        this.playerJumping = true
        this.playerCancelJumpInterval = setTimeout(() => {
          this.playerJumping = false
        }, this.jumpDuration)
      }
    })
    
    document.addEventListener("keyup", e => {
      if (e.code === "KeyA") {
        this.playerMovingLeft = false
      }

      if (e.code === "KeyD") {
        this.playerMovingRight = false
      }

      if(e.code === "Space"){
        clearTimeout(this.playerCancelJumpInterval)
        this.playerJumping = false
      }
    })
  }

  playerMovement = () => {
    if(this.playerMovingLeft){
      this.playerX -= this.playerSpeed
    }
    
    if (this.playerMovingRight) {
      this.playerX += this.playerSpeed
    }
    
    if(this.playerJumping){
      this.playerY -= this.gravity*2
    }
  }

  drawEnemies = () => {
    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i]
      enemy.move()
      if(enemy.destroy){
        this.enemies.splice(i, 1)
      }else{
        this.ctx.drawImage(enemy.image, enemy.x, enemy.y, enemy.width, enemy.height)
      }
    }
  }

  generateEnemies = () => {
    setInterval(() => {
      if(Math.round(Math.random())){
        this.enemies.push(new Trapi_enemy())
      }
    }, 800);
  }

  drawFloor = () => {
    this.ctx.beginPath()
    this.ctx.rect(0, this.floorPos, this.canvasHeight, this.floorHeight)
    this.ctx.fillStyle = "#444444"
    this.ctx.fill()
    this.ctx.closePath()
  }

  drawPlayer = () => {
    this.ctx.drawImage(this.playerImage, this.playerX, this.playerY, this.playerHeight, this.playerWidth)
  }

  clearCanvas = () => {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
  }

  checkEnemyCollision = () => {
    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i]
      if(this.playerX + this.playerWidth > enemy.x && this.playerX < enemy.x + enemy.width && this.playerY + this.playerHeight > enemy.y){
        this.enemies = []
      }
    }
  }

  draw = () => {
    this.clearCanvas()
    this.drawFloor()

    this.calculatePhysics()
    this.drawPlayer()
    this.drawEnemies()
    this.checkEnemyCollision()
    this.playerMovement()
  }
}

class Trapi_enemy{
  constructor() {
    this.direction = Math.round(Math.random())
    this.x = this.direction ? -50 : 370
    this.y = 260
    this.speed = 2
    this.width = 40
    this.height = 40
    this.destroy = false

    this.image = new Image()
    this.image.src = "/res/img/red.svg"
  }

  move = () => {
    if(this.direction){
      this.x += this.speed
    }else{
      this.x -= this.speed
    }

    if(this.x > 370 || this.x < -50){
      this.destroy = true
    }
  }
}

window.onload = () => {
  new Trapi()
}
