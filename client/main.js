import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import './main.html';

Games = new Mongo.Collection('games');
var board = {}
var id = 0;
const idDep = new Tracker.Dependency;

function createNewGame(){
  Session.set('message','');
  board = {
    board:  [],
    joined: false,
    won: false
  }
  for(let i=0;i<15;i++){
    board.board[i]=[];
    for(let j=0;j<15;j++){
      board.board[i][j] = "";
    }
  }
  Math.random()>0.5 ? board.currentPlayer = 'X' : board.currentPlayer = 'O';
  id = Games.insert(board);
  board._id = id;
  idDep.changed();
  Session.set('player', board.currentPlayer);
  updateBoard();
  console.log('Created new game with ID ' + id);
}

function checkWinning(board,x,y){
  let player = board[x][y];
  let directions = []
  let winning = false;
  for(let i=-1;i<2;i++){
    for(let j=-1;j<2;j++){
      if(!(i === 0 && j ===0)){
        directions.push([i,j])
      }
    }
  }
  directions.forEach(dir => {
    for(let i=1;i<5;i++){
      if(board[x+dir[0]*i][y+dir[1]*i]!=player){
        break;
      }
      if(i===4){
        winning = player;        
      }
    }
  })
  return winning;
}

function updateBoard(){
  Meteor.call('updateBoard', {board}, (err,res) => {
    if(err){
      console.error("Error while updating board: ", err)
    }
  });
}


Template.board.onCreated(function boardOnCreated() {
  createNewGame();
  Tracker.autorun(() => {
    idDep.depend();
    Meteor.subscribe("games", id)
  });
});

Template.board.helpers({
  board(){
    return Games.findOne({_id:id}).board;
  },

  player(){
    return Session.get('player');
  },
  
  currentPlayer(){
    return Games.findOne({_id:id}).currentPlayer;
  },

  sessionJoined(){
    return Games.findOne({_id:id}).joined;
  },

  message(){
    return Session.get('message');
  },

  won(){
    return Games.findOne({_id:id}).won;
  }
})

Template.board.events({
  'click .newGame': function(){
    if(board.joined){
      board.joined = false;
      updateBoard();
    }
    createNewGame();
  },
  'click #joinSession': function(){
    board = Meteor.call('joinBoard', {id}, (err,res)=>{
      if(err){
        console.error("Error while joining board: ", err);
      }
      else{
        if(!res){
          Session.set('message',"No sessions to join available, creating new session!");
          createNewGame();
          return;
        }
        id = res._id;
        idDep.changed();
        board = res;
        board.joined = true;
        let player = '';
        board.currentPlayer === 'X' ? player = 'O' : player = 'X';
        Session.set('player', player);
        console.log("Joined session ", id, board.joined);
        updateBoard();
      }
    });
  },
  'click .field': function(ev){
    board = Games.findOne({_id:id});
    if(!board.joined || board.won || Session.get('player') !== board.currentPlayer){
      return;
    }
    let X = ev.target.id.split("_")[0];
    let Y = ev.target.id.split("_")[1];
    if(board.board[X][Y]){
      return;
    }
    board.board[X][Y] = board.currentPlayer;
    if(checkWinning(board.board,Number(X),Number(Y))){
      board.won = true;
    }
    else{
      board.currentPlayer === 'X' ? board.currentPlayer = 'O' : board.currentPlayer = 'X';
    }
    updateBoard();
  }
})