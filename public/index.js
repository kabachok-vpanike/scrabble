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

let LocalGameField = new Map();

let FieldSize;
// let tilesOnField = new Map();
let tilesOnField = [];
const socket = io();

let LettersInHand = 7;
var LetterForChange;

let InitialTime = 20 * 60;

let Interval = 1000;
let Expected = Date.now() + Interval;
let CurrentUserID;

function step() {
    let dt = Date.now() - Expected; // the drift (positive for overshooting)
    if (dt > Interval) {
        // something really bad happened. Maybe the browser (tab) was inactive?
        // possibly special handling to avoid futile "catch up" run
    }
    console.log(InitialTime);
    InitialTime--;
    //   console.log(gameLogic.getCurrentPlayer())
    // io.to(users[gameLogic.getCurrentPlayer()].socket.id).emit('updateTimer', users[gameLogic.getCurrentPlayer()].user.userID, InitialTime);
    updateTimer(CurrentUserID, InitialTime);
    Expected += Interval;
    setTimeout(step, Math.max(0, Interval - dt));
}

function handleStart() {
    /* socket.emit('start', undefined, function (userID) {
         CurrentUserID = userID;
         setTimeout(step, Interval);
         //updateTimer(userID, Interval);
     });*/
}



function handleDragStart(e) {
    this.style.opacity = '0.5';
    e.dataTransfer.setData("text", e.target.id);
    if (e.target.parentNode.id !== 'lettersSet') {
        e.dataTransfer.setData('prevPos', e.target.parentNode.getAttribute('data-value'));
        // console.log(e.target.parentNode.getAttribute('data-value'));
    }
}

function handleDragEnd(e) {
    this.style.opacity = '1';
}

function handleDragEnter(e) {
    this.children[0].classList.add('over');
}

function handleDrop(e) {
    e.preventDefault();
    var data = e.dataTransfer.getData("text");
    let prevPos = e.dataTransfer.getData('prevPos');
    if (e.target.className === 'p') { return; } // that's NOT how to do this check
    if ([...e.target.classList].includes('tile') && e.target.parentNode.className === 'letters') {
        e.target.parentNode.appendChild(document.getElementById(data));
        document.getElementById(data).classList.remove('fieldTile');
        document.getElementById(data).classList.add('availableTile');
        document.getElementById(data).children[0].children[0].classList.add('letterScore');
        document.getElementById(data).children[0].children[0].classList.remove('letterScoreSmaller');
    }

    else if (e.target != document.getElementById(data) && (e.target.childElementCount === 1 || e.target.className === 'letters' || e.target.childElementCount === 2 && e.target.classList[0].className in ['cell2L', 'cell2W', 'cell3L', 'cell3W']) && ![...e.target.classList].includes('tile')) {
        if (e.target.className === 'letters') {
            document.getElementById(data).classList.remove('fieldTile');
            document.getElementById(data).classList.add('availableTile');
            document.getElementById(data).children[0].children[0].classList.add('letterScore');
            document.getElementById(data).children[0].children[0].classList.remove('letterScoreSmaller');
        }
        else {
            document.getElementById(data).classList.remove('availableTile');
            document.getElementById(data).classList.add('fieldTile');
            document.getElementById(data).children[0].children[0].classList.remove('letterScore');
            document.getElementById(data).children[0].children[0].classList.add('letterScoreSmaller');
            let letterPut = document.getElementById(data).textContent[0];
            let positionPut = e.target.getAttribute('data-value');
            if (prevPos) {

                // gameLogic.deleteLetter(prevPos);
                socket.emit('deleteLetter', prevPos);
                LocalGameField.delete(prevPos);

            }
            //socket.emit('setLetter', [positionPut, letterPut]);

            LocalGameField.set(positionPut, letterPut);
            //    gameLogic.setLetter(positionPut, letterPut);
            //    console.log(letterPut, positionPut);
            //  console.log("srt", document.getElementById(data).toString());
            //socket.emit('tilesOnFieldSet', [positionPut, document.getElementById(data).toString()])
            // tilesOnField.set(positionPut, document.getElementById(data));
            tilesOnField.push(document.getElementById(data));
        }
        e.target.appendChild(document.getElementById(data));
    }
    this.children[0].classList.remove('over')
    return false;
}

