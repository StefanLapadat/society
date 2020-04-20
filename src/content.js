let $ = require("jquery");

// let HumanGenome = require('./src/HumanGenome');
let Canvas = require('./src/Canvas');
// let HumanSpecificCanvas = require('./src/HumanSpecificCanvas');
let Field = require('./src/Field');
let FoodProducer = require('./src/FoodProducer');
let Human = require('./src/Human');

let util = require('./src/Util');


let numberOfHumans = 5;

let field = null;
// let humanProducer = null;
let foodProducer = null;
// let controlledHumanIndex = 0;
// let controlledHuman = null;

let canvas = null;
// let humanSpecificCanvas = null;


function main(){
    $(document).ready(function(){
        field = new Field(1331, 443, 5, 4, 1000, 1000, 40);
        foodProducer = new FoodProducer(field, 2, 150);
        canvas = new Canvas(field, 40);
        // humanSpecificCanvas = new HumanSpecificCanvas(field, 40, controlledHuman);

        addHumansToPlayground(field);
        initControlMenu();

        field.start();
        canvas.start();
        foodProducer.start();
        // humanSpecificCanvas.start();
    });
}

function addHumansToPlayground(playground){
    let humans = util.range(numberOfHumans).map(a => new Human(field));
    humans.forEach(a => playground.addObject('human', a, a.physicalProperties));

    // controlledHuman = humans[controlledHumanIndex];

    // controlledHuman.update = function(){ this.handleFood(); }
    // controlledHuman.moveIntention.acceleration = {x: 0, y: 0};
}

function initControlMenu(){
    function startStopSimulation(){
        field.toggle();
        foodProducer.toggle();
    }

    $(document).on("click", "#myCanvas", function(e){
        startStopSimulation();
    });

    // $(document).on('keydown', function(e){
    //     if(e.which == 73) { // i
    //         controlledHuman.moveIntention.acceleration = {x: 0, y: -3};
    //     }
    //     if(e.which == 74) { // j
    //         controlledHuman.moveIntention.acceleration = {x: -3, y: 0};
    //     }
    //     if(e.which == 75) { // k
    //         controlledHuman.moveIntention.acceleration = {x: 0, y: 3};
    //     }
    //     if(e.which == 76) { // l
    //         controlledHuman.moveIntention.acceleration = {x: 3, y: 0};
    //     }
    // });
}

main();

