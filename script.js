/*
Gameboard represents the state of the gameboard.
Responsibilities: 
    - Returns the whole board.
    - Print board that shows cell values to the console.
    - Draw marker on cells, takes player and pos as parameters.
*/
const Gameboard = function () {
    const rowsNum = 3;
    const board = [];   
    const combos = [];   
    let markCount = 0;

    init();

    function init() {
        markCount = 0;
        _makeBoardCells();
        _generateCombos();
    }

    function _makeBoardCells() {
        board.length = 0;
        for(let i = 0; i < 9; i++) {
            board.push(Cell());
        }
    }

    const getBoard = () => board;

    //Store winning combos.
 
    function _generateCombos() {
        combos.length = 0;
        //Row Combos
        let rowOffset = 0;
        for(let i = 0; i < 3; i++) {
            const arr = [];
            for(let j = 0; j < 3; j++) {
                let pos = j + rowOffset;
                arr.push(pos);
            }
            combos.push(Combo(arr));
            rowOffset += 3;
        }

        //Column Combos
        let colOffset = 0;
        for(let i = 3; i < 6; i++) {
            const arr = [];
            for(let j = 0; j <= 6; j += 3) {
                let pos = j + colOffset;
                arr.push(pos);
            }
            combos.push(Combo(arr));
            colOffset += 1;
        }

        combos.push( Combo( [0,4,8] ), Combo( [2,4,6] ) );
    }

    const getMarkCount = () => markCount;
    const addMarkCount = () => markCount++;

    const getCombos = () => combos;

    const printCombos = function() {
        const combosWithPos = [];
        for(const combo of combos) {
            const pos = combo.getPos().slice(0);
            let XCount = combo.getXCount();
            let OCount = combo.getOCount();
            pos.push(XCount, OCount);
            combosWithPos.push(pos);
        }
    }

    function printBoard() {
        const boardWithCellValue = board.map(cell => cell.getMarker());
        console.log(boardWithCellValue[0],boardWithCellValue[1],boardWithCellValue[2]);
        console.log(boardWithCellValue[3],boardWithCellValue[4],boardWithCellValue[5]);
        console.log(boardWithCellValue[6],boardWithCellValue[7],boardWithCellValue[8]);
    }

    return {
        getBoard,
        printBoard,

        getCombos,
        printCombos,

        getMarkCount,
        addMarkCount,

        init,
    };
}

//A function factory for Cell object that contains two methods.
/*
Responsibilities:
    - Returns target cell marker value.
    - Draw marker on target cell.
*/
function Cell() {
    let marker = 0;

    const getMarker = () => marker;

    const markCell = function(playerMarker) {
        marker = playerMarker;
    }

    let isWinningCell = false;
    const getIsWinningCell = () => isWinningCell;
    const setIsWinningCell = () => isWinningCell = true;

    let message = "I'm the cell!"
    const getMessage = () => message;

    return {
        getMarker,
        markCell,
        getMessage,

        getIsWinningCell,
        setIsWinningCell,
    }
}

const Combo = function(arr) {
    const getPos = () => arr;

    let XCount = 0;
    let OCount = 0;

    const getXCount = () => XCount;
    const getOCount = () => OCount;

    const setXCount = count => XCount = count;
    const setOCount = count => OCount = count;
    
    return {
        getPos,
        getXCount, getOCount,
        setXCount, setOCount,
    };
}