function handleDragLeave(e) {
    setTimeout(() => this.children[0].classList.remove('over'), 50);
    //this.classList.remove('over')

}

function allowDrop(e) {
    e.preventDefault();
}

function backToLettersSet(e) {
    e.preventDefault();
    if (e.target.parentNode.className === 'letters') {
        return;
    }


    // console.log(e.target.parentNode.getAttribute('data-value'));

    // socket.emit('deleteLetter', e.target.parentNode.getAttribute('data-value'));
    LocalGameField.delete(e.target.parentNode.getAttribute('data-value'));
    //  gameLogic.deleteLetter(e.target.parentNode.getAttribute('data-value'));
    let tile = document.getElementById(e.target.id);
    let lettersSet = document.getElementById('lettersSet');
    tile.classList.remove('fieldTile');
    tile.classList.add('availableTile');
    tile.children[0].children[0].classList.add('letterScore');
    tile.children[0].children[0].classList.remove('letterScoreSmaller');
    lettersSet.appendChild(tile);
}

function updateField() {
    for (tile of tilesOnField) {
        tile.removeAttribute('id');
    }
    /*
    socket.emit('updateField', undefined,
        function (gameLogicField, gameLogicSize) {
            gameLogicField = new Map(JSON.parse(gameLogicField));
            // console.log(gameLogicField, gameLogicSize);
            for (let i = 0; i < gameLogicSize; i++) {
                for (let j = 0; j < gameLogicSize; j++) {
                    if (gameLogicField.get(`${i} ${j}`).letter && !gameLogicField.get(`${i} ${j}`).fresh) {
                        let tile = tilesOnField.get(`${i} ${j}`);
                        tile.style.backgroundColor = "#53624E";
                        tile.style.color = "#EDF1D6";
                        tile.setAttribute('draggable', 'false');
                        tile.style.pointerEvents = 'none';
                        tile.removeAttribute('id');
                        // tile.id = '';
                    }

                }
            }
        });
        */
}

function updateLetterInHand() {
    let lettersInHand = document.getElementById('lettersSet');
    let index = 0;
    for (let tile of lettersInHand.children) {
        tile.id = `tile${index}`
        index++;
        // console.log(lettersInHand);
    }
    for (index; index < LettersInHand; index++) {
        //  let randomLetter = randomSackLetter();
        socket.emit('randomSackLetter', undefined, function (randomLetter) {
            // lettersInSack[randomLetter]--;
            let tile = createTile(randomLetter, `tile${index}`);
            lettersInHand.appendChild(tile);
        });
        // console.log(tile.id, tile.classList);
    }
    //  updateLettersInSack();
}

function updateLettersInSack() {
    let sackLettersForChange = document.getElementById('sackLettersForChange');
    sackLettersForChange.innerHTML = '';
    for (let i = 0; i < LettersInHand; i++) {
        let tileInSack = document.getElementById(`tile${i}`).cloneNode(true);
        // console.log(`tile${i}`, document.getElementById(`tile${i}`).classList);
        tileInSack.id = `tileSack${i}`;
        tileInSack.draggable = false;

        // tileInSack.classList.remove('fieldTile');
        //  tileInSack.classList.add('availableTile');

        tileInSack.classList.add('tileForChange');
        sackLettersForChange.appendChild(tileInSack);
        tileInSack.addEventListener('click', handleLetterInSackClick);
    }

}

function resetSack() {
    let sackButton = document.getElementById(`sackButton`);
    sackButton.style.pointerEvents = 'none';
    sackButton.style.opacity = 0.5;
}

function handleSubmit() {
    socket.emit('updateCurrentField', JSON.stringify(Array.from(LocalGameField)), function () {
        socket.emit('checkIfValidField', undefined, function () {
            socket.emit('makeAllLettersOnFieldOld', undefined, function () {
                socket.emit('updateOtherPlayersFields', undefined, function () {
                    updateField();
                    socket.emit('findVerticalWords', undefined, function () {
                        updateLetterInHand();

                        resetSack();
                        //drawLettersContainedInSack();
                        socket.emit('drawLettersContainedInSackForAll');
                        //setTimeout(() => updateLettersInSack(), 10);
                        updateLettersInSack();
                        socket.emit('updateOtherPlayersWordPanel');
                        socket.emit('submit button');
                        //  updateWordPanel();
                    });

                });
            });

        });
    });
    /* if (gameLogic.checkIfValidField()) {
       
         // gameLogic.makeAllLettersOnFieldOld();
         // gameLogic.updateField();
         // gameLogic.findVerticalWords();
        
     }*/
}

