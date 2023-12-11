const checkIfWordsExists = require('./parse.js')

class GameCell {

    constructor(bonus, letter, fresh) {
        this.bonus = bonus;
        this.letter = letter;
        this.fresh = false;
    }

}

class GameLogic {

    constructor(fieldSize, fieldInit, numberOfUsers, lettersInSack, lettersToScore) {
        this.pendingWords = [];
        this.firstMove = true;
        this.possibleScore = 0;
        this.currentPlayer = 0;
        this.fieldSize = fieldSize;
        this.numberOfUsers = numberOfUsers;
        this.field = new Map();
        this.lettersInSack = lettersInSack;
        this.lettersToScore = lettersToScore;
        this.words = new Set();
        this.tilesOnField = new Map();
        this.scores = Array(numberOfUsers).fill(0);
        for (let i = 0; i < fieldSize; i++) {
            for (let j = 0; j < fieldSize; j++) {
                let position = `${i} ${j}`;
                this.field.set(position, new GameCell(fieldInit[position]));
            }
        }
        //   console.log(this.field);
    }

    nextPlayer() {
        if (this.firstMove) {
            this.firstMove = false;
        }
        this.currentPlayer++;
        this.currentPlayer %= this.numberOfUsers;
        return this.currentPlayer;
    }

    getCurrentPlayer() {
        return this.currentPlayer;
    }

    isOnlyNew() {
        for (let i = 0; i < this.fieldSize; i++) {
            for (let j = 0; j < this.fieldSize; j++) {
                let position = `${i} ${j}`;
                if (this.field.get(position).letter && !this.field.get(position).fresh) {
                    return false;
                }

            }
        }
        return true;
    }

    deleteLetter(position) {
        let cell = this.field.get(position);
        cell.letter = undefined;
        cell.fresh = false;
        this.field.set(position, cell);
    }

    setLetter(position, letter) {
        let cell = this.field.get(position);
        cell.letter = letter;
        cell.fresh = true;
        this.field.set(position, cell);
    }

    countFreshCells() {
        console.log('before clearing', this.field);
        let res = 0;
        for (let i = 0; i < this.fieldSize; i++) {
            for (let j = 0; j < this.fieldSize; j++) {
                let position = `${i} ${j}`;
                res += this.field.get(position).fresh && this.field.get(position).letter ? 1 : 0;
                if (this.field.get(position).fresh) {
                    console.log('letter', this.field.get(position).letter);
                }
            }
        }
        return res;
    }

    makeAllLettersOnFieldOld() {
        for (let i = 0; i < this.fieldSize; i++) {
            for (let j = 0; j < this.fieldSize; j++) {
                let position = `${i} ${j}`;
                let cell = this.field.get(position);
                if (cell.letter) {
                    cell.fresh = false;
                    console.log(cell.letter + ' now old');
                }
                this.field.set(position, cell);
            }
        }
        console.log('after clearing', this.field);
    }

    checkDirection(idx, direction) {
        let connected = true;
        let freshies = 0;
        let metFresh = false;
        let allFreshies = this.countFreshCells();
        for (let k = 0; k < this.fieldSize; k++) {
            let positionSlide = direction === 'horizontal' ? `${idx} ${k}` : `${k} ${idx}`;
            let currentCell = this.field.get(positionSlide);
            freshies += currentCell.letter && currentCell.fresh ? 1 : 0;
            let positionPrev;
            let positionNext;
            if (k - 1 >= 0) {
                positionPrev = direction === 'horizontal' ? `${idx} ${k - 1}` : `${k - 1} ${idx}`;
            }
            if (k + 1 < this.fieldSize) {
                positionNext = direction === 'horizontal' ? `${idx} ${k + 1}` : `${k + 1} ${idx}`;
            }
            //   console.log('addfsp', positionPrev
            //     && this.field.get(positionPrev).letter !== undefined, positionNext
            // && this.field.get(positionNext).letter !== undefined);

            if (currentCell.letter && currentCell.fresh && !(positionPrev
                && this.field.get(positionPrev).letter || positionNext
                && this.field.get(positionNext).letter)) {
                connected = false;
            }


            if (!currentCell.letter) {
                if (metFresh && allFreshies !== 0) {
                    connected = false;
                }
            }

            if (currentCell.letter && currentCell.fresh) {
                metFresh = true
                allFreshies--;
            }
        }
        //   console.log(maxFreshInd - minFreshInd + 1);

        //    console.log('\n\n')
        return [connected, freshies];
    }

