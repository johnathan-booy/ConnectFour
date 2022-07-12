/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */
class Player {
	constructor(name, color) {
		this.name = name;
		this.color = color;
	}
}

class Game {
	constructor(width, height) {
		this.width = width;
		this.height = height;
		this.board = []; // array of rows, each row is array of cells  (board[y][x])
		this.gameOver = false;
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
		for (const row of this.board) {
			row.fill(null);
		}
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
		top.setAttribute("id", "top-row");
		this.handleGameClick = this.handleClick.bind(this);
		top.addEventListener("click", this.handleGameClick);

		for (let x = 0; x < this.width; x++) {
			const headCell = document.createElement("td");
			headCell.setAttribute("id", x);

			const headPiece = document.createElement("div");
			headPiece.classList.add("piece");
			headPiece.style.backgroundColor = this.currPlayer.color;

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
			row.setAttribute("id", "board-row");
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
		newPiece.style.backgroundColor = this.currPlayer.color;

		parentTd.append(newPiece);
	}

	/** endGame: announce game end */
	endGame(msg) {
		// Slight delay so that the last piece gets played visually
		setTimeout(() => {
			if (window.confirm(msg)) {
				this.restartGame();
			}
		}, 50);
	}

	/* Check four cells to see if they're all color of current player
- cells: list of four (y, x) cells
- returns true if all are legal coordinates & all match currPlayer */
	calculateWin(cells) {
		return cells.every(
			([y, x]) =>
				y >= 0 &&
				y < this.height &&
				x >= 0 &&
				x < this.width &&
				this.board[y][x] === this.currPlayer
		);
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
				if (
					this.calculateWin(horiz) ||
					this.calculateWin(vert) ||
					this.calculateWin(diagDR) ||
					this.calculateWin(diagDL)
				) {
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
		// switch players
		this.currPlayer = this.currPlayer === this.p1 ? this.p2 : this.p1;

		// change color of top row pieces
		const allHeadPieces = document.querySelectorAll("#top-row .piece");
		for (const piece of allHeadPieces) {
			piece.style.backgroundColor = this.currPlayer.color;
		}
	}

	/** handleClick: handle click of column top to play piece */
	handleClick(evt) {
		// Don't let player add pieces after gameOver
		if (this.gameOver) return;

		// get x from ID of clicked cell
		let x = evt.target.classList.contains("piece")
			? evt.target.parentElement.id
			: evt.target.id;

		// get next spot in column (if none, ignore click)
		// CHECK => Is this working? When would it return y?
		let y = this.findSpotForCol(x);
		if (y === null) return;

		// place piece in board and add to HTML table
		this.board[y][x] = this.currPlayer;
		this.placeInTable(y, x);

		if (this.checkForWin()) {
			this.gameOver = true;
			return this.endGame(
				`${this.currPlayer.name} won! Would you like to play again?`
			);
		}

		// CHECK => Does this work?
		if (this.checkForTie())
			return this.endGame(`It's a tie! Would you like to play again?`);

		this.switchCurrPlayer();
	}

	startGame(event) {
		event.preventDefault();
		// Find HTML elements
		const p1ColorInput = document.getElementById("p1-color");
		const p2ColorInput = document.getElementById("p2-color");

		// create players
		this.p1 = new Player("Player 1", p1ColorInput.value);
		this.p2 = new Player("Player 2", p2ColorInput.value);
		this.currPlayer = this.p1;

		this.makeRestartButton();
		this.makeBoard();
		this.makeHtmlBoard();
		this.deleteForm();
	}

	makeRestartButton() {
		const container = document.getElementById("container");
		const restartButton = document.createElement("button");
		restartButton.setAttribute("id", "restart-button");
		restartButton.innerText = "Restart";
		restartButton.addEventListener("click", this.restartGame.bind(this));
		container.append(restartButton);
	}

	deleteForm() {
		const form = document.querySelector("form");
		form.remove();
	}

	restartGame() {
		// Remove Pieces
		const allPieces = document.querySelectorAll("#board-row .piece");
		for (const piece of allPieces) {
			piece.remove();
		}

		this.gameOver = false;
		this.resetBoard();
	}
}
// Make start display

// Players can choose:
//  - their colors
//  - the board size

function makeStartMenu() {
	// Create game
	const game = new Game(7, 6); // assuming constructor takes height, width

	// Find HTML container
	const container = document.getElementById("container");

	// Create elements
	const startGameForm = document.createElement("form");
	const p1ColorLabel = document.createElement("label");
	const p1ColorInput = document.createElement("input");
	const p2ColorLabel = document.createElement("label");
	const p2ColorInput = document.createElement("input");
	const startButton = document.createElement("input");

	// Set IDs
	p1ColorInput.setAttribute("id", "p1-color");
	p2ColorInput.setAttribute("id", "p2-color");
	startButton.setAttribute("id", "start-button");

	// Set Attributes
	p1ColorLabel.setAttribute("for", "p1-color");
	p1ColorInput.setAttribute("type", "color");
	p1ColorInput.setAttribute("name", "p1-color");

	p2ColorLabel.setAttribute("for", "p2-color");
	p2ColorInput.setAttribute("type", "color");
	p2ColorInput.setAttribute("name", "p2-color");

	startButton.setAttribute("type", "submit");
	startButton.setAttribute("value", "Start Game");

	// Set default colors
	p1ColorInput.setAttribute("value", "#96C0CE");
	p2ColorInput.setAttribute("value", "#C25B56");

	// Set innerText
	p1ColorLabel.innerText = "Player 1 Color";
	p2ColorLabel.innerText = "Player 2 Color";

	// Set Event Listeners
	startButton.addEventListener("click", game.startGame.bind(game));

	// Append to DOM
	startGameForm.append(p1ColorLabel);
	startGameForm.append(p1ColorInput);
	startGameForm.append(p2ColorLabel);
	startGameForm.append(p2ColorInput);
	startGameForm.append(startButton);
	container.append(startGameForm);
}

makeStartMenu();