/*
function randomSackLetter() {
    let letters = Object.entries(lettersInSack).filter(([letter, quantity]) => quantity > 0);
    let randomLetter = letters[Math.floor(Math.random() * letters.length)][0];

    //  console.log(randomLetter);
    return randomLetter;
}
*/

function handleLetterInSackClick(event) {
    //   gameLogic.setLetterForChange = 
    //   console.log(event.target);
    LetterForChange = event.target.textContent[0];
    for (let i = 0; i < LettersInHand; i++) {
        let tileInSack = document.getElementById(`tileSack${i}`);
        if (tileInSack === event.target) {
            //  gameLogic.setLetterForChange(i);
            // socket.emit('setLetterForChange', i);
            LetterForChange = i;
        }
        tileInSack.style.opacity = 0.5;
    }
    event.target.style.opacity = 1;
    let sackButton = document.getElementById(`sackButton`);
    sackButton.style.opacity = 1;
    sackButton.style.pointerEvents = '';
}

function sackCrossHandler() {
    let sack = document.getElementById('sack');
    sack.style.transitionDuration = "0.5s, 0s";
    sack.style.transitionDelay = "0s, 0.5s";
    sack.style.transitionProperty = "opacity, z-index";
    sack.style.opacity = 0;
    sack.style.zIndex = -1;
}

function sackButtonHandler() {
    // console.log(gameLogic.letterForChange);
    let tileInSack = document.getElementById(`tileSack${LetterForChange}`);
    let tile = document.getElementById(`tile${LetterForChange}`);
    // console.log("asdas", tile, tileInSack);
    // let randomLetter = randomSackLetter();
    socket.emit('randomSackLetter', undefined, function (randomLetter) {
        // lettersInSack[randomLetter]--;
        tile.childNodes[0].textContent = randomLetter;
        tile.children[0].children[0].textContent = lettersToScore[randomLetter];
        tileInSack.childNodes[0].textContent = randomLetter;
        tileInSack.children[0].children[0].textContent = lettersToScore[randomLetter];
        //  drawLettersContainedInSack();
        socket.emit('drawLettersContainedInSackForAll');
    });
}

function createTile(letter, id) {

    let tile = document.createElement('div');
    let scoreDiv = document.createElement('div');
    scoreDiv.classList.add('letterScoreDiv');
    let score = document.createElement('p');
    score.classList.add('letterScore')
    score.textContent = lettersToScore[letter];

    tile.id = id;
    tile.innerText = letter;
    tile.classList.add('tile');
    tile.classList.add('availableTile')
    tile.draggable = 'true';
    scoreDiv.appendChild(score);
    tile.appendChild(scoreDiv);

    tile.addEventListener('dragstart', handleDragStart);
    tile.addEventListener('dragend', handleDragEnd);
    tile.addEventListener('contextmenu', backToLettersSet);

    return tile;
}

function createPlayerCard(name, score, time, userID) {
    let userCard = document.createElement('div');
    userCard.classList.add('userCard');
    let upperCard = document.createElement('div');
    upperCard.classList.add('upperCard');
    let img = document.createElement('img');
    img.src = 'user.svg';
    img.classList.add('userPic');
    let nameCard = document.createElement('span');
    nameCard.classList.add('nameCard');
    nameCard.textContent = name;
    upperCard.appendChild(img);
    upperCard.appendChild(nameCard);
    let lineCard = document.createElement('div');
    lineCard.classList.add('lineCard');
    let bottomCard = document.createElement('div');
    bottomCard.classList.add('bottomCard');
    let scoreCard = document.createElement('span');
    scoreCard.classList.add('scoreCard');
    scoreCard.textContent = score;
    let timeCard = document.createElement('span');
    timeCard.classList.add('timeCard');
    timeCard.textContent = time;
    bottomCard.append(scoreCard);
    bottomCard.append(timeCard);
    userCard.append(upperCard);
    userCard.append(lineCard);
    userCard.append(bottomCard);
    userCard.id = userID;
    return userCard;
}

