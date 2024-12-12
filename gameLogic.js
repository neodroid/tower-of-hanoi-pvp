function initializeGame() {
    const blocks = document.querySelectorAll('.block');
    const towers = document.querySelectorAll('.tower');
    const turnIndicator = document.getElementById('turn-indicator');
    let draggedBlock = null;
    let currentPlayer = 'blue';
    let moveHistory = [];

    // Show turn indicator
    turnIndicator.style.display = 'block';
    updateTurnIndicator();

    // Record initial state
    recordGameState();

    blocks.forEach(block => {
        block.addEventListener('dragstart', dragStart);
        block.addEventListener('dragend', dragEnd);
        block.draggable = true;
    });

    towers.forEach(tower => {
        tower.addEventListener('dragover', dragOver);
        tower.addEventListener('drop', drop);
        tower.addEventListener('dragenter', (e) => e.preventDefault());
    });

    function dragStart(event) {
        const block = event.target;
        
        // Check if it's the player's turn
        const isBlueBlock = block.classList.contains('blue-block');
        if ((currentPlayer === 'blue' && !isBlueBlock) || 
            (currentPlayer === 'red' && isBlueBlock)) {
            event.preventDefault();
            alert('It is not your turn!');
            return;
        }

        const tower = block.parentElement;
        const blocksOnTower = Array.from(tower.querySelectorAll('.block'));
        const topBlock = blocksOnTower[blocksOnTower.length - 1];

        if (block !== topBlock) {
            event.preventDefault();
            alert('You can only move the top block on a tower!');
            return;
        }

        draggedBlock = block;
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
        
        currentPlayer = currentPlayer === 'blue' ? 'red' : 'blue';
        updateTurnIndicator();
        
        checkWinCondition();
    }

    function getGameState() {
        const state = {};
        towers.forEach(tower => {
            state[tower.id] = Array.from(tower.querySelectorAll('.block')).map(block => ({
                color: block.classList.contains('blue-block') ? 'blue' : 'red',
                size: parseInt(block.getAttribute('data-size'))
            }));
        });
        return {
            boardState: state,
            currentPlayer: currentPlayer
        };
    }

    function recordGameState() {
        const state = getGameState();
        moveHistory.push(JSON.stringify(state));
    }

    function isRepeatedState(targetTower) {
        // Create a temporary state to check
        const tempState = getGameState();
        const sourceTowerId = draggedBlock.parentElement.id;
        const blockData = {
            color: draggedBlock.classList.contains('blue-block') ? 'blue' : 'red',
            size: parseInt(draggedBlock.getAttribute('data-size'))
        };

        // Remove block from source tower
        tempState.boardState[sourceTowerId] = tempState.boardState[sourceTowerId]
            .filter(block => !(block.color === blockData.color && block.size === blockData.size));

        // Add block to target tower
        if (!tempState.boardState[targetTower.id]) {
            tempState.boardState[targetTower.id] = [];
        }
        tempState.boardState[targetTower.id].push(blockData);
        tempState.boardState[targetTower.id].sort((a, b) => b.size - a.size);

        // Check if this state exists in history
        const stateString = JSON.stringify(tempState);
        return moveHistory.includes(stateString);
    }

    function isValidMove(targetTower) {
        const blocksOnTargetTower = Array.from(targetTower.querySelectorAll('.block'));
        const topBlockOnTargetTower = blocksOnTargetTower[blocksOnTargetTower.length - 1];
        const draggedBlockSize = parseInt(draggedBlock.getAttribute('data-size'));
        const topBlockSize = topBlockOnTargetTower ? 
            parseInt(topBlockOnTargetTower.getAttribute('data-size')) : Infinity;

        const blockColor = draggedBlock.classList.contains('blue-block') ? 'blue' : 'red';
        const towerId = targetTower.id;

        // Check basic Hanoi rules
        if (draggedBlockSize > topBlockSize) {
            alert('You cannot place a larger block on top of a smaller one!');
            return false;
        }
        if (draggedBlockSize === topBlockSize && topBlockOnTargetTower) {
            alert('You cannot place a block of the same size on top of another block of the same size!');
            return false;
        }

        // Check territory rules
        if (blockColor === 'blue' && !towerId.includes('blue') && !towerId.includes('middle')) {
            alert('Blue blocks can only move to middle towers or blue towers!');
            return false;
        }
        if (blockColor === 'red' && !towerId.includes('red') && !towerId.includes('middle')) {
            alert('Red blocks can only move to middle towers or red towers!');
            return false;
        }

        // Check for repeated state
        if (isRepeatedState(targetTower)) {
            alert('This move would repeat a previous position!');
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
        recordGameState();
        draggedBlock = null;
    }

    function updateBlockPositions(tower) {
        const blocks = Array.from(tower.querySelectorAll('.block'));
        const isStartTower = tower.id.includes('start');
        
        blocks.forEach((block, index) => {
            if (isStartTower) {
                const reversedIndex = blocks.length - 1 - index;
                block.style.top = (50 + (35 * reversedIndex)) + 'px';
                block.style.bottom = 'auto';
            } else {
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
        moveHistory = [];
        document.getElementById('game-board').style.display = 'none';
        document.getElementById('setup').style.display = 'block';
        document.getElementById('turn-indicator').style.display = 'none';
    }

    function updateTurnIndicator() {
        turnIndicator.textContent = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)} Player's Turn`;
        turnIndicator.className = currentPlayer === 'blue' ? 'blue-turn' : 'red-turn';
    }

    function showMessage(text) {
        const messageBox = document.getElementById('message-box');
        messageBox.textContent = text;
        messageBox.classList.add('show');
        messageBox.classList.remove('hidden');
        clearTimeout(messageBox.hideTimeout);
        messageBox.hideTimeout = setTimeout(() => {
            messageBox.classList.remove('show');
        }, 3000); // Message displays for 3 seconds
    }

    // Initial positioning of blocks
    towers.forEach(tower => {
        updateBlockPositions(tower);
    });
}