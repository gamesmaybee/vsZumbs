// Canvas configuration
const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')
canvas.width = innerWidth
canvas.height = innerHeight

// Spawn chance
let chance = 900
let score = 0
let highScore = 0
let time = 0
let start = 0
let gameSave = {}


setInterval(() => {
    if (start == 0) {
        chance = 10
    }
    if (start == 1) {
        chance = 1000000
    }

    if (time == 1) {
        chance = 800
    }
    if (time == 3) {
        chance = 700
    }
    if (time == 7) {
        chance = 500
    }
    if (time == 13) {
        chance = 300
    }
    if (time == 21) {
        chance = 250
    }
    if (time == 50) {
        chance = 200
    }
    if (time == 100) {
        chance == 150
    }
    if (time == 150) {
        chance = 100
    }
    if (time == 200) {
        chance = 90
    }
    if (time == 250) {
        chance = 80
    }
    if (time == 300) {
        chance = 70
    }
    if (time == 350) {
        chance = 65
    }
    if (time == 400) {
        chance = 60
    }
    if (time == 450) {
        chance = 55
    }
    if (time == 500) {
        chance = 40
    }

    document.getElementById('scoreSpan').innerHTML = score

}, 0);


// Classes
class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw() {
        context.beginPath()
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true)
        context.fillStyle = this.color
        context.fill()
    }
}

class Bullet {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    
    draw() {
        context.beginPath()
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true)
        context.fillStyle = this.color
        context.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Zumb {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    
    draw() {
        context.beginPath()
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true)
        context.fillStyle = this.color
        context.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

const friction = 0.98
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }

    draw() {
        context.save()
        context.globalAlpha = this.alpha
        context.beginPath()
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true)
        context.fillStyle = this.color
        context.fill()
        context.restore()
    }

    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}


// Create entities
const x = canvas.width / 2
const y = canvas.height / 2

let player = new Player(x, y, 20, 'white')
let bullets = []
let zumbs = []
let particles = []

function init() {
    canvas.width = innerWidth
    canvas.height = innerHeight
    time = 0
    score = 0
    chance = 900
    start = 0
    player = new Player(x, y, 20, 'white')
    bullets = []
    zumbs = []
    particles = []
}


// Spawn zumbs
function spawnZumb() {
    setInterval(() => {
        const chanceNum = Math.floor(Math.random() * chance)
        if (chanceNum == 1) {
            const radius = Math.random() * 25 + 15

            let x
            let y
            var velNum = (30 / radius)
            if (velNum < 1) {
                velNum = velNum * 0.9
            }

            if (Math.random() < 0.5) {
                x = Math.random() * canvas.width
                y = Math.random() > 0.5 ? 0 - radius : canvas.height + radius
            } else {
                y = Math.random() * canvas.height
                x = Math.random() > 0.5 ? 0 - radius : canvas.width + radius
            }

            const color = `hsl(${Math.random() *360}, 53%, 68%)`

            const angle = Math.atan2(
                (canvas.height / 2) - y,
                (canvas.width / 2) - x
            )
            const velocity = {
                x: Math.cos(angle) * velNum,
                y: Math.sin(angle) * velNum
            }


            zumbs.push(new Zumb(x, y, radius, color, velocity))

            start += 1
        }
    }, 5)
}


let animationID
function animate() {
    // Frame configuration
    animationID = requestAnimationFrame(animate)

    context.fillStyle = 'rgba(0, 0, 0, 0.1)'
    context.fillRect(0, 0, canvas.width, canvas.height)

    // Remove bullets on hit
    bullets.forEach((bullet, bulletIndex) => {
        bullet.update()

        if (
            bullet.x + bullet.radius < 0
            || bullet.x - bullet.radius > canvas.width
            || bullet.y + bullet.radius < 0
            || bullet.y - bullet.radius > canvas.height
        ) {
            setTimeout(() => {
                bullets.splice(bulletIndex, 1)
            }, 0);
        }
    })

    // Draw player
    player.draw()

    particles.forEach((particle, particleIndex) => {
        if (particle.alpha <= 0) {
            particles.splice(particleIndex, 1)
        } else {
            particle.update()
        }
    })

    // Zumb configuration
    zumbs.forEach((zumb, index) => {
        zumb.update()

        // End game conditions
        const distance = Math.hypot(player.x - zumb.x, player.y - zumb.y)
        if (distance - zumb.radius - player.radius < 1) {
            endGame()
        }

        // Detect collision between Zumb and bullet
        bullets.forEach((bullet, bulletIndex) => {
            const distance = Math.hypot(bullet.x - zumb.x, bullet.y - zumb.y)

            if (distance - zumb.radius < 1) {

                // Create particles
                for (let i = 0; i < zumb.radius * 2; i++) {
                    particles.push(new Particle(
                        zumb.x,
                        zumb.y,
                        Math.random() * 2,
                        zumb.color,
                        {
                            x: (Math.random() - 0.5) * ((Math.random() * 5) + 1),
                            y: (Math.random() - 0.5) * ((Math.random() * 5) + 1)
                        }
                    ))
                }

                if (zumb.radius - 10 > 10) {
                    gsap.to(zumb, 0.2, {
                        radius: zumb.radius - 10
                    })
                    score += 1
                } else {
                    setTimeout(() => {
                        zumbs.splice(index, 1)
                        score += 1
                        time += 1
                    }, 0)
                }

                bullets.splice(bulletIndex, 1)

            }   
        })
    })
}



canvas.addEventListener('click', (event) => {
    const angle = Math.atan2(
        event.clientY - canvas.height / 2,
        event.clientX - canvas.width / 2
    )
    const velocity = {
        x: Math.cos(angle) * 6,
        y: Math.sin(angle) * 6
    }

    bullets.push(
        new Bullet(
            canvas.width / 2,
            canvas.height / 2,
            6,
            '#e9eb8d',
            velocity
        )
    )
})

function endGame() {
    cancelAnimationFrame(animationID)
    document.getElementById('overScore').innerHTML = score
    if (score > highScore) {
        highScore = score
    }
    document.getElementById('highScore').innerHTML = highScore
    document.getElementById('container').style.display = 'flex'
    saveGame()
    document.getElementById('score').style.display = 'none'
}

function loadGame() {
    var savedGame = JSON.parse(localStorage.getItem('gameSave'))
    if (typeof savedGame.highScore !== 'undefined') {
        highScore = savedGame.highScore
    }
    document.getElementById('highScore').innerHTML = highScore

    document.getElementById('highScoreTwo').innerHTML = highScore
}

function saveGame() {
    gameSave = {
        highScore: highScore
    }
    localStorage.setItem('gameSave', JSON.stringify(gameSave))
}

window.onload = function() {
    loadGame()
    document.getElementById('container2').style.display = 'flex'
    document.getElementById('score').style.display = 'none'
}

function startGame() {
    init()
    animate()
    spawnZumb()
    document.getElementById('container').style.display = 'none'
    document.getElementById('container2').style.display = 'none'
    document.getElementById('score').style.display = 'block'
}