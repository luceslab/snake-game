// Constantes del juego
const GAME_SIZE = 400;
const CELL_SIZE = 20;
const INITIAL_SNAKE_LENGTH = 4;
const GAME_SPEED = 100;

// Variables del juego
let canvas, ctx;
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let gameLoop = null;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let isPaused = false;
let isGameOver = false;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    console.log('🐍 Inicializando Snake Game...');
    setupGame();
    setupEventListeners();
    updateScores();
    showWelcomeAnimation();
});

// Configuración inicial
function setupGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = GAME_SIZE;
    canvas.height = GAME_SIZE;
    
    console.log('🎮 Canvas configurado: ' + GAME_SIZE + 'x' + GAME_SIZE);
}

// Animación de bienvenida
function showWelcomeAnimation() {
    // Animación de inicio
    anime({
        targets: '#gameCanvas',
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 1000,
        easing: 'easeOutElastic(1, .8)'
    });
    
    // Dibujar mensaje de bienvenida
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, GAME_SIZE, GAME_SIZE);
    
    ctx.fillStyle = '#4CAF50';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Snake Game', GAME_SIZE/2, GAME_SIZE/2 - 30);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.fillText('Presiona "Iniciar Juego" para comenzar', GAME_SIZE/2, GAME_SIZE/2 + 10);
    
    // Dibujar una pequeña serpiente
    drawWelcomeSnake();
}

// Dibujar serpiente de bienvenida
function drawWelcomeSnake() {
    const centerX = GAME_SIZE / 2;
    const centerY = GAME_SIZE / 2 + 50;
    
    // Cabeza
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Cuerpo
    ctx.fillStyle = '#45a049';
    for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(centerX - i * 20, centerY, 8, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Animación de la serpiente
    anime({
        targets: '#gameCanvas',
        duration: 1500,
        easing: 'easeInOutQuad',
        complete: function() {
            // Repetir la animación
            setTimeout(drawWelcomeSnake, 2000);
        }
    });
}

// Configuración de eventos
function setupEventListeners() {
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    document.addEventListener('keydown', handleKeyPress);
    
    console.log('🎮 Controles configurados');
}

// Iniciar juego
function startGame() {
    console.log('🚀 Iniciando juego...');
    
    // Reiniciar variables
    snake = [];
    score = 0;
    direction = 'right';
    nextDirection = 'right';
    isPaused = false;
    isGameOver = false;

    // Crear serpiente inicial en el centro del tablero
    const centerY = Math.floor((GAME_SIZE/CELL_SIZE) / 2);
    const startX = Math.floor((GAME_SIZE/CELL_SIZE) / 4);
    
    for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
        snake.unshift({x: startX - i, y: centerY});
    }

    // Generar primera comida
    generateFood();
    updateScores();

    // Iniciar loop
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(gameStep, GAME_SPEED);

    // Animación de inicio
    anime({
        targets: '#gameCanvas',
        borderColor: ['#4CAF50', '#2196F3'],
        duration: 1000,
        easing: 'easeInOutQuad'
    });
    
    // Cambiar texto del botón de pausa
    document.getElementById('pauseBtn').textContent = 'Pausar';
    
    console.log('🎮 Juego iniciado con éxito');
    
    // Dibujar el estado inicial
    draw();
}

// Paso del juego
function gameStep() {
    if (isPaused || isGameOver) return;

    direction = nextDirection;
    const head = {...snake[0]};

    // Mover cabeza
    switch(direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }

    // Verificar colisiones
    if (isCollision(head)) {
        gameOver();
        return;
    }

    // Añadir nueva cabeza
    snake.unshift(head);

    // Verificar si comió
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        updateScores();
        generateFood();
        // Animación de comida
        anime({
            targets: '#score',
            scale: [1, 1.2, 1],
            duration: 300,
            easing: 'easeOutElastic(1, .8)'
        });
    } else {
        snake.pop();
    }

    draw();
}

