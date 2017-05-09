//function pushes a random 1-100 number and date every second into array
//initializing a new variable to the return value of this function will provide you with the "stream" of data

function createStream() {
    function ranNum() {
        return Math.floor(Math.random() * 10);;
    }
    function newArray() {
        for (let i = 0; i < array.length; i += 1) {
            array.randNum = ranNum();
        }
    }

    let array = [
        { id: 0, randNum: 7 },
        { id: 1, randNum: 6 },
        { id: 2, randNum: 3 },
        { id: 3, randNum: 9 },
        { id: 4, randNum: 9 },
        { id: 5, randNum: 5 },
        { id: 6, randNum: 7 }];

    setInterval(newArray, 1000);

    return array;
}

exports.createStream = createStream;