function addPlayer(name, score, time) {
    let users = document.getElementById('rightBox');
    users.appendChild(createPlayerCard(name, score, time));
}

function updatePlayersList(players) {
    //  socket.emit('getPlayersList', undefined, function (players) {
    let users = document.getElementById('rightBox');
    users.innerHTML = '';
    for (let player of players) {
        users.appendChild(createPlayerCard(player.name + player.userID, player.score, player.time, player.userID));
    }
    //});
}

function outlinePlayer(userID) {
    console.log("my:", userID);
    let users = document.getElementById('rightBox').children;
    for (let user of users) {
        console.log(userID);
        user.style.opacity = user.id === userID ? 1 : 0.5;

    }
}

function updateTimer(userID, timerVal) {
    var date = new Date(0);
    date.setSeconds(timerVal);
    var timeString = date.toISOString().substring(14, 19);

    let users = document.getElementById('rightBox').children;
    for (let user of users) {
        if (user.id === userID) {
            user.lastChild.lastChild.textContent = timeString;
        }
    }
}

function updateScore(userID, scoreVal) {
    console.log('score', scoreVal);
    let users = document.getElementById('rightBox').children;
    for (let user of users) {
        if (user.id === userID) {
            console.log('last first', user.lastChild.firstChild)
            user.lastChild.firstChild.textContent = scoreVal;
        }
    }
}

function drawLettersContainedInSack() {

    socket.emit('getLettersInSack', undefined, function (lettersInSack) {
        let sackLetters = document.getElementById('sackLetters');
        sackLetters.innerHTML = '';
        for (let i of 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('')) {
            if (!lettersInSack[i]) continue;

            let letterPLusNumber = document.createElement('span');
            letterPLusNumber.classList.add('letterPlusNumber');
            let letter = document.createElement('span');
            letter.classList.add('letterInSack');
            let number = document.createElement('span');
            number.classList.add('numberForLetterInSack');
            letter.innerText = i;
            number.innerText = 'x' + lettersInSack[i];
            letterPLusNumber.appendChild(letter);
            letterPLusNumber.appendChild(number);
            sackLetters.appendChild(letterPLusNumber);
        }
    });
}

function updateWordPanel() {
    socket.emit('getCurrentWords', undefined, function (newWords) {
        // console.log('curr', newWords);
        let wordPanel = document.getElementById('wordsPlayed');
        wordPanel.innerHTML = '';
        for (let wordText of newWords) {
            let listElement = document.createElement('li');
            let wordInPanel = document.createElement('span');
            wordInPanel.innerText = wordText;
            wordInPanel.classList.add('wordItem');
            listElement.append(wordInPanel)
            wordPanel.appendChild(listElement);
        }
    });

}

function skipButtonHandler() {
    socket.emit('skip button');
}

function disableInterface() {
    for (let i = 0; i < LettersInHand; i++) {
        let tile = document.getElementById(`tile${i}`);
        tile.draggable = false;
        tile.style.pointerEvents = 'none';
    }
    let submitButton = document.getElementById(`submitButton`);
    submitButton.removeEventListener('click', handleSubmit);
    let sackButton = document.getElementById(`sackButton`);
    sackButton.removeEventListener('click', sackButtonHandler);
    let skipButton = document.getElementById(`skipButton`);
    skipButton.removeEventListener('click', skipButtonHandler);
}

function enableInterface() {
    for (let i = 0; i < LettersInHand; i++) {
        let tile = document.getElementById(`tile${i}`);
        tile.draggable = true;
        tile.style.pointerEvents = '';

    }
    let submitButton = document.getElementById(`submitButton`);
    submitButton.addEventListener('click', handleSubmit);
    let sackButton = document.getElementById(`sackButton`);
    sackButton.addEventListener('click', sackButtonHandler);
    let skipButton = document.getElementById(`skipButton`);
    skipButton.addEventListener('click', skipButtonHandler);
}

