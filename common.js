import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'

var sessTimeout = 300000;

Meteor.methods({
    'joinBoard'({id}){
        new SimpleSchema({
            id: { type: String }
        }).validate({id});
        return Games.findOne({joined: false, won:false, _id: {$ne: id}, _ts: {$gt: new Date().getTime()-sessTimeout}});
    },
    'updateBoard'({board}){
        new SimpleSchema({
            board: { type: Object },
            'board.board': { type: Array },
            'board.board.$': { type: [String] },
            'board.currentPlayer': { type: String },
            'board.joined': { type: Boolean },
            'board.won': { type: Boolean },
            'board._id': { type: String },
            'board._ts': { type: Number, optional: true }
        }).validate({board});

        Games.update(board._id, {
            $set: { 
                'board': board.board,
                'currentPlayer': board.currentPlayer,
                'joined': board.joined,
                'won': board.won,
                '_ts': new Date().getTime()
            }
        })
    }
})