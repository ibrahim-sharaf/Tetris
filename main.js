/**************************** helper Methodes *******************************/

// Deep copy for array... 
Array.prototype.deepCopy = function (){
	var res = [];
	this.forEach(item => res.push(Array
		                        .isArray(item)
		                        ?item.deepCopy()
		                        :item));
	return res;
}


// Rotate 2d (x * x) array without damaging the original one.
Array.prototype.rotateArray = function () {
	var arr    = this.deepCopy();
	var length = this.length - 1;
	for (var i = 0; i <= length; i++) {
		for (var j = 0; j <= length; j++) {
			arr[j][length - i] = this[i][j];
		};
	}; return arr;
}


const canvWidth   = 800;
const canvHeight   = 640;

const boxSize     = 25;
const boardWidth  = 15;
const boardHeight = 25;
const empty       = " ";

const leftMargin = Math.floor(canvWidth - (boardWidth * boxSize))/2;
const topMargin  =  canvHeight - (boardHeight * boxSize) - 10;

const boarderColor = "#660000";
const boardColor   = "black";

const freq = 25;

const downMovFreq   = 0.3;
const sideMovFreq   = 0.1;
const roundMoveFreq = 0.3;


// Primary Shapes.
var zShape = [[" "," "," "," "," "],
              [" "," "," "," "," "],
              [" ","o","o"," "," "],
              [" "," ","o","o"," "],
              [" "," "," "," "," "]];

var iShape = [[" "," ","o"," "," "],
              [" "," ","o"," "," "],
              [" "," ","o"," "," "],
              [" "," ","o"," "," "],
              [" "," "," "," "," "]];

var oShape = [[" "," "," "," "," "],
              [" "," "," "," "," "],
              [" ","o","o"," "," "],
              [" ","o","o"," "," "],
              [" "," "," "," "," "]];

var jShape = [[" "," "," "," "," "],
              [" ","o"," "," "," "],
              [" ","o","o","o"," "],
              [" "," "," "," "," "],
              [" "," "," "," "," "]];

var tShape = [[" "," "," "," "," "],
              [" "," ","o"," "," "],
              [" ","o","o","o"," "],
              [" "," "," "," "," "],
              [" "," "," "," "," "]];


var colors      =   ['#dd0000', '#00dd00','#0000dd','#dddd00'];
var colorInside =   ['#ee0000','#00ee00','#0000ee','#eeee00']

/* Secondery Shapes: insteed of writting "sShape" and "Lshape" by hands, I am
going to reverse "zShape" and "jShape" to create them. */

var sShape = zShape.deepCopy().reverse();

var Lshape = jShape.deepCopy().reverse();

/*Building Shape templates */
/*first do shapes that have one or no rotation */
const zShape_template = [zShape,zShape.rotateArray()] 
const sShape_template = [sShape,sShape.rotateArray()]
const iShape_template = [iShape,iShape.rotateArray()]
const oShape_template = [oShape] /*has no rotations */

/*Second do Shapes that have more than one rotation*/
var temp; /* Temporary store the rotated array so you can do more rotations*/

const jShape_template = [jShape, temp = jShape.rotateArray(),
                       temp = temp.rotateArray(),
                       temp.rotateArray()]

const Lshape_template = [Lshape, temp = Lshape.rotateArray(),
                       temp = temp.rotateArray(),
                       temp.rotateArray()]

const tShape_template = [tShape, temp = tShape.rotateArray(),
                       temp = temp.rotateArray(),
                       temp.rotateArray()]


// Game pieces
var pieces = { sShape : sShape_template,
               zShape : zShape_template,
               iShape : iShape_template,
               oShape : oShape_template,
               jShape : jShape_template,
               lshape : Lshape_template,
               rShape : tShape_template }

const templateWidth  = 5;
const templateHieght = 5;

var random = Math.random;

var lastDownMove;
var lastSideMove;
var lastroundMove;

/*****************************************************************/
    
	function startGame() {

		myGameArea.start()

	    gameOver    = false;
	    didNotStart = true;

		level 	= 1;
		score   = 0;

		piece     = getNewPiece();
		nextPiece = getNewPiece();
		board     = getEmptyBoard();

		lastDownMove  = Date.now();
		lastSideMove  = Date.now();
		lastroundMove = Date.now();
	}

	var myGameArea = {
		canvas: document.createElement("canvas"),
		start : function(){
			this.canvas.width  = canvWidth;
			this.canvas.height = canvHeight;
			this.context = this.canvas.getContext("2d");
			document.body.insertBefore(this.canvas, document.body.childNodes[0]);
			this.interval = setInterval(updateGameArea, freq);
			window.addEventListener('keydown', function(e){
				myGameArea.key = e.keyCode;
			})
			window.addEventListener('keyup', function(e){
				myGameArea.key = false;
			})
		},
		clear : function(){
			this.context.clearRect(0,0, this.canvas.width, this.canvas.height);
		}
	}