let field = document.createElement('div');
let letters = document.createElement('div');
letters.id = 'lettersSet'
let bottomBar = document.createElement('div');
let backgroundDiv = document.createElement('div');

field.classList.add('field');
letters.classList.add('letters');
bottomBar.classList.add('bottomBar');
backgroundDiv.classList.add('background');

testArray = ['М', 'И', 'Н', 'А', 'М', 'И', 'Г']
for (let i = 0; i < LettersInHand; i++) {
    // let randomLetter = randomSackLetter();
    /*  socket.emit('randomSackLetter', undefined, function (randomLetter) {
          let tile = createTile(randomLetter, `tile${i}`)
          letters.appendChild(tile);
      });*/

    let randomLetter = testArray[i];
    // lettersInSack[randomLetter]--;
    let tile = createTile(randomLetter, `tile${i}`)
    letters.appendChild(tile);
}

for (let i = 0; i < 15; i++) {
    for (let j = 0; j < 15; j++) {
        let cell = document.createElement('div');
        let colorWithin = document.createElement('div');
        cell.classList.add('emptyCell');
        cell.id = `cell ${i} ${j}`;
        colorWithin.classList.add('colorWithin')
        cell.appendChild(colorWithin);
        field.appendChild(cell);
        field.addEventListener('contextmenu', (e) => e.preventDefault());
        cell.addEventListener('dragenter', handleDragEnter);
        cell.addEventListener('dragleave', handleDragLeave);
        cell.addEventListener('drop', handleDrop);
        cell.addEventListener('dragover', allowDrop);
        cell.addEventListener('contextmenu', (e) => e.preventDefault());
        cell.setAttribute('data-value', `${i} ${j}`);


        // letters.addEventListener('dragenter', handleDragEnter);
        letters.addEventListener('dragleave', handleDragLeave);
        letters.addEventListener('drop', handleDrop);
        letters.addEventListener('dragover', allowDrop);
        letters.addEventListener('contextmenu', (e) => e.preventDefault());

        if (`${i} ${j}` in mapPreset) {
            let kind = mapPreset[`${i} ${j}`];
            if (kind === '2L') {
                cell.removeChild(colorWithin);
                let within = document.createElement('div');
                within.classList.add('cell2L');
                cell.appendChild(within);
                cell.children[0].innerText = '2Б';
            }
            if (kind === '2W') {
                cell.removeChild(colorWithin);
                let within = document.createElement('div');
                within.classList.add('cell2W');
                cell.appendChild(within);
                cell.children[0].innerText = '2С';
            }
            if (kind === '3L') {
                cell.removeChild(colorWithin);
                let within = document.createElement('div');
                within.classList.add('cell3L');
                cell.appendChild(within);
                cell.children[0].innerText = '3Б';
            }
            if (kind === '3W') {
                cell.removeChild(colorWithin);
                let within = document.createElement('div');
                within.classList.add('cell3W');
                cell.appendChild(within);
                cell.children[0].innerText = '3С';
            }
            if (kind === 'C') {
                cell.removeChild(colorWithin);
                let within = document.createElement('div');
                within.classList.add('cellCenter');
                cell.appendChild(within);

            }
        }
    }
}

let skipButton = document.createElement('button');
skipButton.innerText = "Пропустить";
let submitButton = document.createElement('button');
submitButton.innerText = "Отправить";
// let startButton = document.getElementById('start');
// startButton.addEventListener('click', handleStart);
skipButton.classList.add('skipButton');
skipButton.id = "skipButton";
submitButton.classList.add('submitButton');
submitButton.id = "submitButton";
skipButton.addEventListener('contextmenu', (e) => e.preventDefault());
submitButton.addEventListener('contextmenu', (e) => e.preventDefault());
bottomBar.addEventListener('contextmenu', (e) => e.preventDefault());
backgroundDiv.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('contextmenu', (e) => e.preventDefault());

bottomBar.appendChild(skipButton);
bottomBar.appendChild(letters);
bottomBar.appendChild(submitButton);
backgroundDiv.appendChild(field);
backgroundDiv.appendChild(bottomBar);
document.body.appendChild(backgroundDiv);

