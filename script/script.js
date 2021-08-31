
$(document).ready(function() {
  $("#History").append("Game Ready!");
  //Declaring the Objects to be used
  var player1Squares = new Array();
  var player2Squares = new Array();
  var allSquares = new Array();
  // Determines which player has the current turn
  var currentPlayer = 1;
  var otherPlayer = 2;
  //variables for AI behavior
  var player1SearchMode = false;
  var player2SearchMode = false;
  var player1SearchAroundX;
  var player1SearchAroundY;
  var player2SearchAroundX;
  var player2SearchAroundY;
  //makes sure that no moves are repeated
  var shotsTaken = new Array();
  var player1hp = 20;
  var player2hp = 20;

  //for changing settings
  var gameTime;
  var gameHasStarted = false;
  var gameIsRunning = false;
  var gameSpeed = 1000;
  var speedModifier = 1;
  var showships = false;

  // Every ship that will be created
  var player1 = {
    "Battleship":{hp:4,squares:[]},

    "Cruiser 1" :{hp:3,squares:[]},
    "Cruiser 2" :{hp:3,squares:[]},

    "Destroyer 1":{hp:2,squares:[]},
    "Destroyer 2":{hp:2,squares:[]},
    "Destroyer 3":{hp:2,squares:[]},

    "Submarine 1":{hp:1,squares:[]},
    "Submarine 2":{hp:1,squares:[]},
    "Submarine 3":{hp:1,squares:[]},
    "Submarine 4":{hp:1,squares:[]},
  }
  var player2 = {
    "Battleship":{hp:4,squares:[]},

    "Cruiser 1" :{hp:3,squares:[]},
    "Cruiser 2" :{hp:3,squares:[]},

    "Destroyer 1":{hp:2,squares:[]},
    "Destroyer 2":{hp:2,squares:[]},
    "Destroyer 3":{hp:2,squares:[]},

    "Submarine 1":{hp:1,squares:[]},
    "Submarine 2":{hp:1,squares:[]},
    "Submarine 3":{hp:1,squares:[]},
    "Submarine 4":{hp:1,squares:[]},
  }





//To Create the board
  function GenerateBoard(id){
    var cols = 10;
    var rows = 10;
    var squareSize = 25;
    var Board = document.createElement("DIV");
    Board.style.width = '250px';
    Board.style.height = '250px';
    Board.style.background = 'blue';
    Board.id = "Board" + id;
    document.getElementById("field"+id).appendChild(Board);
    //To add squares
    for (i = 0; i < rows; i++) {
    	for (j = 0; j < cols; j++) {

    		// create a new div HTML element for each grid square and make it the right size
    		var square = document.createElement("div");
    		Board.appendChild(square);

        // give each div element a unique id based on its row and column, like "s00"
    		square.id = 'p'+id+'r' + i+ 'c' + j;
        allSquares.push(square.id);

    		// set each grid square's coordinates: multiples of the current row or column number
    		var topPosition = j * squareSize;
    		var leftPosition = i * squareSize;

    		square.style.top = topPosition + 'px';
    		square.style.left = leftPosition + 'px';
        square.style.width = "23px";
        square.style.height = "23px";
        square.style.border = "1px solid";
        square.style.float = "left";
    	}
    }
  }
  GenerateBoard(1);
  GenerateBoard(2);

// A randomizer for placing ships
 function placer(i,hp){
   var takenSquares = new Array();
   var directionsPossible = new Array();
   var x = Math.floor(Math.random() * 10);
   var y = Math.floor(Math.random() * 10);
   var loc = 'p' + i + 'r' + x + 'c' +y
   takenSquares.push(loc);
   if (i===1) {
     player1Squares.push(loc);
   }
   else {
     player2Squares.push(loc);
   }

  //document.getElementById(loc).style.background = 'red';


   directionsPossible = directions(x,y,hp);
   //This functions determines the possible directions the ship can face

    //A random decision on which orientation to take
    var direction = Math.floor(Math.random() * directionsPossible.length)
    if (directionsPossible[direction]==='up') {
      selectSquares(-1,0);
    }
    else if (directionsPossible[direction]==='down') {
      selectSquares(1,0);
    }
    else if (directionsPossible[direction]==='left') {
      selectSquares(0,-1);
    }
    else if (directionsPossible[direction]==='right') {
      selectSquares(0,1);
    }

    function selectSquares(dx,dy){
      if (hp>1) {
        for(j=1;j<hp;j++){
          x += dx;
          y += dy;
          loc = 'p' + i + 'r' + x + 'c' +y
          takenSquares.push(loc);
          if (i===1) {
            player1Squares.push(loc);
          }
          else {
            player2Squares.push(loc);
          }
          //document.getElementById(loc).style.background = 'red';
        }
      }

    }
    return takenSquares;
 }
 //This function is used for placing the ships
 function directions(x,y,hp){
   var dir = new Array();
  if (y>=hp-1) {
    dir.push('left')
    }
  if (y<=10-hp) {
    dir.push('right')
    }
  if (x>=hp-1) {
    dir.push('up')
    }
  if (x<=10-hp) {
    dir.push('down')
    }
  return dir;

  }


 //Places ships for each player
 $.each(player1, function(name,stats){
   stats.squares = placer(1,stats.hp)
 });
 $.each(player2, function(name,stats){
   stats.squares = placer(2,stats.hp)
 })

//Function to be called if not in search mode(Default)
 function randomShooter(){

     for(;;){
       var x = Math.floor(Math.random() * 10);
       var y = Math.floor(Math.random() * 10);
       var shot = 'p' + otherPlayer + 'r' + x + 'c' +y;
       if (!shotsTaken.includes(shot)) {
         shotsTaken.push(shot);
         $("#History").append("<br><br>Random Player " + currentPlayer + ' Shoots Square: '+shot)
         break;
        }
      }
      checker(x,y,shot);
 }

 //If the previous move is a hit, Search Mode is activated
 function searcherMode(searchAroundX,searchAroundY){
   var sx = searchAroundX;
   var sy = searchAroundY;
   var availableShots = new Array();
   var up = 'p' + otherPlayer + 'r' + (sx+1) + 'c' + (sy);
   var down = 'p' + otherPlayer + 'r' + (sx-1) + 'c' + (sy);
   var left = 'p' + otherPlayer + 'r' + (sx) + 'c' + (sy-1);
   var right = 'p' + otherPlayer + 'r' + (sx) + 'c' + (sy+1);

   //determines which direction the next move will be
   //if it can shoot up
   if (!shotsTaken.includes(up)&&sx<9) {
     availableShots.push('up');
   }
   //if it can shoot down
   if (!shotsTaken.includes(down)&&sx>0) {
     availableShots.push('down');
   }
   //if it can shoot left
   if (!shotsTaken.includes(left)&&sy>0) {
     availableShots.push('left');
   }
   //if it can shoot right
   if (!shotsTaken.includes(right)&&sy<9) {
     availableShots.push('right');
   }
   var available = availableShots.length;

   //if there is an available square
   if (availableShots.length>0) {
     //Randomly selects direction
     var whichdirection = Math.floor(Math.random() * availableShots.length)
     if (availableShots[whichdirection]=='up') {
       $("#History").append("<br><br>Player " + currentPlayer + ' Shoots Square: '+up)
       shotsTaken.push(up);
       checker((sx+1),sy,up);
     }
     else if (availableShots[whichdirection]=='down') {
       $("#History").append("<br><br>Player " + currentPlayer + ' Shoots Square: '+down)
       shotsTaken.push(down);
       checker((sx-1),sy,down);
     }
     else if (availableShots[whichdirection]=='left') {
       $("#History").append("<br><br>Player " + currentPlayer + ' Shoots Square: '+left)
       shotsTaken.push(left);
       checker(sx,(sy-1),left);
     }
     else if (availableShots[whichdirection]=='right') {
       $("#History").append("<br><br>Player " + currentPlayer + ' Shoots Square: '+right)
       shotsTaken.push(right);
       checker(sx,(sy+1),right);
     }
   }
   //if there is no more available square, the AI will look elsewhere
   else {
     for(;;){
       var a = Math.floor(Math.random() * 10);
       var b = Math.floor(Math.random() * 10);
       var shot = 'p' + otherPlayer + 'r' + a + 'c' +b;
       if (!shotsTaken.includes(shot)) {
         shotsTaken.push(shot);
         $("#History").append("<br><br>Player " + currentPlayer + ' Shoots Square: '+shot)
         checker(a,b,shot);
         break;
        }
      }
   }


 }

 //checks if chosen square contains a ship
 function checker(x,y,shot){
   if (currentPlayer===1&&player2Squares.includes(shot)) {

     document.getElementById(shot).style.background = 'black';

     player1SearchMode = true;
     player1SearchAroundX = x;
     player1SearchAroundY = y;
     //Checks which ship has beed hit
     $.each(player2,function(name,stats){
       if (stats.squares.includes(shot)) {
     $("#History").append("<br>"+name + ' has been hit')
         player2hp -= 1;
         $("#History").append("<br>Hitpoints of Player 2 is reduced to " + player2hp);
       }
     });
   }
   else if (currentPlayer===2&&player1Squares.includes(shot)) {

     document.getElementById(shot).style.background = 'black';

     player2SearchMode = true;
     player2SearchAroundX = x;
     player2SearchAroundY = y;
     //Checks which ship has beed hit
     $.each(player1,function(name,stats){
       if (stats.squares.includes(shot)) {
         $("#History").append("<br>"+name + ' has been hit')
         player1hp -= 1;
         $("#History").append('<br>   Player 1 hp is reduced to: ' + player1hp);
       }
     });


   }
   else{
     document.getElementById(shot).style.background = 'yellow';
     $("#History").append("<br>MISS!");
   }
 }

//The Function that runs the game
function runGame(){
  if (currentPlayer===1) {
    if (player1SearchMode==false) {
      randomShooter();
    }
    else{
      searcherMode(player1SearchAroundX,player1SearchAroundY);
    }
    currentPlayer = 2;
    otherPlayer = 1
  }
  else if (currentPlayer===2){
    if (player2SearchMode==false) {
      randomShooter();
    }
    else{

      searcherMode(player2SearchAroundX,player2SearchAroundY);
    }
    currentPlayer = 1;
    otherPlayer = 2;
  }


  //Checks hp of each player and ends the game when player reaches zero hp;
  if (player1hp<=0) {
    alert("Player 2 Wins");
    $("#History").append("<br><br>Game Over!<br>Player 2 Wins")
    clearInterval(gameTime);
  }
  if (player2hp<=0) {
    alert("Player 1 Wins");
    $("#History").append("<br><br>Game Over!<br>Player 1 Wins")
    clearInterval(gameTime);
  }
}


//Pauses or Resumes the game
$("#StartGame").click(function(){
  gameHasStarted = true;
  if (gameIsRunning==false) {
      gameTime = setInterval(runGame,gameSpeed/speedModifier);
      $(this).html("Pause Game");
      gameIsRunning = true
  }
  else {
    gameIsRunning = false;
    $(this).html("Resume Game");
    clearInterval(gameTime);
  }

})

//Changes the speed of the game
$("#Speedx1").click(function(){
  if (gameHasStarted) {
    clearInterval(gameTime);
    speedModifier = 1;
    gameTime = setInterval(runGame,gameSpeed/speedModifier);
  }

})

$("#Speedx10").click(function(){
  if (gameHasStarted) {
    clearInterval(gameTime);
    speedModifier = 10;
    gameTime = setInterval(runGame,gameSpeed/speedModifier);
  }

})
$("#Speedx20").click(function(){
  if (gameHasStarted) {
    clearInterval(gameTime);
    speedModifier = 20;
    gameTime = setInterval(runGame,gameSpeed/speedModifier);
  }

})
$("#ShowShips").click(function(){
  if (showships) {
    $.each(player1,function(name,stats){
      $.each(stats.squares,function(){
        document.getElementById(this).style.borderColor = 'black'
      })
    })
    $.each(player2,function(name,stats){
      $.each(stats.squares,function(){
        document.getElementById(this).style.borderColor = 'black'
      })
    })
    $(this).html("Show Ships");
    showships = false;
  }
  else {
    $.each(player1,function(name,stats){
      $.each(stats.squares,function(){
        document.getElementById(this).style.borderColor = 'red'
      })
    })
    $.each(player2,function(name,stats){
      $.each(stats.squares,function(){
        document.getElementById(this).style.borderColor = 'red'
      })
    })
    $(this).html("Hide Ships");
    showships = true;
  }
})

});
