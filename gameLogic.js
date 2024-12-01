function initializeGame() {
    const blocks = document.querySelectorAll('.block');
    const towers = document.querySelectorAll('.tower');
    const turnIndicator = document.getElementById('turn-indicator');
    let draggedBlock = null;
    let currentPlayer = 'blue';

    // Show turn indicator
    turnIndicator.style.display = 'block';
    updateTurnIndicator();

    blocks.forEach(block => {
        block.addEventListener('dragstart', dragStart);
        block.addEventListener('dragend', dragEnd);
        // Make sure blocks are draggable
        block.draggable = true;
    });

    towers.forEach(tower => {
        tower.addEventListener('dragover', dragOver);
        tower.addEventListener('drop', drop);
        // Add dragenter to prevent default
        tower.addEventListener('dragenter', (e) => e.preventDefault());
    });

    function dragStart(event) {
        const block = event.target;
        
        // Check if it's the player's turn
        const isBlueBlock = block.classList.contains('blue-block');
        if ((currentPlayer === 'blue' && !isBlueBlock) || 
            (currentPlayer === 'red' && isBlueBlock)) {
            event.preventDefault();
            return;
        }

        const tower = block.parentElement;
        const blocksOnTower = Array.from(tower.querySelectorAll('.block'));
        const topBlock = blocksOnTower[blocksOnTower.length - 1];

        if (block !== topBlock) {
            event.preventDefault();
            return;
        }

        draggedBlock = block;
        // Set the drag data
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', '');
    }

    function dragEnd(event) {
        draggedBlock = null;
    }

    function dragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }

    function drop(event) {
        event.preventDefault();
        const targetTower = event.currentTarget;

        if (!draggedBlock || !isValidMove(targetTower)) return;

        moveBlock(targetTower);
        
        // Switch turns and update indicator
        currentPlayer = currentPlayer === 'blue' ? 'red' : 'blue';
        updateTurnIndicator();
        
        checkWinCondition();
    }

    function isValidMove(targetTower) {
        const blocksOnTargetTower = Array.from(targetTower.querySelectorAll('.block'));
        const topBlockOnTargetTower = blocksOnTargetTower[blocksOnTargetTower.length - 1];
        const draggedBlockSize = parseInt(draggedBlock.getAttribute('data-size'));
        const topBlockSize = topBlockOnTargetTower ? 
            parseInt(topBlockOnTargetTower.getAttribute('data-size')) : Infinity;

        if (draggedBlockSize >= topBlockSize) return false;

        const blockColor = draggedBlock.classList.contains('blue-block') ? 'blue' : 'red';
        const towerId = targetTower.id;

        // Blue can only move to blue towers or middle towers
        if (blockColor === 'blue' && !towerId.includes('blue') && !towerId.includes('middle')) {
            return false;
        }
        // Red can only move to red towers or middle towers
        if (blockColor === 'red' && !towerId.includes('red') && !towerId.includes('middle')) {
            return false;
        }

        return true;
    }

    function moveBlock(targetTower) {
        const oldTower = draggedBlock.parentElement;
        oldTower.removeChild(draggedBlock);
        targetTower.appendChild(draggedBlock);
        updateBlockPositions(oldTower);
        updateBlockPositions(targetTower);
        draggedBlock = null;
    }

    function updateBlockPositions(tower) {
        const blocks = Array.from(tower.querySelectorAll('.block'));
        const isStartTower = tower.id.includes('start');
        
        blocks.forEach((block, index) => {
            if (isStartTower) {
                // For start towers, build up from bottom, so smaller blocks are on top
                const reversedIndex = blocks.length - 1 - index;
                block.style.top = (50 + (35 * reversedIndex)) + 'px';
                block.style.bottom = 'auto';
            } else {
                // For target towers, build up from bottom
                block.style.bottom = (50 + (35 * index)) + 'px';
                block.style.top = 'auto';
            }
        });
    }

    function checkWinCondition() {
        const blueWinTower = document.getElementById('blue-tower-target');
        const redWinTower = document.getElementById('red-tower-target');

        const blueBlocks = blueWinTower.querySelectorAll('.blue-block');
        const redBlocks = redWinTower.querySelectorAll('.red-block');

        if (blueBlocks.length === numBlocks) {
            alert('Blue player wins! 🎉');
            resetGame();
        }
        if (redBlocks.length === numBlocks) {
            alert('Red player wins! 🎉');
            resetGame();
        }
    }

    function resetGame() {
        document.getElementById('game-board').style.display = 'none';
        document.getElementById('setup').style.display = 'block';
        document.getElementById('turn-indicator').style.display = 'none';
    }

    function updateTurnIndicator() {
        turnIndicator.textContent = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)} Player's Turn`;
        turnIndicator.className = currentPlayer === 'blue' ? 'blue-turn' : 'red-turn';
    }

    // Initial positioning of blocks
    towers.forEach(tower => {
        updateBlockPositions(tower);
    });
} 