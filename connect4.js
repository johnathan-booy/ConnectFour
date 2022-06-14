/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

const WIDTH = 7;
const HEIGHT = 6;

let currPlayer = 1; // active player: 1 or 2
const board = []; // array of rows, each row is array of cells  (board[y][x])

/** makeBoard: create in-JS board structure:
 *    board = array of rows, each row is array of cells  (board[y][x])
 */

const makeBoard = () => {
	// set "board" to empty HEIGHT x WIDTH matrix array
	for (let y = 0; y < HEIGHT; y++) {
		board[y] = [];
		for (let x = 0; x < WIDTH; x++) {
			board[y][x] = null;
		}
	}
};

const resetBoard = () => board.fill(null);

/** makeHtmlBoard: make HTML table and row of column tops. */
function makeHtmlBoard() {
	// get "htmlBoard" variable from the item in HTML w/ID of "board"
	const htmlBoard = document.getElementById("board");

	// Create a top row
	// player can click this to select a column for their next move
	let top = document.createElement("tr");
	top.setAttribute("id", "column-top");
	top.addEventListener("click", handleClick);

	for (let x = 0; x < WIDTH; x++) {
		const headCell = document.createElement("td");
		headCell.setAttribute("id", x);

		const headPiece = document.createElement("div");
		headPiece.classList.add("piece");
		headPiece.classList.add(`player-${currPlayer}`);

		headCell.append(headPiece);
		top.append(headCell);
	}
	htmlBoard.append(top);

	// Create the remaining rows
	// Players pieces will be displayed here
	for (let y = 0; y < HEIGHT; y++) {
		const row = document.createElement("tr");
		for (let x = 0; x < WIDTH; x++) {
			const cell = document.createElement("td");
			cell.setAttribute("id", `${x}-${y}`);
			row.append(cell);
		}
		htmlBoard.append(row);
	}
}

function deleteHtmlBoard() {
	const allTrs = document.querySelectorAll("#board tr");
	console.log(allTrs);
	for (const tr of allTrs) tr.remove();
}

/** findSpotForCol: given column x, return top empty y (null if filled) */
function findSpotForCol(x) {
	for (let y = HEIGHT - 1; y >= 0; y--) {
		if (!board[y][x]) {
			return y;
		}
	}
	return null;
}

/** placeInTable: update DOM to place piece into HTML table of board */
function placeInTable(y, x) {
	const newPiece = document.createElement("div");
	const parentTd = document.getElementById(`${x}-${y}`);

	newPiece.classList.add("piece");
	newPiece.classList.add(`player-${currPlayer}`);

	parentTd.append(newPiece);
}

/** endGame: announce game end */
function endGame(msg) {
	// Slight delay so that the last piece gets played visually
	setTimeout(() => {
		if (window.confirm(msg)) {
			startGame();
		}
	}, 10);
}

/** handleClick: handle click of column top to play piece */

function handleClick(evt) {
	// get x from ID of clicked cell
	let x;
	if (evt.target.classList.contains("piece")) {
		x = evt.target.parentElement.id;
	} else {
		x = evt.target.id;
	}

	// get next spot in column (if none, ignore click)
	let y = findSpotForCol(x);
	if (y === null) return;

	// place piece in board and add to HTML table
	board[y][x] = currPlayer;
	placeInTable(y, x);

	// check for win
	if (checkForWin()) {
		return endGame(`Player ${currPlayer} won! Would you like to play again?`);
	}

	// check for tie
	if (board.every((val) => val < 1)) {
		return endGame(`It's a tie! Would you like to play again?`);
	}

	// remove player class from top row divs
	const allHeadPieces = document.querySelectorAll("#column-top .piece");
	console.log(allHeadPieces);
	for (const piece of allHeadPieces) {
		piece.classList.remove(`player-${currPlayer}`);
	}

	// switch players
	currPlayer++;
	if (currPlayer > 2) currPlayer = 1;

	// reassign player class to top row divs
	for (const piece of allHeadPieces) {
		piece.classList.add(`player-${currPlayer}`);
	}
}

/** checkForWin: check board cell-by-cell for "does a win start here?" */
function checkForWin() {
	function _win(cells) {
		// Check four cells to see if they're all color of current player
		//  - cells: list of four (y, x) cells
		//  - returns true if all are legal coordinates & all match currPlayer
		return cells.every(
			([y, x]) =>
				y >= 0 &&
				y < HEIGHT &&
				x >= 0 &&
				x < WIDTH &&
				board[y][x] === currPlayer
		);
	}

	// Start calculating in the top left corner, and repeat for all squares of the board
	for (let y = 0; y < HEIGHT; y++) {
		for (let x = 0; x < WIDTH; x++) {
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
			if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
				return true;
			}
		}
	}
}

function makeStartButton() {
	const container = document.getElementById("container");
	const startButton = document.createElement("button");
	startButton.setAttribute("id", "start-button");
	startButton.innerText = "Start Game";
	startButton.addEventListener("click", startGame);
	container.append(startButton);
}

function startGame(event) {
	const startButton = document.getElementById("start-button");
	deleteHtmlBoard();
	makeBoard();
	makeHtmlBoard();
	startButton.innerText = "Restart";
}

makeStartButton();
