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
var gFlagsCount = 30;
var gLevels = [
	{ id: 1, name: 'begginer', size: 5, mines: 3 },
	{ id: 2, name: 'Medium', size: 8, mines: 15 },
	{ id: 3, name: 'Expert', size: 12, mines: 30 }
]
var gBoard = buildBoard();
var gFirstClick = true;
var gTime;
var s = 0;
var m = 0;



function init() {
	gIcon = SMILE;
	clearInterval(gTime);
	renderClock();
	renderMinesCount();
	document.querySelector('.clock').innerHTML = m + ': 0' + s; 
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

function renderClock() {
	var strHTML = '';
	strHTML += '<div class="clock"></div>';
	var elBoard = document.querySelector('.clock-container');
	elBoard.innerHTML = strHTML;
}

function renderMinesCount() {
	var strHTML = '';
	strHTML = '<div class="mines-count">' + gFlagsCount +'</div>';
	var elBoard = document.querySelector('.mines-container');
	elBoard.innerHTML = strHTML;
}

function renderBoard(board) {
	var strHTML = '';
	strHTML += '<th class="table-head" colspan="' + gSize + '">'
	strHTML += '<div class="mines-count">' + gIcon + '</div></th>'
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


function setFirstClick(i, j) {
	addCountOfNegs(i, j);
	gTime = setInterval(startTime,1000);
	gFirstClick = false;
}

function expandShown(i, j) {
	var negs = findNegs(i, j);
	for (var k = 0; k < negs.length; k++) {
		if (negs[k].mine === false && negs[k].type === HIDE) {
			if (negs[k].gameElement !== 0) {
				negs[k].type = SHOW;
			} else { 
				negs[k].type = SHOW;
				expandShown(negs[k].location.i, negs[k].location.j);
			}
		}
	}
}

function cellClicked(elCell, event) {
	var cellCoord = getCellCoord(elCell.id);
	var i = cellCoord.i;
	var j = cellCoord.j;
	if (gFirstClick) setFirstClick(i, j);
	if (gBoard[i][j].gameElement === 0) expandShown(i,j);
	if (gBoard[i][j].flag) return;
	else {
		gBoard[i][j].type = SHOW;
		if (gBoard[i][j].mine === true) {
			gIcon = SAD;
			gameOver(true);
		}
		gameOver(isVictory());		//check if game is over
	}
	renderBoard(gBoard);
}


function getCellCoord(strCellId) {
	var coord = {};
	coord.i = +strCellId.substring(5, strCellId.lastIndexOf('-'));
	coord.j = +strCellId.substring(strCellId.lastIndexOf('-') + 1);
	return coord;
}


function cellMarked(elCell, event) {
	var cellCoord = getCellCoord(elCell.id);
	var i = cellCoord.i;
	var j = cellCoord.j;

	if (event.button === 2) {
		if (gBoard[i][j].flag === false && gBoard[i][j].type === HIDE) {
			gBoard[i][j].flag = true;
			gFlagsCount--;
			renderMinesCount();
			isVictory();
			renderBoard(gBoard);
			return;
		} if (gBoard[i][j].flag = true) {
			gBoard[i][j].flag = false;
			gFlagsCount++;
			renderMinesCount();
			renderBoard(gBoard);
		}
	}
}

function addCountOfNegs(i, j) {		//shown as number of mines around cell
	addMines(i, j);
	for (var m = 0; m < gBoard.length; m++) {
		for (var n = 0; n < gBoard[0].length; n++) {
			var mines = countNegsMine(findNegs(m, n, gBoard));
			if (gBoard[m][n].mine === false) {
				gBoard[m][n].gameElement = mines;
			}
		}
	}
}

function addMines(i, j) {
	for (var count = 0; count < gMines;) {
		var mineLocation = getMineCoord(gBoard);
		var negs = findNegs(i, j);
		var isNeg = false;
		for (var k = 0; k < negs.length; k++) {							// avoid mines around first clicked cell
			if (negs[k] === mineLocation) {
				var isNeg = true;
				break;
			}
		}
		if (!isNeg && mineLocation.mine === false) {				//avoid 2 mines on same cell
			mineLocation.mine = true;
			count++;
			// console.log('mine at: ', mineLocation.location);
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
		clearInterval(gTime);
		m = 0;
		s = 0;
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
	clearInterval(gTime);
	return true;
}


function startPlay() {
	clearInterval(gTime);
	gBoard = [];
	gBoard = buildBoard();
	gIcon = SMILE;
	gFlagsCount = gMines;
	gFirstClick = true;
	m = 0;
	s = 0;
	document.querySelector('.clock').innerHTML = m + ':' + s; 
	init();
}

function getLevel(elLevel) {					
	var id = +elLevel.id;
	for (var i = 0; i < gLevels.length; i++) {
		if (id === gLevels[i].id) {
			gSize = gLevels[i].size;
			gMines = gLevels[i].mines;
			gFlagsCount = gMines;
			// console.log(gSize);
		}
	}
	startPlay();
}

function startTime() {
	s++;
	if (s === 60) {
		s = 0;
		m++;
	}
	if (s < 10) {			  // add zero in front of numbers < 10
		s = "0" + s
	};
	// console.log(m,':' ,s);
	document.querySelector('.clock').innerHTML = m + ':' + s; 
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

// eliminate window of rightClick mouse:
document.addEventListener('contextmenu', event => event.preventDefault()); 	