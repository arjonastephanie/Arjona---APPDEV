// base number = 2

let base_number = 2;

//Problem set 1: Grade Calculator
function calculateGrade(score){
    if (score >=90 && score <=100){
        return 'A';
    }else if (score >=80){
        return 'B';
    }else if (score >=70){
        return 'C';
    }else if (score >=60){
        return 'D';
    }else if (score >=0){
        return 'F';
    }
    return score;
}

//Problem set 2: Star Pattern
function showStars(rows){
    let pattern = '';
    for (let i=1; i<=rows; i++){
        let line = '';
        for (let j=1; j<=i; j++){
            line += '*';
        }  pattern += line + '\n';
    } return pattern;
}
//Problem set 3: Prime Number Checker
function isPrime(n){
    if (n <= 1) return false;
    for (let i=2; i<= Math.sqrt(n); i++){
        if (n % i === 0) return false;
    }
    return true;
}

//Problem set 4: Multiplication Table
function multiplicationTable(n){
    let table = [];
    for (let i=1; i<=10; i++){
        table.push(`${n} x ${i} = ${n*i}`);
    }
    return table;
}

//problem 1
let score = base_number * 10 + 5;
console.log("Grade: ", calculateGrade(score));

//problem 2
let rows = base_number + 2;
console.log("Star Pattern:\n", showStars(rows));

//problem 3
let primeCheck = base_number + 10;
console.log(primeCheck, "is prime?", isPrime(primeCheck));

//problem 4
let table = multiplicationTable(base_number);
console.log("Multiplication Table for", base_number);
console.log(table.join('\n'));

