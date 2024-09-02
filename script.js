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
    let markedCount = 0;

    for(let i = 0; i < 9; i++) {
        board.push(Cell());
    }

    const getBoard = () => board;

    const printBoard = function() {
        const boardWithCellValue = board.map(cell => cell.getMarker());
        console.log(boardWithCellValue[0],boardWithCellValue[1],boardWithCellValue[2]);
        console.log(boardWithCellValue[3],boardWithCellValue[4],boardWithCellValue[5]);
        console.log(boardWithCellValue[6],boardWithCellValue[7],boardWithCellValue[8]);
    }

    const addMarkedCount = function() {
        ++markedCount;
        console.log("mark count: " + markedCount);
    }

    const getMarkedCount = () => markedCount;

    const isFull = function() {
        return (markedCount === 9) ? true : false;
    }

    //Store winning combos.
    const combos = [];

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

        console.log(combosWithPos);
    }

    return {
        getBoard,
        printBoard,

        addMarkedCount,
        getMarkedCount,
        isFull,

        getCombos,
        printCombos,
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

    const markCell = function(player) {
        marker = player.marker;
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

const gameController = function() {
    const board = Gameboard();

    const _init = function() {
        board.printBoard();
        console.log(`Active Player: ${getActivePlayer().playerName}`);
        console.log(board.printCombos());
    } 
    
    //Player objects, that stores player name and marker
    const player = function(marker) {
        const playerName = "Player " + marker;
        return {playerName, marker};
    }
    const playerX = player("X");
    const playerO = player("O");

    let activePlayer = playerX;

    const getActivePlayer = function() {
        return activePlayer;
    }

    const drawCell = function(player, pos) {
        const targetCell = board.getBoard()[pos];
        targetCell.markCell(player);
    }

    const switchActivePlayer = function() {
        activePlayer = (activePlayer == playerX) ? playerO : playerX;
    }

    const playRound = function(pos) {
        if( isValidInput(pos) ) {
            drawCell(getActivePlayer(), pos);

            board.printBoard();
            addCounts();
            board.addMarkedCount();

            board.printCombos();
            checkWin();

            switchActivePlayer();
            console.log(`It's ${getActivePlayer().playerName}'s turn`);
        }

        if(board.isFull() && !checkWin() ) {
            console.log("It is a TIE!");
        };
    }

    const isValidInput = function(pos) {
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

    const addCounts = function() {
        for(const combo of board.getCombos() ) {
            let XCount = 0;
            let OCount = 0;
            for(const pos of combo.getPos()) {
                let mark = board.getBoard()[pos].getMarker();
                if(mark === "X") XCount++;
                if(mark === "O") OCount++;
            }
            combo.setXCount(XCount);
            combo.setOCount(OCount);
        }
    }

    let completedCombo = null;
    const getCompletedCombo = () => completedCombo;

    const checkWin = function() {
        for(const combo of board.getCombos()) {
            let xCount = combo.getXCount();
            let oCount = combo.getOCount();

            let winner =  (xCount === 3) 
                        ? playerX.playerName
                        : (oCount === 3) 
                        ? playerO.playerName
                        : null;

            if(winner) { //If winner != null
                console.log(winner + " wins!");
                setAllWinningCells(combo);
            }
        }
    }

    function setAllWinningCells(completedCombo) {
        for(const pos of completedCombo.getPos() ) {
            const cell = board.getBoard()[pos];
            cell.setIsWinningCell();
        }
    }

    _init();

    return {
        getActivePlayer,
        playRound,
        getBoard: board.getBoard,

        getCompletedCombo,
    }
};



function screenController() {
    const game = gameController();

    //Cache DOM
    const boardDiv = document.querySelector('.gameboard');
    const board = game.getBoard();

    _render();

    function _render() {
        updateBoard();
    }

    boardDiv.addEventListener('click', clickHandler);

    function clickHandler(e) {
        const targetIndex =  e.target.getAttribute("data-index");
        game.playRound(targetIndex);
        _render();
    }

    function updateBoard() {
        for(let i = 0; i < board.length; i++) {
            const cell = board[i];

            const marker = cell.getMarker();
            if(marker === 0 ) continue; //Jump to next iteration if the cell is empty.

            let selector = `[data-index = "${i}"]`;
            const cellDiv = document.querySelector(selector);
            cellDiv.textContent = marker;

            if(cell.getIsWinningCell()) {
                cellDiv.classList.add('winning-cell');
            }
        }
    }
}


screenController();
