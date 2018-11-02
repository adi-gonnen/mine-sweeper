'use strict'

var CELL = null;
var FLAG = '⛳';
var SHOW = 'SHOW';
var HIDE = 'HIDE';
var SMILE = '<img src="img/smile.jpg">';
var SAD = '<img src="img/sad.jpg">';
var HAPPY = '<img src="img/happy.png">';
var gIcon;
var gSize = 12;
var gMines = 30;
var gLevels = [
	{ id: 1, name: 'begginer', size: 4, mines: 2 },
	{ id: 2, name: 'Medium', size: 8, mines: 15 },
	{ id: 3, name: 'Expert', size: 12, mines: 30 }
]
var gBoard = buildBoard();



function init() {
	gIcon = SMILE;
	renderBoard(gBoard);
}

function buildBoard() {
	var size = gSize;
	var board = new Array(size);
	for (var i = 0; i < board.length; i++) {
		board[i] = new Array(size);
	}

	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			var cell = {
				type: HIDE,
				gameElement: null,		
				mine: false,
				flag: false,
				location: { i: i, j: j }
			};
			board[i][j] = cell;
		}
	}
	return board;
}

function renderBoard(board) {
	var strHTML = '';
	strHTML += '<th class="tableHead" colspan="' + gSize + '">' + gIcon + '</th>';
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];
			var tdId = 'cell-' + i + '-' + j;
			var cellClass = '';
			if (currCell.type === SHOW) cellClass += 'shown';
			strHTML += '\t<td id="' + tdId + '" class="cell ' + cellClass + '" onmousedown="cellMarked(this, event)"'
			strHTML += ' onclick="cellClicked(this)">\n';

			if (currCell.type === SHOW) {
				if (currCell.mine === true) {
					strHTML += '<img src="img/mine.png">';
				} else strHTML += '<img src="img/' + currCell.gameElement + '.png">';
			} else if (currCell.flag === true) strHTML += FLAG;
		}
		strHTML += '</tr>\n';
	}
	// console.log(strHTML);
	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHTML;
}


function firstClick(i, j) {
	for (var m = 0; m < gBoard.length; m++) {
		for (var n = 0; n < gBoard[0].length; n++) {
			if (gBoard[m][n].type === SHOW) return false;
		}
	}
	addCountOfNegs(i, j);
	expandShown(i, j);
	return true;
}

function expandShown(i, j) {
	var negs = findNegs(i, j);
	for (var k = 0; k < negs.length; k++) {
		if (negs[k].mine === false && negs[k].type === HIDE) {
			if (negs[k].gameElement !== 0) {
				negs[k].type = SHOW;
			} else { 
				negs[k].type = SHOW;
				expandShown (negs[k].location.i, negs[k].location.j);
			}
		}
	}
}

function cellClicked(elCell, event) {
	var cellCoord = getCellCoord(elCell.id);
	var i = cellCoord.i;
	var j = cellCoord.j;
	firstClick(i, j);
	if (gBoard[i][j].flag) return;
	else {
		gBoard[i][j].type = SHOW;
		if (gBoard[i][j].mine === true) {
			gIcon = SAD;
			gameOver(true);
		}
		gameOver(isVictory());
	}
	renderBoard(gBoard);
}


function getCellCoord(strCellId) {
	var coord = {};
	coord.i = +strCellId.substring(5, strCellId.lastIndexOf('-'));
	coord.j = +strCellId.substring(strCellId.lastIndexOf('-') + 1);
	return coord;
}


function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
}


function cellMarked(elCell, event) {
	var cellCoord = getCellCoord(elCell.id);
	var i = cellCoord.i;
	var j = cellCoord.j;

	if (event.button === 2) {
		if (gBoard[i][j].flag === false && gBoard[i][j].type === HIDE) {
			gBoard[i][j].flag = true;
			isVictory();
			renderBoard(gBoard);
			return;
		} if (gBoard[i][j].flag = true) {
			gBoard[i][j].flag = false;
			renderBoard(gBoard);
		}
	}
}

function addCountOfNegs(i, j) {
	addMines(i, j);
	for (var m = 0; m < gBoard.length; m++) {
		for (var n = 0; n < gBoard[0].length; n++) {
			var mines = countNegsMine(findNegs(m, n, gBoard));
			if (gBoard[m][n].mine === false) {
				gBoard[m][n].gameElement = mines;
			}
		}
		// console.log('how much mines: ', mines);
	}
}

function addMines(i, j) {
	for (var count = 0; count < gMines;) {
		var mineLocation = getMineCoord(gBoard);
		var negs = findNegs(i, j);
		var isNeg = false;
		for (var k = 0; k < negs.length; k++) {							// avoid mines around clicked cell
			if (negs[k] === mineLocation) {
				var isNeg = true;
				break;
			}
		}
		if (!isNeg && mineLocation.mine === false) {				//avoid 2 mines on same cell
			mineLocation.mine = true;
			count++;
			console.log('mine at: ', mineLocation.location);
		}
	}
}


function getMineCoord() {
	var i = getRandomInt(0, gSize - 1);
	var j = getRandomInt(0, gSize - 1);
	// console.log(i, j);
	return gBoard[i][j];
}


function findNegs(i, j) {			// neighbour => neg
	var negs = [];
	for (var m = -1; m < 2; m++) {
		if (gBoard[i + m] !== undefined) {
			for (var n = -1; n < 2; n++) {
				if (gBoard[i + m][j + n] !== undefined) {
					var neg = gBoard[i + m][j + n];
					negs.push(neg);
				}
			}
		}
	}
	// console.log('negs: ', negs);
	return negs;
}


function countNegsMine(negs) {
	var count = 0;
	for (var i = 0; i < negs.length; i++) {
		if (negs[i].mine) count++;
		// console.log('count mines: ', count, negs[i].mine);
	}
	return count;
}


function gameOver(isTrue) {
	if (isTrue) {
		for (var i = 0; i < gBoard.length; i++) {
			for (var j = 0; j < gBoard[0].length; j++) {
				if (gBoard[i][j].mine === true) gBoard[i][j].type = SHOW;
			}
		}
	}
}


function isVictory() {
	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[0].length; j++) {
			var cell = gBoard[i][j];
			if (cell.type === HIDE && cell.mine === false) return false;
			if (cell.mine === true && cell.flag === false) return false;
		}
	}
	gIcon = HAPPY;
	return true;
}


function startPlay() {
	gBoard = [];
	gBoard = buildBoard();
	gIcon = SMILE;
	init();
}

function getLevel(elLevel) {					
	var id = +elLevel.id;
	for (var i = 0; i < gLevels.length; i++) {
		if (id === gLevels[i].id) {
			gSize = gLevels[i].size;
			gMines = gLevels[i].mines;
			// console.log(gSize);
		}
	}
}


function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

// eliminate window of rightClick mouse:
document.addEventListener('contextmenu', event => event.preventDefault()); 	