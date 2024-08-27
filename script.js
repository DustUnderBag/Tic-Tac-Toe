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
        combos.push([]);
        for(let j = 0; j < 3; j++) {
            let pos = j + rowOffset;
            combos[i].push(pos);

        }
        rowOffset += 3;
    }

    //Column Combos
    let colOffset = 0;
    for(let i = 3; i < 6; i++) {
        combos.push([]);
        for(let j = 0; j <= 6; j += 3) {
            let pos = j + colOffset;
            combos[i].push(pos)
        }
        colOffset += 1;
    }

    combos.push([0,4,8], [2,4,6]);

    const getCombos = () => combos;



    return {
        getBoard,
        printBoard,

        addMarkedCount,
        getMarkedCount,
        isFull,

        getCombos,
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

    return {
        getMarker,
        markCell,
    }
}

const gameController = (function() {
    const board = Gameboard();

    const _init = function() {
        board.printBoard();
        console.log(`Active Player: ${getActivePlayer().playerName}`);
        console.log(board.getCombos());
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
            board.addMarkedCount();
            switchActivePlayer();
        }

        console.log(`It's ${getActivePlayer().playerName}'s turn`);

        board.printBoard();

        if(board.isFull()) {
            console.log("board is full");
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

    _init();

    return {
        getActivePlayer,
        playRound,
    }
})();
