const { parse } = require('csv-parse');
const fs = require('fs');

const fileName = '/home/lev/scrabble/public/nouns.csv';

let records = [];
// Initialize the parser
const parser = parse({
    delimiter: '\t',
    relax_quotes: true
});
// Use the readable stream api to consume records
parser.on('readable', function () {
    let record;
    while ((record = parser.read()) !== null) {
        records.push(record[0]);
        // console.log(record[0]);
    }
});
// Catch any error
parser.on('error', function (err) {
    console.error(err.message);
});

parser.on('end', function () {
    // console.log(records);
    records = records.map(word => word.toString().toLowerCase())
});

function checkIfWordsExists(word) {
    // console.log(records, word);
    return records.includes(word.toLowerCase());
}

fs.createReadStream(fileName).pipe(parser);

// exports.checkIfWordsExists = checkIfWordsExists;
module.exports = checkIfWordsExists