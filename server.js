const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const GameLogic = require('./public/gameLogic.js')
const User = require('./public/user.js');
const { callbackify } = require('node:util');

const app = express();
const server = createServer(app);
const io = new Server(server);


let mapPreset = {
    "0 0": "3W",
    "0 3": "2L",
    "0 7": "3W",
    "0 11": "2L",
    "0 14": "3W",
    "1 1": "2W",
    "1 5": "3L",
    "1 9": "3L",
    "1 13": "2W",
    "2 2": "2W",
    "2 6": "2L",
    "2 8": "2L",
    "2 12": "2W",
    "3 0": "2L",
    "3 3": "2W",
    "3 7": "2L",
    "3 11": "2W",
    "3 14": "2L",
    "4 4": "2W",
    "4 10": "2W",
    "5 1": "3L",
    "5 5": "3L",
    "5 9": "3L",
    "5 13": "3L",
    "6 2": "2L",
    "6 6": "2L",
    "6 8": "2L",
    "6 12": "2L",
    "7 0": "3W",
    "7 3": "2L",
    "7 7": "C",
    "7 11": "2L",
    "7 14": "3W",
    "8 2": "2L",
    "8 6": "2L",
    "8 8": "2L",
    "8 12": "2L",
    "9 1": "3L",
    "9 5": "3L",
    "9 9": "3L",
    "9 13": "3L",
    "10 4": "2W",
    "10 10": "2W",
    "11 3": "2W",
    "11 7": "2L",
    "11 11": "2W",
    "11 14": "2L",
    "12 2": "2W",
    "12 6": "2L",
    "12 8": "2L",
    "12 12": "2W",
    "13 1": "2W",
    "13 5": "3L",
    "13 9": "3L",
    "13 13": "2W",
    "14 0": "3W",
    "14 3": "2L",
    "14 7": "3W",
    "14 11": "2L",
    "14 14": "3W"
}

let lettersInSack = {
    'А': 10,
    'Б': 3,
    'В': 5,
    'Г': 3,
    'Д': 5,
    'Е': 9,
    'Ж': 2,
    'З': 2,
    'И': 8,
    'Й': 4,
    'К': 6,
    'Л': 4,
    'М': 5,
    'Н': 8,
    'О': 10,
    'П': 6,
    'Р': 6,
    'С': 6,
    'Т': 5,
    'У': 3,
    'Ф': 1,
    'Х': 2,
    'Ц': 1,
    'Ч': 2,
    'Ш': 1,
    'Щ': 1,
    'Ъ': 1,
    'Ы': 2,
    'Ь': 2,
    'Э': 1,
    'Ю': 1,
    'Я': 3,
}

let lettersToScore = {
    'А': 1,
    'Б': 3,
    'В': 2,
    'Г': 3,
    'Д': 2,
    'Е': 1,
    'Ж': 5,
    'З': 5,
    'И': 1,
    'Й': 2,
    'К': 2,
    'Л': 2,
    'М': 2,
    'Н': 1,
    'О': 1,
    'П': 2,
    'Р': 2,
    'С': 2,
    'Т': 2,
    'У': 3,
    'Ф': 10,
    'Х': 5,
    'Ц': 10,
    'Ч': 5,
    'Ш': 10,
    'Щ': 10,
    'Ъ': 10,
    'Ы': 5,
    'Ь': 5,
    'Э': 10,
    'Ю': 10,
    'Я': 3,
}



app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
    // console.log(join(__dirname, 'index.html'));
});

app.use(express.static(__dirname + '/public'));

let users = []
let gameLogic = new GameLogic.GameLogic(15, mapPreset, 2, lettersInSack, lettersToScore);


