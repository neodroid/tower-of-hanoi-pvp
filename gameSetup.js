let numMiddleTowers;
let numBlocks;

document.getElementById('startButton').addEventListener('click', setupGame);

function setupGame() {
    numMiddleTowers = parseInt(document.getElementById('numMiddleTowers').value);
    numBlocks = parseInt(document.getElementById('numBlocks').value);

    if (numMiddleTowers < 3 || numBlocks < 3) {
        alert('Number of middle towers must be at least 3 and number of blocks must be at least 3.');
        return;
    }

    document.getElementById('setup').style.display = 'none';
    document.getElementById('game-board').style.display = 'block';

    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';

    createTowers(gameBoard);
    createBlocks();
    initializeGame();
}

function createTowers(gameBoard) {
    const boardWidth = 1200;
    const sideWidth = 200; // Width for blue/red sections
    const middleWidth = boardWidth - (2 * sideWidth); // Width for middle section
    
    // Blue towers (left side)
    const blueStartX = 50; // Left margin
    const blueTargetX = blueStartX + 100; // Below start tower

    // Red towers (right side)
    const redStartX = boardWidth - 50; // Right margin
    const redTargetX = redStartX - 100; // Below start tower

    // Middle towers
    const middleStartX = sideWidth;
    const middleSpacing = middleWidth / (numMiddleTowers + 1); // Even spacing

    // Create blue towers
    createTower('blue-tower-start', 'tower blue-tower', blueStartX, gameBoard);
    createTower('blue-tower-target', 'tower blue-tower target-tower', blueTargetX, gameBoard);

    // Create middle towers with even spacing
    for (let i = 0; i < numMiddleTowers; i++) {
        const x = middleStartX + ((i + 1) * middleSpacing);
        createTower(`middle-tower-${i}`, 'tower', x, gameBoard);
    }

    // Create red towers
    createTower('red-tower-start', 'tower red-tower', redStartX, gameBoard);
    createTower('red-tower-target', 'tower red-tower target-tower', redTargetX, gameBoard);
}

function createTower(id, classes, leftPosition, gameBoard) {
    const tower = document.createElement('div');
    tower.id = id;
    tower.classList.add(...classes.split(' '));
    tower.style.left = leftPosition + 'px';
    gameBoard.appendChild(tower);
    return tower;
}

function createBlocks() {
    // Create blue player's blocks (smallest to largest from top to bottom)
    for (let i = numBlocks; i >= 1; i--) {
        createBlock('blue', i, 'blue-tower-start');
    }

    // Create red player's blocks (smallest to largest from top to bottom)
    for (let i = numBlocks; i >= 1; i--) {
        createBlock('red', i, 'red-tower-start');
    }
}

function createBlock(color, size, towerId) {
    const block = document.createElement('div');
    block.id = `${color}-block-${size}`;
    block.classList.add('block', `${color}-block`);
    block.setAttribute('draggable', 'true');
    block.setAttribute('data-size', size);
    block.style.width = (40 + size * 20) + 'px';
    block.style.zIndex = '100';
    block.textContent = size;
    document.getElementById(towerId).appendChild(block);
} 