// Dibujar el juego
function draw() {
    // Limpiar canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, GAME_SIZE, GAME_SIZE);

    // Dibujar serpiente
    snake.forEach((segment, index) => {
        const gradient = ctx.createLinearGradient(
            segment.x * CELL_SIZE,
            segment.y * CELL_SIZE,
            (segment.x + 1) * CELL_SIZE,
            (segment.y + 1) * CELL_SIZE
        );
        
        if (index === 0) {
            // Cabeza
            gradient.addColorStop(0, '#4CAF50');
            gradient.addColorStop(1, '#2E7D32');
        } else {
            // Cuerpo
            gradient.addColorStop(0, '#4CAF50');
            gradient.addColorStop(1, '#45a049');
        }
        
        ctx.fillStyle = gradient;
        
        // Dibujar segmento redondeado
        ctx.beginPath();
        try {
            ctx.roundRect(
                segment.x * CELL_SIZE,
                segment.y * CELL_SIZE,
                CELL_SIZE - 1,
                CELL_SIZE - 1,
                index === 0 ? 8 : 4
            );
        } catch (e) {
            // Fallback para navegadores que no soportan roundRect
            ctx.fillRect(
                segment.x * CELL_SIZE,
                segment.y * CELL_SIZE,
                CELL_SIZE - 1,
                CELL_SIZE - 1
            );
        }
        ctx.fill();
        
        // Dibujar ojos si es la cabeza
        if (index === 0) {
            ctx.fillStyle = '#ffffff';
            
            // Posición de los ojos según la dirección
            let eyeX1, eyeY1, eyeX2, eyeY2;
            
            switch(direction) {
                case 'right':
                    eyeX1 = segment.x * CELL_SIZE + CELL_SIZE - 6;
                    eyeY1 = segment.y * CELL_SIZE + 5;
                    eyeX2 = segment.x * CELL_SIZE + CELL_SIZE - 6;
                    eyeY2 = segment.y * CELL_SIZE + CELL_SIZE - 8;
                    break;
                case 'left':
                    eyeX1 = segment.x * CELL_SIZE + 5;
                    eyeY1 = segment.y * CELL_SIZE + 5;
                    eyeX2 = segment.x * CELL_SIZE + 5;
                    eyeY2 = segment.y * CELL_SIZE + CELL_SIZE - 8;
                    break;
                case 'up':
                    eyeX1 = segment.x * CELL_SIZE + 5;
                    eyeY1 = segment.y * CELL_SIZE + 5;
                    eyeX2 = segment.x * CELL_SIZE + CELL_SIZE - 8;
                    eyeY2 = segment.y * CELL_SIZE + 5;
                    break;
                case 'down':
                    eyeX1 = segment.x * CELL_SIZE + 5;
                    eyeY1 = segment.y * CELL_SIZE + CELL_SIZE - 6;
                    eyeX2 = segment.x * CELL_SIZE + CELL_SIZE - 8;
                    eyeY2 = segment.y * CELL_SIZE + CELL_SIZE - 6;
                    break;
            }
            
            ctx.beginPath();
            ctx.arc(eyeX1, eyeY1, 2, 0, Math.PI * 2);
            ctx.arc(eyeX2, eyeY2, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Dibujar comida
    if (food && typeof food.x !== 'undefined' && typeof food.y !== 'undefined') {
        ctx.fillStyle = '#FF5722';
        ctx.beginPath();
        ctx.arc(
            food.x * CELL_SIZE + CELL_SIZE/2,
            food.y * CELL_SIZE + CELL_SIZE/2,
            CELL_SIZE/2 - 1,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Efecto de brillo para la comida
        ctx.shadowColor = '#FF5722';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(
            food.x * CELL_SIZE + CELL_SIZE/2,
            food.y * CELL_SIZE + CELL_SIZE/2,
            CELL_SIZE/2 - 3,
            0,
            Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// Generar nueva comida
function generateFood() {
    let newFood;
    let validPosition = false;
    
    // Intentar hasta 100 veces encontrar una posición válida
    for (let attempts = 0; attempts < 100 && !validPosition; attempts++) {
        newFood = {
            x: Math.floor(Math.random() * (GAME_SIZE/CELL_SIZE)),
            y: Math.floor(Math.random() * (GAME_SIZE/CELL_SIZE))
        };
        
        // Verificar que la comida no esté en la serpiente
        validPosition = !snake.some(segment => 
            segment.x === newFood.x && segment.y === newFood.y
        );
    }
    
    food = newFood;
    console.log('🍎 Nueva comida generada en: ' + food.x + ',' + food.y);
}

// Verificar colisiones
function isCollision(head) {
    // Verificar que head tenga valores válidos
    if (!head || typeof head.x === 'undefined' || typeof head.y === 'undefined') {
        console.error('Error: Cabeza de la serpiente con valores inválidos', head);
        return false;
    }
    
    // Colisión con los bordes
    if (
        head.x < 0 ||
        head.y < 0 ||
        head.x >= GAME_SIZE/CELL_SIZE ||
        head.y >= GAME_SIZE/CELL_SIZE
    ) {
        console.log('Colisión con borde detectada en:', head);
        return true;
    }
    
    // Colisión con la serpiente (excepto la cabeza)
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            console.log('Colisión con cuerpo detectada en:', head);
            return true;
        }
    }
    
    return false;
}

// Manejo de teclas
function handleKeyPress(event) {
    switch(event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (direction !== 'left') nextDirection = 'right';
            break;
        case 'p':
        case 'P':
            togglePause();
            break;
    }
}

// Pausar/Reanudar
function togglePause() {
    if (isGameOver) return;
    
    isPaused = !isPaused;
    document.getElementById('pauseBtn').textContent = isPaused ? 'Reanudar' : 'Pausar';
    
    if (isPaused) {
        // Mostrar mensaje de pausa
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, GAME_SIZE, GAME_SIZE);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('JUEGO PAUSADO', GAME_SIZE/2, GAME_SIZE/2);
        
        console.log('⏸️ Juego pausado');
    } else {
        console.log('▶️ Juego reanudado');
    }
}

// Game Over
function gameOver() {
    console.log('💀 Game Over! Puntuación: ' + score);
    
    isGameOver = true;
    clearInterval(gameLoop);
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        console.log('🏆 ¡Nuevo récord!: ' + highScore);
    }
    updateScores();

    // Animación de game over
    canvas.classList.add('game-over');
    setTimeout(() => {
        canvas.classList.remove('game-over');
    }, 500);
    
    // Mostrar mensaje de game over
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, GAME_SIZE, GAME_SIZE);
    
    ctx.fillStyle = '#FF5722';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', GAME_SIZE/2, GAME_SIZE/2 - 20);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.fillText('Puntuación: ' + score, GAME_SIZE/2, GAME_SIZE/2 + 20);
    ctx.fillText('Presiona "Iniciar Juego" para reiniciar', GAME_SIZE/2, GAME_SIZE/2 + 60);
}

// Actualizar puntuaciones
function updateScores() {
    document.getElementById('score').textContent = score;
    document.getElementById('highScore').textContent = highScore;
}