const gameController = function(gameMode = 0, playerSide = "X", diffculty = "normal",
                                playerX_name = "Player X", playerO_name = "Player O" ) {
    const board = Gameboard();
    const combos = board.getCombos();

    //Player objects, that stores player name and marker
    const player = function(playerName, marker) {
        const type = "player";
        return {playerName, marker, type};
    }
    
    let playerX, playerO;
    let winner = "";
    let activePlayer = playerX; 

    function reset() {
        board.init();
        setPlayers();

        winner = "";
        activePlayer = playerX;

        while(activePlayer.type === "bot" && !isRoundEnd()) {
            botPlays();
        
            checkWinner();
            if(isRoundEnd()) return;
            switchActivePlayer();
        }
    }

    reset();

    function setPlayers() {
        console.log("Mode " + gameMode);
        if(gameMode === 0) {
            if(playerSide === "X") {
                playerX = player(playerX_name, "X");
                playerO = bot("O", board, diffculty);
            }else {
                playerX = bot("X", board, diffculty);
                playerO = player(playerO_name, "O");
            }
        }
        
        if(gameMode === 1) {
            playerX = player(playerX_name, "X");
            playerO = player(playerO_name, "O");
        }
    }

    const getActivePlayer = () => activePlayer;

    function drawCell(player, pos) {
        const targetCell = board.getBoard()[pos];
        targetCell.markCell(player);
    }

    function switchActivePlayer() {
        activePlayer = (activePlayer == playerX) ? playerO : playerX;
    }

    function playRound(pos) {
        if( !isValidInput(pos) || isRoundEnd() ) {
            return;
        }

        drawCell(activePlayer.marker, pos);
        board.printBoard();
        addCounts();
        board.addMarkCount();
        checkWinner();

        if(isRoundEnd()) return;

        switchActivePlayer();

        if(activePlayer.type === "bot") {
            botPlays();
        
            checkWinner();
            if(isRoundEnd()) return;
            switchActivePlayer();
        }
    }

    function botPlays() {
        let targetCellPos = activePlayer.takeCellPos();             
        drawCell(activePlayer.marker, targetCellPos);

        board.printBoard();
        addCounts();
        board.addMarkCount();
    }

    function isValidInput(pos) {
        if(!pos) return false;

        if(pos > 8 || pos < 0) {
            console.log("Selected cell is beyond scope."); //Prohibit non-existing cell selection.
            return false;
        }

        const targetCell = board.getBoard()[pos];

        if(targetCell.getMarker() !== 0) { //Prevent drawing on cells that are already marked.
            console.log("This cell is already marked.");
            return false;
        }
        return true;
    }

    function addCounts() {
        for(const combo of combos ) {
            let xCount = 0;
            let oCount = 0;
            for(const pos of combo.getPos()) {
                let mark = board.getBoard()[pos].getMarker();
                if(mark === "X") ++xCount;
                if(mark === "O") ++oCount;
            }
            combo.setXCount(xCount);
            combo.setOCount(oCount);
        }
    }

    const getWinner = () => winner;

    function checkWinner() {
        //console.log("mark Count: " + board.getMarkCount());
        for(const combo of combos) {
            let xCount = combo.getXCount();
            let oCount = combo.getOCount();
            
            if(xCount == 3) {
                winner = "X";
                setAllWinningCells(combo);
                return;
            }else if(oCount == 3) {
                winner = "O";
                setAllWinningCells(combo);
                return;
            }           
        }   
        if(board.getMarkCount() === 9) {
            winner = "tie";                
            return;
        }
    }

    function isRoundEnd() {
        if( winner == "" ) {
            return false;   
        }else{
            return true;
        }
    }

    function setAllWinningCells(completedCombo) {
        for(const pos of completedCombo.getPos() ) {
            const cell = board.getBoard()[pos];
            cell.setIsWinningCell();
        }
    }

    return {
        getActivePlayer,
        playRound,
        getBoard: board.getBoard,
        getMarkCount: board.getMarkCount,

        getWinner,
        isValidInput,
        isRoundEnd,

        reset,
    };
};

function screenController(game) {
    let board = game.getBoard();

    //Cache DOM
    const boardDiv = document.querySelector('.gameboard');
    const xTurn = document.querySelector('#xTurn');
    const oTurn = document.querySelector("#oTurn");
    const resultDiv = document.querySelector('.result');
    const winnerDiv = document.querySelector('.result > .winner');

    render();

    boardDiv.addEventListener('click', clickHandler);
    showResetBtn();

    function render() {
        updateBoard();
        updateActivePlayer();
    }

    function resetRound() {
        game.reset();
        board = game.getBoard();

        render();
        winnerDiv.textContent = "";
    }

    function clickHandler(e) {
        const targetIndex =  e.target.getAttribute("data-index");
        
        if( !game.isValidInput(targetIndex) || game.isRoundEnd() ) return; //Do noting if input invalid OR board is full 

        game.playRound(targetIndex);
        render();

        if(game.isRoundEnd()) {
            showWinner();
        }
    }

    function updateBoard() {
        boardDiv.textContent = "";
        board.forEach( (cell, index) => {
            const cellBtn = document.createElement('button');
            cellBtn.classList.add('cell');
            cellBtn.setAttribute('data-index', index);

            const marker =  cell.getMarker();

            if( marker === "X" ) {
                cellBtn.classList.add('xMark');
            }else if( marker === "O" ) {
                cellBtn.classList.add('oMark');
            }

            
            /*cellBtn.textContent =  ( !marker )
                                  ? ""
                                  : marker;
            */
            boardDiv.appendChild(cellBtn);

            if(cell.getIsWinningCell()) {
                cellBtn.classList.add('winning-cell');
            }
        } );
    }

    function updateActivePlayer() {
        const activePlayerMarker = game.getActivePlayer().marker;
        if(activePlayerMarker === "X") {
            oTurn.classList.remove("active")        
            xTurn.classList.add("active");
        } else {
            xTurn.classList.remove("active")
            oTurn.classList.add("active");
        }
    }

    function showWinner() {
        const winner = game.getWinner();
        if(winner === "X" || winner === "O") {
            winnerDiv.textContent = `${winner} WINS!`;    
        }else if(winner === "tie") {
            winnerDiv.textContent = `TIE!`;
        }
    }

    function showResetBtn() {
        const resetBtn = document.createElement('button');
        resetBtn.textContent = "Restart";
        resultDiv.appendChild(resetBtn);
        resetBtn.addEventListener('click', resetRound);
    }
}