// main loop
	function updateGameArea() {

		myGameArea.clear();

		if (gameOver){
			drawGameOver();
			if (myGameArea.key == 13) {
				nextPiece = getNewPiece();
				piece 	  = getNewPiece();
				board 	  = getEmptyBoard();

				gameOver = false;
			}

		} else if (didNotStart) {
			drawStart();
			if (myGameArea.key == 13){
				date = Date.now();
				didNotStart = false;
			}
		} else {
			gameLoop();
		}

	}


	function gameLoop() {
		
		drawBoard(board);
		drawPieace(piece);
		drawNextPiece(nextPiece);
		drawStatistics();

		if (!isVaildPos(board,piece)) {
			gameOver = true;
		}

		if (!isVaildPos(board,piece,0,1)){
			addToBoard(piece);
			piece     = nextPiece;
			nextPiece = getNewPiece();
			score    += getScores(board)
		};

		listenToKeys();

		if((Date.now() - lastDownMove)/1000 > downMovFreq) {
			piece.y++;
			lastDownMove = Date.now();
		}
		
	}

	function calculateSpead(){
		level += ~~(score/10);
	}

	function listenToKeys(){
			if (myGameArea.key && myGameArea.key == 37 && isVaildPos(board, piece, -1,0) && (Date.now() - lastSideMove)/1000 > sideMovFreq){
					piece.x-- 
					lastSideMove = Date.now();
			} else if (myGameArea.key && myGameArea.key == 39 && isVaildPos(board, piece, 1,0)  && (Date.now() - lastSideMove)/1000 > sideMovFreq){
		    	piece.x++ ;
		    	lastSideMove = Date.now();
		    } else if (myGameArea.key && myGameArea.key == 38 && (Date.now() - lastroundMove)/1000 > roundMoveFreq) {
		    	piece.rotation = (piece.rotation + 1) % pieces[piece.shape].length
		    	lastroundMove = Date.now();
		    	if(!isVaildPos(board,piece)){
		    		piece.rotation = (piece.rotation - 1) % pieces[piece.shape].length
		 
		    	}

		    } else if(myGameArea.key && myGameArea.key == 40 && isVaildPos(board, piece, 0,1)) {
		    	piece.y++;
		    	lastDownMove = Date.now();
		    }

		     else if (myGameArea.key && myGameArea.key == 32){
		    	for (var i = 1; i < boardHeight; i++) {
		    		if (!isVaildPos(board,piece,0,i)){
		    			break;
		    		}; piece.y += i - 1;
		    	}
		    }
		}


	function isCompleteLine(board, y){
		for (var x = 0; x < boardWidth; x++) {
			if(board[x][y] === empty){
				return false
			}
		}; return true;
	}

	function getScores(board){
		var removed_n = 0;
		var y = boardHeight - 1;

		while (y >= 0){
			if(isCompleteLine(board,y)){
				for (var i = y; i > 0; i--) {
				  	for (var j = 0; j < boardWidth; j++) {
				  		board[j][i] = board[j][i - 1]
				  	};
				  };
				for (var i = 0; i < boardWidth; i++) {
					board[i][0] = empty;
				};
				  removed_n += 1;	    
			} else{
				y--
			}
		}
		if (removed_n) {
			calculateSpead();
		};return removed_n;
	}

	function addToBoard(piece){
		for (var x = 0; x < templateWidth; x++) {
			for (var y = 0; y < templateHieght; y++) {
				if(pieces[piece.shape][piece.rotation][y][x] !== empty){
					board[x + piece.x][y + piece.y] = 1 /*piece.color*/;
				}	
			};
		};
	}

	

	function isOnBoard(x,y){
		return x >= 0 && x < boardWidth && y < boardHeight;
	}

	function isVaildPos(board, piece, newX,newY){
		if(!newX){newX = 0};
		if(!newY){newY = 0};
		for (var x = 0; x < templateWidth; x++) {
			for (var y = 0; y < templateHieght; y++) {
				isAboveBoard = (y + piece.y + newY) < 0;
				if (isAboveBoard || pieces[piece.shape][piece.rotation][y][x] == empty){
					continue;
				}
				if (!isOnBoard(x + piece.x + newX, y + piece.y + newY)){
					return false;
				}

				if (board[x + piece.x + newX][y + piece.y + newY] !== empty){
					return false;
				}
			};
		}; return true;
	}

	function drawText(text,x,y,font, color){
		var ctx = myGameArea.context;
		ctx.font = font;
		ctx.fillStyle = color;
		ctx.fillText(text, x,y)
	}


    function drawGameOver() {
		drawText("Game Over",canvWidth/5 >> 0 , canvHeight/3 >> 0,"100px Arial", "white");
		drawText("Press Enter to play again",canvWidth/3 >> 0 , canvHeight/2 >> 0,"30px gorgia", "white");
	}

	function drawStart(){
		drawText("Tetris",canvWidth/3 >> 0 , canvHeight/3 >> 0,"100px Arial", "white");
		drawText("Press Enter to start",canvWidth/3 >> 0 , canvHeight/2 >> 0,"30px gorgia", "white");
	}

	function drawStatistics(){

		drawText("STATISTICS",canvWidth - 160 ,40,"25px Arial", "red");
		drawText("SCORES " + score , canvWidth - 140, 80, "20px Arial", "blue");
		drawText("LEVEL " + level , canvWidth - 140, 120, "20px Arial", "blue");
		drawText("TIME " + ((Date.now() - date)/1000 >> 0 ) , canvWidth - 140, 160, "20px Arial", "blue");
		drawText("NEXT PIECE", canvWidth - 170, 280, "25px Arial", colors[nextPiece.color])
	}

	function draw(x,y,width,height,color){
		var ctx = myGameArea.context;
		ctx.fillStyle = color;
		ctx.fillRect(x,y,width,height);
	}

	function drawBox(x,y, color, pixelx,pixely){
		if (color === empty) {
			return 
		}
		if (!pixely && !pixelx){
			pixelx = leftMargin + (x * boxSize);
			pixely = topMargin  + (y * boxSize);
			
		}
		draw(pixelx + 1,pixely + 1,boxSize - 1,boxSize - 1,colors[color])
		draw(pixelx + 5,pixely + 5,boxSize -10 ,boxSize - 10 , colorInside[color])
	}

	function drawBoard(board){
		draw(leftMargin - 5, topMargin - 5, (boardWidth*boxSize)+10, (boardHeight*boxSize) + 10, boarderColor)
		draw(leftMargin, topMargin, boardWidth*boxSize, boardHeight*boxSize, boardColor)
		for (var i = 0; i < boardWidth; i++) {
			for (var j = 0; j < boardHeight; j++) {
				drawBox(i,j, board[i][j])
			};
		};
	}

