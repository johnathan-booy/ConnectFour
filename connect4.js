/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

class Game {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.currPlayer = 1; // active player: 1 or 2
    this.board = []; // array of rows, each row is array of cells  (board[y][x])

    this.makeStartButton();
  }

  /* makeBoard: create in-JS board structure:
board = array of rows, each row is array of cells  (board[y][x]) */
  makeBoard() {
    // set "board" to empty HEIGHT x WIDTH matrix array
    for (let y = 0; y < this.height; y++) {
      this.board[y] = [];
      for (let x = 0; x < this.width; x++) {
        this.board[y][x] = null;
      }
    }
  }

  /* resetBoard: board has already been created, reset all values to null */
  resetBoard() {
    this.board.fill(null);
  }

  /** makeHtmlBoard: make HTML table and row of column tops. */
  makeHtmlBoard() {
    // get "htmlBoard" variable from the item in HTML w/ID of "board"
    const htmlBoard = document.getElementById("board");
    this.makeHtmlTopRow(htmlBoard);
    this.makeHtmlBoardRows(htmlBoard);
  }

  /* Create a top row that the players can click to select a column for their next move */
  makeHtmlTopRow(htmlBoard) {
    let top = document.createElement("tr");
    top.setAttribute("id", "column-top");
    this.handleGameClick = this.handleClick.bind(this);
    top.addEventListener("click", this.handleGameClick);

    for (let x = 0; x < this.width; x++) {
      const headCell = document.createElement("td");
      headCell.setAttribute("id", x);

      const headPiece = document.createElement("div");
      headPiece.classList.add("piece");
      headPiece.classList.add(`player-${this.currPlayer}`);

      headCell.append(headPiece);
      top.append(headCell);
    }
    htmlBoard.append(top);
  }

  /* makeHtmlBoardRows: Create the playable rows */
  makeHtmlBoardRows(htmlBoard) {
    // Players pieces will be displayed here
    for (let y = 0; y < this.height; y++) {
      const row = document.createElement("tr");
      for (let x = 0; x < this.width; x++) {
        const cell = document.createElement("td");
        cell.setAttribute("id", `${x}-${y}`);
        row.append(cell);
      }
      htmlBoard.append(row);
    }
  }

  /* deleteHtmlBoard : May be redundant with OOP rewrite*/
  deleteHtmlBoard() {
    const allTrs = document.querySelectorAll("#board tr");
    for (const tr of allTrs) tr.remove();
  }

  /** findSpotForCol: given column x, return top empty y (null if filled) */
  findSpotForCol(x) {
    for (let y = this.height - 1; y >= 0; y--) {
      if (!this.board[y][x]) {
        return y;
      }
    }
    return null;
  }

  /** placeInTable: update DOM to place piece into HTML table of board */
  placeInTable(y, x) {
    const newPiece = document.createElement("div");
    const parentTd = document.getElementById(`${x}-${y}`);

    newPiece.classList.add("piece");
    newPiece.classList.add(`player-${this.currPlayer}`);

    parentTd.append(newPiece);
  }

  /** endGame: announce game end */
  endGame(msg) {
    // Slight delay so that the last piece gets played visually
    setTimeout(() => {
      if (window.confirm(msg)) {
        this.startGame();
      }
    }, 50);
  }

  /* Check four cells to see if they're all color of current player
- cells: list of four (y, x) cells
- returns true if all are legal coordinates & all match currPlayer */
  calculateWin(cells) {
    return cells.every(([y, x]) => y >= 0 && y < this.height && x >= 0 && x < this.width && this.board[y][x] === this.currPlayer);
  }

  /** checkForWin: check board cell-by-cell for "does a win start here?" */
  checkForWin() {
    // Start calculating in the top left corner, and repeat for all squares of the board
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        // Gather the four horizontal coordinates
        const horiz = [
          [y, x],
          [y, x + 1],
          [y, x + 2],
          [y, x + 3],
        ];
        // Gather the four vertical coordinates
        const vert = [
          [y, x],
          [y + 1, x],
          [y + 2, x],
          [y + 3, x],
        ];
        // Gather the four diagonal coordinates, slanting right
        const diagDR = [
          [y, x],
          [y + 1, x + 1],
          [y + 2, x + 2],
          [y + 3, x + 3],
        ];
        // Gather the four diagonal coordinates, slanting left
        const diagDL = [
          [y, x],
          [y + 1, x - 1],
          [y + 2, x - 2],
          [y + 3, x - 3],
        ];

        // Calculate wins for all coordinate collections
        if (this.calculateWin(horiz) || this.calculateWin(vert) || this.calculateWin(diagDR) || this.calculateWin(diagDL)) {
          return true;
        }
      }
    }
  }

  checkForTie() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.board[y][x] === null) return false;
      }
    }
    return true;
  }

  switchCurrPlayer() {
    // remove player class from top row divs
    const allHeadPieces = document.querySelectorAll("#column-top .piece");
    for (const piece of allHeadPieces) {
      piece.classList.remove(`player-${this.currPlayer}`);
    }

    // switch players
    this.currPlayer++;
    if (this.currPlayer > 2) this.currPlayer = 1;

    // reassign player class to top row divs
    for (const piece of allHeadPieces) {
      piece.classList.add(`player-${this.currPlayer}`);
    }
  }

  handleClick(evt) {
    /** handleClick: handle click of column top to play piece */
    // get x from ID of clicked cell
    // CHECK => Does this work without reference to x in the if and else statements?
    let x = evt.target.classList.contains("piece") ? evt.target.parentElement.id : evt.target.id;

    // get next spot in column (if none, ignore click)
    // CHECK => Is this working? When would it return y?
    let y = this.findSpotForCol(x);
    if (y === null) return;

    // place piece in board and add to HTML table
    this.board[y][x] = this.currPlayer;
    this.placeInTable(y, x);

    if (this.checkForWin()) return this.endGame(`Player ${this.currPlayer} won! Would you like to play again?`);

    // CHECK => Does this work?
    if (this.checkForTie()) return this.endGame(`It's a tie! Would you like to play again?`);

    this.switchCurrPlayer();
  }

  makeStartButton() {
    const container = document.getElementById("container");
    const startButton = document.createElement("button");
    startButton.setAttribute("id", "start-button");
    startButton.innerText = "Start Game";

    // Store a reference to the startGame bound function
    this.startGameClick = this.startGame.bind(this);
    startButton.addEventListener("click", this.startGameClick);

    container.append(startButton);
  }

  startGame(event) {
    const startButton = document.getElementById("start-button");
    this.deleteHtmlBoard();
    this.makeBoard();
    this.makeHtmlBoard();
    startButton.innerText = "Restart";
  }
}

new Game(7, 6); // assuming constructor takes height, width