io.on('connection', (socket) => {
    console.log('welcome socket ' + socket);

    socket.emit('authorize', function (username) {
        if (users.length >= gameLogic.numberOfUsers) {
            /*  io.to(users[users.length - 1].socket.id).emit('closeSocket');
              users[users.length - 1].socket.disconnect();
              users.pop();*/
            io.to(socket.id).emit('closeSocket');
            return;
        }
        //if (users.length < gameLogic.numberOfUsers) {
        let user = new User.User(username, "user" + users.length);
        users.push({ user, socket });
        //io.to(user.socket.id).emit('updatePlayersList', users.map(user => user.name));
        users.forEach(user => io.to(user.socket.id).emit('updatePlayersList', users.map(user => user.user)));
        console.log("new user " + users);

        users.forEach(user => io.to(user.socket.id).emit('outlinePlayer', users[gameLogic.getCurrentPlayer()].user.userID));
        io.to(users[gameLogic.getCurrentPlayer()].socket.id).emit('enableInterface');
        // }
        //else{
        //     socket.disconnect();
        //   io.to(users[users.length - 1].socket).emit('disconnectSocket');
        // }

    });



    console.log('number of users:  ' + users.length);




    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
    });

    socket.on('skip button', () => {
        console.log('skip button');
        io.to(users[gameLogic.getCurrentPlayer()].socket.id).emit('disableInterface');
        gameLogic.nextPlayer();
        users.forEach(user => io.to(user.socket.id).emit('outlinePlayer', users[gameLogic.getCurrentPlayer()].user.userID));
        io.to(users[gameLogic.getCurrentPlayer()].socket.id).emit('enableInterface');
        //  setTimeout(() => console.log(1), interval);
        // io.to(users[0].socket.id).emit('join', 'a');

    });

    socket.on('submit button', () => {
        // console.log("current user ", gameLogic.currentPlayer);
        // console.log('skip button', gameLogic);
        console.log("score val serv", gameLogic.scores[gameLogic.getCurrentPlayer()], gameLogic.scores);
        io.to(users[gameLogic.getCurrentPlayer()].socket.id).emit('disableInterface');
        users.forEach(user => io.to(user.socket.id).emit('updateScore', users[gameLogic.getCurrentPlayer()].user.userID, gameLogic.scores[gameLogic.getCurrentPlayer()]));
        gameLogic.nextPlayer();
        users.forEach(user => io.to(user.socket.id).emit('outlinePlayer', users[gameLogic.getCurrentPlayer()].user.userID));
        io.to(users[gameLogic.getCurrentPlayer()].socket.id).emit('enableInterface');



    });

    socket.on('deleteLetter', (prevPos) => {
        gameLogic.deleteLetter(prevPos);
    });

    socket.on('setLetter', (args) => {
        gameLogic.setLetter(args[0], args[1]);
    });

    /*
    socket.on('tilesOnFieldSet', (args) => {
        var htmlObject = document.createElement('div');
        htmlObject.innerHTML = args[1];
        console.log("settt", htmlObject.id)
        gameLogic.tilesOnField.set(args[0], args[1]);
    });*/

    socket.on('makeAllLettersOnFieldOld', (args, callback) => {
        gameLogic.makeAllLettersOnFieldOld();
        callback();
    });

    socket.on('updateField', (_, callback) => {
        callback(JSON.stringify(Array.from(gameLogic.field)), gameLogic.fieldSize);
    });

    socket.on('findVerticalWords', (args, callback) => {
        gameLogic.findVerticalWords();
        // console.log(gameLogic.findVerticalWords());
        callback();
    });

    socket.on('setLetterForChange', (letter) => {
        gameLogic.setLetterForChange(letter);
    });

    socket.on('getLetterForChange', () => {
        gameLogic.setLetterForChange(letter);
    });

    socket.on('getCurrentWords', (args, callback) => {
        callback(Array.from(gameLogic.words));
    });

    socket.on('checkIfValidField', (args, callback) => {
        if (gameLogic.checkIfValidField()) {
            callback();
        }

    });

    socket.on('updateOtherPlayersFields', (args, callback) => {
        users.forEach(user => io.to(user.socket.id)
            .emit('updateField',
                JSON.stringify(Array.from(gameLogic.field)), gameLogic.fieldSize));
        callback();


    });

    socket.on('updateOtherPlayersWordPanel', () => {
        users.forEach(user => io.to(user.socket.id).emit('updateWordPanel'));

    });

    socket.on('getPlayersList', (args, callback) => {
        callback(users);
    });

    socket.on('updateCurrentField', (args, callback) => {
        let currentField = new Map(JSON.parse(args));
        for (let i = 0; i < gameLogic.fieldSize; i++) {
            for (let j = 0; j < gameLogic.fieldSize; j++) {
                let position = `${i} ${j}`;
                let update = currentField.get(position);
                if (update === undefined) {
                    if (gameLogic.field.get(position).fresh || !gameLogic.field.get(position).letter) {
                        gameLogic.deleteLetter(position);
                        console.log('delete letter', position);
                    }
                }
                else if (!gameLogic.field.get(position).letter || gameLogic.field.get(position).letter && gameLogic.field.get(position).fresh) {
                    gameLogic.setLetter(position, update);
                }
            }
        }
        callback();
    });

    socket.on('start', (args, callback) => {
        callback(users[gameLogic.getCurrentPlayer()].user.userID);
    });

    socket.on('randomSackLetter', (args, callback) => {
        let letter = gameLogic.randomSackLetter();
        //  console.log('rand letter', letter);
        callback(letter);
    });

    socket.on('getLettersInSack', (args, callback) => {
        callback(gameLogic.lettersInSack);
    });

    socket.on('drawLettersContainedInSackForAll', () => {
        users.forEach(user => io.to(user.socket.id).emit('drawLettersContainedInSack'));
    });



});

server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});