function getEmptyBoard(){
	var board = [];
	for (var i = 0; i < boardWidth; i++) {
		board.push([])
		for (var j = 0; j < boardHeight; j++) {
			board[i].push(empty)
		};
	}; return board;
}

function getNewPiece() {
	shape    = getRandomKey(pieces);
	newPiece = {
		        shape : shape,
		        rotation : random() * pieces[shape].length << 0,
		        x : Math.floor((boardWidth / 2) - (templateWidth / 2)),
		        y : -2,
		        color : getRandomIndex(colors)
	           };

	return newPiece;
}

function drawPieace(piece, pixelx, pixely){
	shapeToDraw = pieces[piece.shape][piece.rotation];

	if (!pixelx && !pixely){
		pixelx = leftMargin + (piece.x * boxSize);
		pixely = topMargin  + (piece.y * boxSize);
	}
	for (var i = 0; i < templateWidth; i++) {
		for (var j = 0; j < templateHieght; j++) {
			// Bug here : Cannot read property '0' of undefined
			if (shapeToDraw[j][i] !== empty){
				drawBox(null,null,piece.color,pixelx + (i * boxSize) ,pixely + (j * boxSize))
			}
		};
	};
}

function drawNextPiece(piece){
	drawPieace(piece, canvWidth - 150, 300)
}

function getRandomKey(obj){
	var keys = Object.keys(obj);
	return keys[keys.length * random() << 0];
}

function getRandomIndex(arr){
	return arr.length * random() << 0;
}

document.body.addEventListener("lood", startGame());