function bot(marker, Gameboard, diffculty) {
    const playerName = "Bot " + marker + " " +diffculty.toUpperCase();
    const type = "bot";
    const enemyMarker = marker === "O"
                       ? "X" : "O"; 

    const game = Gameboard;
    const board = game.getBoard();
    const combos = game.getCombos();
    
    let getSelfCount = marker === "X"
                   ? "getXCount"
                   : "getOCount";

    let getEnemyCount = enemyMarker === "X"
                    ? "getXCount"
                    : "getOCount";

    function findTargetCombo() {
        const availableCombos = combos.filter( //Look for rows that has no enemy's mark.
            (combo) => combo[getEnemyCount]() === 0 
        );
        
        return availableCombos[0];
    }    

    function takeCellPos() {
        let finalCellInRow = finishCombo();
        if( typeof finalCellInRow === 'number' ) return finalCellInRow;

        let posToBlock = block();
        if( typeof posToBlock === 'number' ) return posToBlock;


        if(game.getMarkCount() === 0) {
            //Best opening move is to play corners.
            const corners = [0, 2, 6, 8];
            return corners[ getRandomItem(corners.length) ];
        }

        if(game.getMarkCount() === 2 && board[4].getMarker() === enemyMarker) {
            //If bot has a corner and opponent has the center, 
            //bot should take the corner opposite to original corner to form a diagonal.
            let cornerTaken;
            const corners = [0, 2, 6 ,8];
            for(let corner of corners) {
                if(board[corner].getMarker() === marker) cornerTaken = corner;
            }
            if(typeof cornerTaken === "number") {
                return makeDiagonal(cornerTaken);
            }
        }
        
         //If bot's playing the 2ND move, responding to opponent's openning move.
        if(game.getMarkCount() === 1) {
            //Block Center Fork: If opponent plays center, take any corner.
            if(board[4].getMarker() === enemyMarker) return takeAnyCorner();
            
            //Block Corner Fork: If opponent plays corner, take center.
            if( cornerTakenByOpp() ) return takeCenter();

            //Block Edge Fork: If opponent plays edge, take the opposite edge.
            let edgeTaken = edgeTakenByOpp();
            if( typeof edgeTaken === "number") return takeOppositeEdge(edgeTaken);
        }

        if(game.getMarkCount() === 3) {
            //If opponent took diagonal corners, while bot has the center, bot should take an edge.
            if( diagonalTakenByOpp() ) {
                console.log("diagonals are taken by opponent, take any edge now");
                const edges = [1, 3, 5, 7];
                return edges[ getRandomItem(edges.length) ];
            }
        }
    

        const targetCombo = findTargetCombo();
        if( !targetCombo ) { //If can't find any availble combos.
            console.log("No combos, get random one");
            return findRandomEmptyCell(); //Get a random empty cell pos.
        }
         
        const availablePos = targetCombo.getPos()
            .filter( pos => board[pos].getMarker() === 0
        );
        return availablePos[getRandomItem(availablePos.length)];    
    }

    function findRandomEmptyCell() {
        let availableCellPos = [];
        board.forEach( (cell, index) => {
            if(cell.getMarker()) return;
            availableCellPos.push(index);
        });
        return availableCellPos[getRandomItem(availableCellPos.length)];
    }

    //Complete a combo by taking the final remaining cell in a row where the bot has already taken 2 cells.
    function finishCombo() {
        let finalCombo;
        for(let combo of combos) {
            if( combo[getSelfCount]() === 2 && combo[getEnemyCount]() === 0 ) {
                finalCombo = combo;
                break;
            }
        }
        
        if( !finalCombo ) return; //Stop if no final combo is found.
        
        for( let pos of finalCombo.getPos() ) {
            if( board[pos].getMarker() === 0 ) {
                return pos;
            }
        }
    }

    function block() {
        let comboToBlock;
        for(let combo of combos) {
            if( combo[getEnemyCount]() === 2 && combo[getSelfCount]() === 0 ) {
                comboToBlock = combo;
                break;
            }
        }

        if(!comboToBlock) return;

        console.log("Enemy has two in this row: " + comboToBlock.getPos());
        for(let pos of comboToBlock.getPos() ) {
            if( board[pos].getMarker() === 0) {
                console.log("Should block this: " + pos);
                return pos;
            }
        }
    }

    function takeAnyCorner() {
        const corners = [0, 2, 6, 8];
        let randomPos = getRandomItem(corners.length);
        console.log("Center taken by opponent, now take corner: " + corners[randomPos]);
        return corners[ randomPos ];
    }

    function takeCenter() {
        return 4;
    }

    function cornerTakenByOpp() {
        const corners = [0, 2, 6, 8];
        for(let corner of corners) {
            if(board[corner].getMarker() === enemyMarker) {
                return true;
            }
        }
        return false;
    }

    function takeOppositeEdge(edgeTaken) {
        // Edge Pairs = [1, 7] & [3, 5];
        let oppositeEdge;
        switch(edgeTaken) {
            case 1:
                oppositeEdge = 7;
                break;
            case 7:
                oppositeEdge = 1;
                break;
            case 3:
                oppositeEdge = 5;
                break;
            case 5:
                oppositeEdge = 3;
        }
        return oppositeEdge;
    }

    function edgeTakenByOpp() {
        const edges = [1, 3, 5, 7];       
        for(const edge of edges) {
            if(board[edge].getMarker() === enemyMarker) {
                return edge;
            }
        }
    }

    function makeDiagonal(cornerTaken) {
        let oppositeCorner;
        switch(cornerTaken) {
            case 0:
                oppositeCorner = 8;
                break;
            case 2:
                oppositeCorner = 6;
                break;
            case 6:
                oppositeCorner = 2;
                break;
            case 8:
                oppositeCorner = 0;
        }
        return oppositeCorner;
    }

    function diagonalTakenByOpp() {
        //Return true if diagonalCorners taken by opponent, and the center is taken by bot itself.
        
        if(board[4].getMarker() !== marker) return false; //False if center is not taken by bot.

        if( board[0].getMarker() === enemyMarker && board[8].getMarker() === enemyMarker ) return true;
        if( board[2].getMarker() === enemyMarker && board[6].getMarker() === enemyMarker ) return true;

        return false;
    }


    function getRandomItem(length) {
        return Math.floor( Math.random() * length ) ;
    }

    return {
        playerName,
        marker,
        type,
        takeCellPos,
    }
}


