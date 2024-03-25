const express = require("express");
var http = require("http");
const app = express();
const port =  process.env.PORT || 3000;
var server = http.createServer(app);
const mongoose = require("mongoose");
const Room = require('./models/Room');

var io = require("socket.io")(server);

//middleware
app.use(express.json());

const DB = 'mongodb+srv://bhavyamalik2020:kuki77ok@cluster0.gn2zqjc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(DB).then(() => {
    console.log("Connection successful");
}).catch((e) => {
    console.log(e);
})

io.on('connection', (socket) => {
    console.log('connected socket :)');
    //CREATE GAME CALLBACK
    socket.on('create-game', async({nickname, name, occupancy, maxRounds}) => {
        try{
            const existingRoom = await Room.findOne({name});
            if(existingRoom){
                console.log("same name room exists okayy");
                socket.emit('notCorrectGame', 'Room with that name already exists!');
                return;
            }
            let room = new Room();
             room.name = name;
             room.occupancy = occupancy;
             room.maxRounds = maxRounds;

             let player = {
                  socketID: socket.id,
                  nickname,
                  isPartyLeader: true,
             }
             room.players.push(player);
             room = await room.save();
             socket.join(name);
             io.to(name).emit('updateRoom', room);
        }catch(err){
            console.log(err);
        }
    });
    //JOIN GAME CALLBACK
    socket.on('join-game', async({nickname, name}) => {
  console.log("mic check");
        try{

            let room = await Room.findOne({name});
           // console.log(room + "i am the damn room.");
            console.log("mic check");
            if(!room){
                socket.emit('notCorrectGame', 'Please enter a valid room name !!!');
                return;
            }
            if(room.isJoin){

                //if room available
                let player = {
                    socketID: socket.id,
                    nickname
                }
                console.log(player);

                room.players.push(player);
                socket.join(name);


                if(room.players.length === room.occupancy){
                    room.isJoin = false;
                }
                room.turn = room.players[room.turnIndex];
//                room.maxRounds=room.maxRounds;
                room = await room.save();
                io.to(name).emit('updateRoom', room);
            }
            else{
                socket.emit('notCorrectGame', 'The game is in progress');
            }
        }catch(err){
            console.log(err);
        }
    })
})

server.listen(port, "0.0.0.0", () => {
    console.log("server started and running on port : "+port);
})