    checkLineOneAndOnly() {
        for (let i = 0; i < this.fieldSize; i++) {
            for (let j = 0; j < this.fieldSize; j++) {
                let position = `${i} ${j}`;
                if (this.field.get(position).fresh) {
                    let [connectedHorizontal, freshiesHorizontal] = this.checkDirection(i, 'horizontal');
                    let [connectedVertical, freshiesVertical] = this.checkDirection(j, 'vertical');
                    //   console.log(connectedHorizontal, connectedVertical, freshiesHorizontal, freshiesVertical)
                    if (freshiesHorizontal > 1 && freshiesVertical > 1
                        || freshiesHorizontal + freshiesVertical - 1 !== this.countFreshCells()) {
                        console.log('first false', freshiesHorizontal, freshiesVertical, this.countFreshCells())
                        return false;
                    }
                    if (freshiesHorizontal > 1 && !connectedHorizontal || freshiesVertical > 1 && !connectedVertical) {
                        console.log('second false', freshiesHorizontal, connectedHorizontal, freshiesVertical, connectedVertical)
                        return false;
                    }
                }
            }
        }
        return true;
    }

    checkCoordinatesValidity(i, j) {
        return i >= 0 && j >= 0 && i < this.fieldSize && j < this.fieldSize;
    }

    checkIfNewTouchOld() {
        if (this.isOnlyNew()) {
            return true;
        }
        for (let i = 0; i < this.fieldSize; i++) {
            for (let j = 0; j < this.fieldSize; j++) {
                let position = `${i} ${j}`;
                for (let step of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
                    let neighbourI = i + step[0];
                    let neighbourJ = j + step[1];
                    let neighbourCoordinates = `${neighbourI} ${neighbourJ}`
                    if (this.checkCoordinatesValidity(neighbourI, neighbourJ)
                        && this.field.get(position).letter
                        && this.field.get(position).fresh
                        && this.field.get(neighbourCoordinates).letter
                        && !this.field.get(neighbourCoordinates).fresh) {
                        return true;
                    }
                }

            }
        }
        return false;
    }

    checkIfTouchCenter() {
        let center = Math.floor(this.fieldSize / 2);
        return this.field.get(`${center} ${center}`).letter !== undefined;
    }

    checkIfValidField() {
        let checkIfTouchCenter = this.checkIfTouchCenter();
        let checkIfValidField = this.checkLineOneAndOnly();
        let checkIfValidPlacement = this.checkIfNewTouchOld();
        let checkIfWordsCorrect = this.findVerticalWords();

        console.log(checkIfValidField, checkIfValidPlacement, checkIfWordsCorrect, checkIfTouchCenter, this.firstMove);
        if (checkIfValidField && checkIfValidPlacement && checkIfWordsCorrect && (!this.firstMove || checkIfTouchCenter)) {
            this.scores[this.currentPlayer] += this.possibleScore;
            this.pendingWords.forEach(item => this.words.add(item.word));
        }
        else {
            this.possibleScore = 0;
            this.pendingWords = [];
        }
        return checkIfValidField && checkIfValidPlacement && checkIfWordsCorrect && (!this.firstMove || checkIfTouchCenter);
    }

    getCell(i, j) {
        let position = `${i} ${j}`;
        return this.field.get(position);
    }

    size() {
        return this.fieldSize;
    }

    /* setLetterForChange(letterForChange) {
         this.letterForChange = letterForChange;
     }*/

