/*
Gameboard represents the state of the gameboard.
Responsibilities: 
    - Returns the whole board.
    - Print board that shows cell values to the console.
    - Draw marker on cells, takes player and pos as parameters.
*/
const Gameboard = function () {
    const rows = 3;
    const board = [];   

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
    
    const drawCell = function(player, pos) {
        if(pos > 8 || pos < 0) return; //Prohibit non-existing cell selection.
        
        const targetCell = board[pos];

        if(targetCell.getMarker() !== 0) { //Prevent drawing on cells that are already marked.
            return;
        }

        targetCell.markCell(player);
    }

    return {
        getBoard,
        printBoard,
        drawCell,
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

    const switchActivePlayer = function() {
        activePlayer = (activePlayer == playerX) ? playerO : playerX;
        console.log(`It's ${getActivePlayer().playerName}'s turn`);
    }

    const playRound = function(pos) {
        board.drawCell(getActivePlayer(), pos);
        
        board.printBoard();

        switchActivePlayer();
    }

    _init();

    return {
        getActivePlayer,
        playRound,
    }
})();

const game = gameController;