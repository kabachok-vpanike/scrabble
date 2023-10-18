mapPreset = {
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


function handleDragStart(e) {
    this.style.opacity = '0.5';

    e.dataTransfer.setData("text", e.target.id);
    console.log(e.target)
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
    //console.log(e.target.childElementCount);
    console.log(e.target);
    if (e.target.className === 'p') { return; } // that's NOT how to do this check
    if ([...e.target.classList].includes('tile') && e.target.parentNode.className === 'letters') {
        console.log("e2qeda")
        e.target.parentNode.appendChild(document.getElementById(data));
        document.getElementById(data).classList.remove('fieldTile');
        document.getElementById(data).classList.add('availableTile');
        document.getElementById(data).children[0].children[0].classList.add('letterScore');
        document.getElementById(data).children[0].children[0].classList.remove('letterScoreSmaller');
        //document.getElementById(data).style.position = "";
        //document.getElementById(data).style.width = "40px";
        //document.getElementById(data).style.height = "40px";
        //document.getElementById(data).style.lineHeight = "40px";
    }

    else if (e.target != document.getElementById(data) && (e.target.childElementCount === 1 || e.target.className === 'letters' || e.target.childElementCount === 2 && e.target.classList[0].className in ['cell2L', 'cell2W', 'cell3L', 'cell3W']) && ![...e.target.classList].includes('tile')) {
        console.log(e.target)
        if (e.target.className === 'letters') {
            document.getElementById(data).classList.remove('fieldTile');
            document.getElementById(data).classList.add('availableTile');
            document.getElementById(data).children[0].children[0].classList.add('letterScore');
            document.getElementById(data).children[0].children[0].classList.remove('letterScoreSmaller');
            //document.getElementById(data).style.position = "";
            //document.getElementById(data).style.width = "40px";
            //document.getElementById(data).style.height = "40px";
            //document.getElementById(data).style.lineHeight = "40px";
        }
        else {
            document.getElementById(data).classList.remove('availableTile');
            document.getElementById(data).classList.add('fieldTile');
            document.getElementById(data).children[0].children[0].classList.remove('letterScore');
            document.getElementById(data).children[0].children[0].classList.add('letterScoreSmaller');

            //  document.getElementById(data).style.position = "absolute";
            //document.getElementById(data).style.width = "32px";
            //document.getElementById(data).style.height = "32px";
            //document.getElementById(data).style.lineHeight = "32px";
        }
        console.log('Ziel: ', e.target);
        e.target.appendChild(document.getElementById(data));
        console.log('Ziel: ', e.target);
    }
    this.children[0].classList.remove('over')
    return false;
}

function handleDragLeave(e) {
    setTimeout(() =>  this.children[0].classList.remove('over'), 50);
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
    console.log(e.target.id);
    let tile = document.getElementById(e.target.id);
    let lettersSet = document.getElementById('lettersSet');
    tile.classList.remove('fieldTile');
    tile.classList.add('availableTile');
    tile.children[0].children[0].classList.add('letterScore');
    tile.children[0].children[0].classList.remove('letterScoreSmaller');
    lettersSet.appendChild(tile);

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

for (let i = 0; i < 7; i++) {
    let tile = document.createElement('div');
    let scoreDiv = document.createElement('div');
    scoreDiv.classList.add('letterScoreDiv');
    let score = document.createElement('p');
    score.classList.add('letterScore')
    score.textContent = `1${i}`;

    tile.id = `tile${i}`
    tile.innerText = String.fromCharCode(65 + i);;
    tile.classList.add('tile');
    tile.classList.add('availableTile')
    tile.draggable = 'true';
    scoreDiv.appendChild(score);
    tile.appendChild(scoreDiv);
    letters.appendChild(tile);
    tile.addEventListener('dragstart', handleDragStart);
    tile.addEventListener('dragend', handleDragEnd);
    tile.addEventListener('contextmenu', backToLettersSet);

}

for (let i = 0; i < 15; i++) {
    for (let j = 0; j < 15; j++) {
        let cell = document.createElement('div');
        let colorWithin = document.createElement('div');
        cell.classList.add('emptyCell');
        colorWithin.classList.add('colorWithin')
        cell.appendChild(colorWithin);
        field.appendChild(cell);
        field.addEventListener('contextmenu', (e) => e.preventDefault());
        cell.addEventListener('dragenter', handleDragEnter);
        cell.addEventListener('dragleave', handleDragLeave);
        cell.addEventListener('drop', handleDrop);
        cell.addEventListener('dragover', allowDrop);
        cell.addEventListener('contextmenu', (e) => e.preventDefault());

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
skipButton.classList.add('skipButton');
submitButton.classList.add('submitButton');
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
//document.body.appendChild(cell);


