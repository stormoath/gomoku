import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  Games = new Mongo.Collection('games');
});

Meteor.publish("games", (id) => {
  return Games.find({_id:id});
})