submitButton.addEventListener('click', handleSubmit);

drawLettersContainedInSack();


sack.style.opacity = 0;
let sackPic = document.getElementById('sackPic');

const sackPicHandler = () => { sack.style.transition = "opacity 0.5s"; sack.style.opacity = 1; sack.style.zIndex = 1; }
sackPic.addEventListener("click", sackPicHandler);

let sackCross = document.getElementById('sackCross');
// const sackCrossHandler = () => { sack.style.transitionDuration = "0.5s, 0s"; sack.style.transitionDelay = "0s, 0.5s"; sack.style.transitionProperty = "opacity, z-index"; sack.style.opacity = 0; sack.style.zIndex = -1; }
sackCross.addEventListener("click", sackCrossHandler);

let sackButton = document.getElementById('sackButton');
sackButton.style.pointerEvents = 'none';
// const sackButtonHandler = () => { sack.style.opacity = 0.5; }
sackButton.addEventListener("click", sackButtonHandler);

let sackLettersForChange = document.getElementById('sackLettersForChange');


for (let i = 0; i < LettersInHand; i++) {
    let tileInSack = document.getElementById(`tile${i}`).cloneNode(true);
    tileInSack.id = `tileSack${i}`;
    tileInSack.draggable = false;
    tileInSack.classList.add('tileForChange');
    sackLettersForChange.appendChild(tileInSack);
}

for (let i = 0; i < LettersInHand; i++) {
    let tileInSack = document.getElementById(`tileSack${i}`);
    // console.log(tileInSack);
    tileInSack.addEventListener('click', handleLetterInSackClick);
}

//document.body.appendChild(cell);

// var gameLogic = new GameLogic(15, mapPreset, 2, lettersInSack, lettersToScore);


// addPlayer('Алиса', 2, '10:20');
// addPlayer('Боб', 103, '12:32');



skipButton.addEventListener('click', skipButtonHandler);

submitButton.addEventListener('click', (event) => {
    //socket.emit('submit button', gameLogic);
});

socket.on('join', function () {
    alert("afdaad");
});

socket.on('updateField', function (gameLogicField, fieldSize) {
    let gameField = new Map(JSON.parse(gameLogicField));
    console.log(gameField);
    for (let i = 0; i < fieldSize; i++) {
        for (let j = 0; j < fieldSize; j++) {
            let cell = document.getElementById(`cell ${i} ${j}`);

            let letter = gameField.get(`${i} ${j}`).letter;

            if (letter) {
                if (cell.lastChild.id.includes('tile')) {
                    cell.lastChild.dispatchEvent(new CustomEvent('contextmenu'));
                }
                //cell.removeChild(cell.lastChild);
                let tile = createTile(letter, '');
                tile.classList.remove('availableTile');
                tile.classList.add('fieldTile');
                tile.children[0].children[0].classList.remove('letterScore');
                tile.children[0].children[0].classList.add('letterScoreSmaller');
                tile.style.backgroundColor = "#53624E";
                tile.style.color = "#EDF1D6";
                tile.draggable = false;
                tile.style.pointerEvents = 'none';
                cell.appendChild(tile);
            }
        }
    }
});

socket.on('updateWordPanel', function () {
    updateWordPanel();
});

socket.on('authorize', function (callback) {
    let username = prompt("What's your name?");
    callback(username);
});

socket.on('updatePlayersList', function (users) {
    console.log(users);
    // addPlayer(users, 0, '20:00')
    updatePlayersList(users);
});

socket.on('disableInterface', function () {
    disableInterface();
});

socket.on('enableInterface', function () {
    enableInterface();
});

socket.on('closeSocket', function () {
    alert('Not able to join: max amount of users exceeded');
    document.body.innerHTML = "";
});

socket.on('outlinePlayer', function (userID) {
    console.log('faffa');
    outlinePlayer(userID);
});

socket.on('updateTimer', function (userID, timerVal) {
    console.log('mfiwnf');
    updateTimer(userID, timerVal);
});

socket.on('updateScore', function (userID, scoreVal) {
    updateScore(userID, scoreVal);
});

socket.on('drawLettersContainedInSack', function () {
    drawLettersContainedInSack();
});



disableInterface();