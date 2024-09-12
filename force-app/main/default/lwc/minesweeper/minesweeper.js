//inspired by https://www.geeksforgeeks.org/create-a-minesweeper-game-using-html-css-javascript/

import { LightningElement } from 'lwc';

export default class Minesweeper extends LightningElement {

    board = [];
    numRows = 8;
    numCols = 8;
    numMines = 10;
    gameOver = false;
    gameStarted = false;

    connectedCallback() {
        // this.gameOver = false;
    }

    handleBeginnerGame() {
        this.handleNewGame(9, 9, 10);
    }

    handleIntermediateGame() {
        this.handleNewGame(16, 16, 40);
    }

    handleExpertGame() {
        this.handleNewGame(30, 16, 99);
    }

    handleNewGame(numRows, numCols, numMines) {
        this.gameOver = false;
        this.numRows = numRows;
        this.numCols = numCols;
        this.numMines = numMines;
        this.gameStarted = true;
        this.initializeBoard();
        this.board = [...this.board];
    }

    handleRestartGame() {
        this.gameStarted = false;
        this.board = [];
    }

    initializeBoard() {
        this.gameOver = false;
        for (let i = 0; i < this.numRows; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.numCols; j++) {
                this.board[i][j] = {
                    index: i + '-' + j,
                    isMine: false,
                    isFlagged: false,
                    revealed: false,
                    count: 0,
                    display: "-"
                };
            }
        }

        // Place mines randomly
        let minesPlaced = 0;
        while (minesPlaced < this.numMines) {
            const row = Math.floor(Math.random() * this.numRows);
            const col = Math.floor(Math.random() * this.numCols);
            if (! this.board[row][col].isMine) {
                this.board[row][col].isMine = true;
                minesPlaced++;
            }
        }

        // Calculate counts
        for (let i = 0; i < this.numRows; i++) {
            for (let j = 0; j < this.numCols; j++) {
                if (!this.board[i][j].isMine) {
                    let count = 0;
                    for (let dx = -1; dx <= 1; dx++) {
                        for (let dy = -1; dy <= 1; dy++) {
                            const ni = i + dx;
                            const nj = j + dy;
                            if (ni >= 0 && ni < this.numRows && nj >= 0 && nj < this.numCols && this.board[ni][nj].isMine) {
                                count++;
                            }
                        }
                    }
                    this.board[i][j].count = count;
                }
            }
        }
    }

    handleClick(event) {
        const index = event.target.dataset.id;
        const row = parseInt(index.split('-')[0]);
        const col = parseInt(index.split('-')[1]);
        if (!this.gameOver) {
            this.revealCell(row, col);
            this.checkIfWon();
        }
    }

    revealCell(row, col) {
        if (row < 0 || row >= this.numRows || col < 0 || col >= this.numCols || this.board[row][col].revealed) {
            return;
        }

        this.board[row][col].revealed = true;

        if (this.board[row][col].isMine) {
            this.revealAllMines();
            this.gameOver = true;
        } else {
            this.board[row][col].display = parseInt(this.board[row][col].count);
            this.board = [...this.board];
            if (this.board[row][col].count == 0) {
                // If cell has no mines nearby,
                // Reveal adjacent cells
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        this.revealCell(row + dx, col + dy);
                    }
                }
            }
        }
    }

    revealAllMines() {
        for (let i = 0; i < this.numRows; i++) {
            for (let j = 0; j < this.numCols; j++) {
                if (this.board[i][j].isMine) {
                    this.board[i][j].display = "💣";
                }
            }
        }
        this.board = [...this.board];
    }

    checkIfWon() {
        let allNonMineCellsRevealed = true;

        // Check if all non-mine cells are revealed
        for (let i = 0; i < this.numRows; i++) {
            for (let j = 0; j < this.numCols; j++) {
                const cell = this.board[i][j];
                if (!cell.isMine && !cell.revealed) {
                    allNonMineCellsRevealed = false;
                    break;
                }
            }
        }

        if (allNonMineCellsRevealed) {
            this.revealAllMines();
            this.gameOver = true;
            alert("Congratulations! You have won the game.");
        }
    }

    handleRightClick(event) {
        event.preventDefault();
        const index = event.target.dataset.id;
        const row = parseInt(index.split('-')[0]);
        const col = parseInt(index.split('-')[1]);
        this.putFlag(row, col);
    }

    putFlag(row, col) {
        if (row < 0 || row >= this.numRows || col < 0 || col >= this.numCols || this.board[row][col].revealed) {
            return;
        }
        if (this.board[row][col].isFlagged) {
            this.board[row][col].isFlagged = false;
            this.board[row][col].display = "-";
        }
        else {
            this.board[row][col].isFlagged = true;
            this.board[row][col].display = "🚩";
        }
        this.board = [...this.board];
    }
}