    findFromTopDown(startInd, direction) {
        let slideInd = 0;
        let wordsFound = [];
        while (slideInd + 1 < this.fieldSize) {
            let position = direction === 'vertical' ? `${slideInd} ${startInd}` : `${startInd} ${slideInd}`;
            let nextPosition = direction === 'vertical' ? `${slideInd + 1} ${startInd}` : `${startInd} ${slideInd + 1}`;
            while (this.checkCoordinatesValidity(slideInd + 1, startInd) && !(this.field.get(position).letter && this.field.get(nextPosition).letter)) {
                slideInd++;
                position = direction === 'vertical' ? `${slideInd} ${startInd}` : `${startInd} ${slideInd}`;
                nextPosition = direction === 'vertical' ? `${slideInd + 1} ${startInd}` : `${startInd} ${slideInd + 1}`;
            }
            if (this.checkCoordinatesValidity(slideInd + 1, startInd)) {
                let word = this.field.get(position).letter;
                let bonusForLetter = this.field.get(position).bonus === '2L' ? 2 : this.field.get(position).bonus === '3L' ? 3 : 1;
                let wordScore = this.lettersToScore[this.field.get(position).letter] * bonusForLetter;
                while (this.checkCoordinatesValidity(slideInd + 1, startInd) && this.field.get(nextPosition).letter) {
                    let bonusForLetter = this.field.get(nextPosition).bonus === '2L' ? 2 : this.field.get(nextPosition).bonus === '3L' ? 3 : 1;
                    word += this.field.get(nextPosition).letter;
                    wordScore += this.lettersToScore[this.field.get(nextPosition).letter] * bonusForLetter;
                    slideInd++;
                    nextPosition = direction === 'vertical' ? `${slideInd + 1} ${startInd}` : `${startInd} ${slideInd + 1}`;
                }
                let bonusForWord = this.field.get(position).bonus === '2W' ? 2 : this.field.get(position).bonus === '3W' ? 3 : 1;
                wordScore = wordScore * bonusForWord;
                nextPosition = direction === 'vertical' ? `${slideInd} ${startInd}` : `${startInd} ${slideInd}`;
                wordsFound.push({ word, wordScore });
            }
        }
        return wordsFound;
    }

    findVerticalWords() {
        let allTheWords = new Set();
        for (let j = 0; j < this.fieldSize; j++) {
            let i = 0;
            // while (i < this.fieldSize) {
            let wordsFound = [...this.findFromTopDown(j, 'horizontal'), ...this.findFromTopDown(j, 'vertical')];
            console.log('words found', wordsFound);
            wordsFound.forEach(word => allTheWords.add(word));
            // allTheWords.push(...wordsFound)

            // console.log(startWord, endWord);
            //  }


            // if (!this.checkCoordinatesValidity(i + 1, j)) continue;
            //  console.log(position, nextPosition);
            /* if (this.field.get(position).letter && this.field.get(nextPosition).letter) {
                 while (this.checkCoordinatesValidity(i + 1, j) && this.field.get(nextPosition).letter) {
                     i++;
                     nextPosition = `${ i + 1 } ${ j } `;
                 }
                 console.log(position, nextPosition);
             }*/
        }
        // let newWords = [];
        for (let item of allTheWords) {
            let word = item.word;
            let wordScore = item.wordScore;
            console.log(word);
            if (!this.words.has(word)) {
                // newWords.push({ word, wordScore });
                this.pendingWords.push({ word, wordScore });
                //   this.scores[this.currentPlayer] += score;
                this.possibleScore += wordScore;
                // this.words.add(word);
            }
        }
        console.log(this.pendingWords);
        if (!this.pendingWords.some(item => checkIfWordsExists(item.word) === false) && this.pendingWords.length > 0) {

            console.log('accepted')
            return true;
        }
        if (this.pendingWords.some(item => checkIfWordsExists(item.word) === false))
            console.log('word not found')
        if (this.pendingWords.length === 0)
            console.log('zero word found')
        return false;

        /*

        let wordPanel = document.getElementById('wordsPlayed');
        for (let wordText of newWords) {
            let listElement = document.createElement('li');
            let wordInPanel = document.createElement('span');
            wordInPanel.innerText = wordText;
            wordInPanel.classList.add('wordItem');
            listElement.append(wordInPanel)
            wordPanel.appendChild(listElement);
        }
        */
    }
    getCurrentGamelogic() {

    }

    randomSackLetter() {
        let letters = Object.entries(this.lettersInSack).filter(([letter, quantity]) => quantity > 0);
        let randomLetter = letters[Math.floor(Math.random() * letters.length)][0];
        this.lettersInSack[randomLetter]--;
        //  console.log(randomLetter);
        return randomLetter;
    }
    /*
    updateField() {
        for (let i = 0; i < this.size(); i++) {
            for (let j = 0; j < this.size(); j++) {
                if (this.getCell(i, j).letter && !this.getCell(i, j).fresh) {
                    let tile = this.tilesOnField.get(`${i} ${j}`);
                    tile.style.backgroundColor = "#53624E";
                    tile.style.color = "#EDF1D6";
                    tile.setAttribute('draggable', 'false');
                    tile.style.pointerEvents = 'none';
                    tile.id = '';
                }

            }
        }
    }*/
}

class User {

    constructor() {
        this.score = 0;
    }

}

exports.GameLogic = GameLogic;