(function gameSettings() {   
    //DOM cache
    const modeWindow = document.querySelector('#mode-window');
    const modeOptions = document.querySelectorAll('#mode-window button');
    
    const robotWindow = document.querySelector('#robot-window');
    const startBtn_robot = document.querySelector('#robot-window button.start');

    const friendWindow = document.querySelector('#friend-window');
    const playerXName_input = document.querySelector('input[name="playerX-name"]');
    const playerOName_input = document.querySelector('input[name="playerO-name"]');
    const startBtn_friend = document.querySelector('#friend-window button.start');
    
    const gameDiv = document.querySelector('.game');


    let mode, playerSide, difficulty;
    let playerX_name, playerO_name;


    //Bind events
    modeOptions.forEach( option => 
        option.addEventListener('click', chooseMode)
    );
    startBtn_robot.addEventListener('click', startGame_bot);
    startBtn_friend.addEventListener('click', startGame_friend);

    //Event handlers
    function chooseMode() {
        modeWindow.style.display = "none";

        let option = this.id;
        switch(option) {
            case "against-bot": 
                mode = 0;
                robotWindow.style.display = "flex";
                break;
            case "against-friend":
                mode = 1;
                friendWindow.style.display = "flex";
        }           
        console.log("mode: " + option);
    }

    function startGame_bot() {
        mode = 0;
        
        const side_checked = document.querySelector('input[name="side"]:checked');
        const difficulty_checked = document.querySelector('input[name="diffculty"]:checked');
        
        playerSide = side_checked.value;
        difficulty = difficulty_checked.value;

        if(playerSide === "X") {
            playerX_name = "Player X"
            playerO_name = "Bot O " + difficulty.toUpperCase();
        }else {
            playerX_name = "Bot X " + difficulty.toUpperCase();
            playerO_name = "Player O";
        }

        console.log("side: " + playerSide);
        console.log("diff: " + difficulty);
        console.log(playerX_name + " vs " + playerO_name);

        robotWindow.style.display = "none";
        gameDiv.style.display = "flex";

        startGame();
    }

    function startGame_friend() {
        mode = 1;
        friendWindow.style.display = "none";
        gameDiv.style.display = "flex";
        playerX_name = playerXName_input.value;
        playerO_name = playerOName_input.value;
        if(!playerX_name) playerX_name = "Player X"
        if(!playerO_name) playerO_name = "Player O"

        console.log(playerX_name + " vs " + playerO_name);
        startGame()
    }

    function startGame() {
        const game = gameController( mode, playerSide, difficulty,
            playerX_name, playerO_name);
        screenController(game);
    }
})();