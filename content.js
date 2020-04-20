var $ = require("jquery");

function range(n) {
    res = [];
    for(var i = 0; i<n; i++) res.push(i);
    return res;
}

function deepCopy(simpleObj){
    return JSON.parse(JSON.stringify(simpleObj));
}

function randomAcceleration(module){
    fi = Math.random() * 2 * Math.PI;

    return {
        x: module * Math.cos(fi),
        y: module * Math.sin(fi)
    };
}

var numberOfHumans = 5;
var controlledHumanIndex = 0;
var controlledHuman = null;
var accelearionModule = 3;
var livenessTreshold = 0;

playground = {
    width: 1331,
    height: 443,
    status: 'stopped',
    objects: [],
    maxHumanVelocity: 5,
    maxHumanAcceleration: 4,
    foodProducer: null,
    effectiveMoveIntention: function(coreObjMoveIntention, coreObjPhysicalProperties) {
        effectiveCoreObjMoveIntention = deepCopy(coreObjMoveIntention);
        coreObjPhysicalProperties = deepCopy(coreObjPhysicalProperties);

        if(coreObjPhysicalProperties.velocity.x > this.maxHumanVelocity) effectiveCoreObjMoveIntention.acceleration.x = Math.min(0, effectiveCoreObjMoveIntention.acceleration.x);
        if(coreObjPhysicalProperties.velocity.y > this.maxHumanVelocity) effectiveCoreObjMoveIntention.acceleration.y = Math.min(0, effectiveCoreObjMoveIntention.acceleration.y);
        if(coreObjPhysicalProperties.velocity.x < -this.maxHumanVelocity) effectiveCoreObjMoveIntention.acceleration.x = Math.max(0, effectiveCoreObjMoveIntention.acceleration.x);
        if(coreObjPhysicalProperties.velocity.y < -this.maxHumanVelocity) effectiveCoreObjMoveIntention.acceleration.y = Math.max(0, effectiveCoreObjMoveIntention.acceleration.y);

        return effectiveCoreObjMoveIntention;
    },
    calculateSnapshotFor: function(object){
        var nearHumans = this.objects.filter(a => a.type == 'human' && Math.hypot(
            a.physicalProperties.position.x - object.physicalProperties.position.x,
            a.physicalProperties.position.y - object.physicalProperties.position.y ) < 50);
        
        var nearFood = this.objects.filter(a => a.type == 'food' && Math.hypot(
            a.physicalProperties.position.x - object.physicalProperties.position.x,
            a.physicalProperties.position.y - object.physicalProperties.position.y ) < 50);
        
        var walls = [];

        if(Math.abs(object.physicalProperties.position.x - playground.width) < 40) walls.push(['right', Math.abs(object.physicalProperties.position.x - playground.width)]);
        if(Math.abs(object.physicalProperties.position.x) < 40) walls.push(['left', Math.abs(object.physicalProperties.position.x)]);
        if(Math.abs(object.physicalProperties.position.y - playground.height) < 40) walls.push(['down', Math.abs(object.physicalProperties.position.y - playground.height)]);
        if(Math.abs(object.physicalProperties.position.y) < 40) walls.push(['up', Math.abs(object.physicalProperties.position.y)]);

        return {
                humans: nearHumans.map(a => a.coreObject),
                food: nearFood.map(a => ({x: a.physicalProperties.position.x, y: a.physicalProperties.position.y})),
                walls: walls
            };
    },
    update: function(){
        this.objects.filter(a => a.type == 'human').forEach(a => {
            coreObject = a.coreObject;
            
            coreObjMoveIntention = deepCopy(coreObject.moveIntention);
            coreObjPhysicalProperties = deepCopy(coreObject.physicalProperties);

            effectiveCoreObjMoveIntention = this.effectiveMoveIntention(coreObjMoveIntention, coreObjPhysicalProperties);


            coreObjPhysicalProperties.acceleration = deepCopy(effectiveCoreObjMoveIntention.acceleration);

            coreObjPhysicalProperties.position.x += coreObjPhysicalProperties.velocity.x;
            coreObjPhysicalProperties.position.y += coreObjPhysicalProperties.velocity.y;

            coreObjPhysicalProperties.velocity.x += coreObjPhysicalProperties.acceleration.x;
            coreObjPhysicalProperties.velocity.y += coreObjPhysicalProperties.acceleration.y;

            if(coreObjPhysicalProperties.position.x < 0) coreObjPhysicalProperties.velocity.x = Math.abs(coreObjPhysicalProperties.velocity.x);
            if(coreObjPhysicalProperties.position.x > this.width) coreObjPhysicalProperties.velocity.x = -Math.abs(coreObjPhysicalProperties.velocity.x);
            if(coreObjPhysicalProperties.position.y < 0) coreObjPhysicalProperties.velocity.y = Math.abs(coreObjPhysicalProperties.velocity.y);
            if(coreObjPhysicalProperties.position.y > this.height) coreObjPhysicalProperties.velocity.y = -Math.abs(coreObjPhysicalProperties.velocity.y);


            if(coreObject.foodIntention && this.objects.some(b =>   b.type === 'food' && 
                                        b.physicalProperties.position.x === coreObject.foodIntention.x &&
                                        b.physicalProperties.position.y === coreObject.foodIntention.y)){
                                            coreObjPhysicalProperties.energy+=1;
                                            this.foodProducer.removeOnCoordinates(coreObject.foodIntention.x, coreObject.foodIntention.y);
                                        }

            coreObjPhysicalProperties.energy -= 0.05;
            a.physicalProperties = coreObjPhysicalProperties;

            coreObject.addEnvironmentSnapshot(this.calculateSnapshotFor(a));
            coreObject.setPhysicalProperties(a.physicalProperties);
        });
    },
    updatePeriod: 40,
    _stopTicket: null,
    start: function(){
        this.status = 'running';
        var that = this;
        this._stopTicket = setInterval(function(){
            that.update();
        }, this.updatePeriod)
        this.objects.filter(a => a.type == 'human').forEach(a => a.coreObject.start());
    },
    stop: function(){
        clearInterval(this._stopTicket);
        this.objects.filter(a => a.type == 'human').forEach(a => a.coreObject.stop());
        this.status = 'stopped';
    },
    toggle: function(){
        if(this.status == 'running') this.stop();
        else this.start();
    }
};

foodProducer = {
    food: [],
    meanNumOfPortionsPerPeriod: 2,
    maxPortionAge: 3000,
    playground: playground,
    start: function(){
        this.status = 'running';
        var that = this;
        this._stopTicket = setInterval(function(){
            that.update();
        }, this.updatePeriod);
    },
    stop: function(){
        clearInterval(this._stopTicket);
        this.status = 'stopped';
    },
    toggle: function(){
        if(this.status == 'running') this.stop();
        else this.start();
    },
    update: function(){
        this.incrementAgeOnPortions();
        this.removeOldPortions();
        this.addNewPortions();
    },
    addNewPortions: function(){
        numNewPortions = Math.floor(Math.random() * 2 * this.meanNumOfPortionsPerPeriod);
        for(var i = 0; i<numNewPortions; i++){
            position = {
                x: Math.floor(Math.random() * this.playground.width),
                y: Math.floor(Math.random() * this.playground.height)
            };
            newPortion = {age: 0, position: position};
            this.food.push(newPortion);
            this.playground.objects.push({type: 'food', physicalProperties: {position: position}, coreObject: newPortion});
        }
    },
    removeOnCoordinates: function(x, y){
        this.food = this.food.filter(a => a.position.x != x || a.position.y != y);
        this.playground.objects = this.playground.objects.filter(a => a.type != 'food' || (a.type == 'food' && (a.physicalProperties.position.x != x || a.physicalProperties.position.y !=y)));
    },
    incrementAgeOnPortions: function(){
        this.food.forEach(a => a.age++);
    },
    removeOldPortions: function(){
        var that = this;
        this.food = this.food.filter(a => a.age < that.maxPortionAge);
        this.playground.objects = this.playground.objects.filter(a => a.type != 'food' || (a.type == 'food' && a.coreObject.age < that.maxPortionAge));
    },
    _stopTicket: null,
    updatePeriod: 150,
    status: null
}

playground.foodProducer = foodProducer;

canvas = {
    $elem: null,
    init: function($elem){
        this.$elem = $elem;
    },
    playground: playground,
    clear: function(){
        let c = document.getElementById("myCanvas");
        let ctx = c.getContext("2d");
        ctx.clearRect(0, 0, c.width, c.height);
    },
    drawPlayground: function(){
        this.clear();
        this.playground.objects.forEach(element => {
            if(element.type=='human'){
                var canvas = document.getElementById("myCanvas");
                var context = canvas.getContext("2d");
                context.beginPath();
                context.arc(element.physicalProperties.position.x, element.physicalProperties.position.y, 30, 0, Math.PI * 2, false);
                context.fillStyle = "red";
                context.fill();
                context.fillStyle = "black";
                context.font = "20px Georgia";
                context.fillText(Math.floor(Math.round(element.physicalProperties.energy * 10) / 10), element.physicalProperties.position.x - 12, element.physicalProperties.position.y + 8);
            }
            if(element.type=='food'){
                var canvas = document.getElementById("myCanvas");
                var context = canvas.getContext("2d");
                context.beginPath();
                
                context.arc(element.physicalProperties.position.x, element.physicalProperties.position.y, 10, 0, Math.PI * 2, false);
                context.fillStyle = "green";
                context.fill();
            }
        });
    },
    update: function(){
        this.drawPlayground();
    },
    updatePeriod: 40,
    start: function(){
        var that = this;
        setInterval(function(){
            that.update();
        }, this.updatePeriod)
    }
}

humanSpecificCanvas = {
    clear: function(){
        let c = document.getElementById("human-specific-canvas");
        let ctx = c.getContext("2d");
        ctx.clearRect(0, 0, c.width, c.height);
    },
    playground,
    redraw: function(){
        this.clear();
        human = this.playground.objects.filter(a => a.type === 'human')[controlledHumanIndex];

        position = human.physicalProperties.position;

        let destCanvas = document.getElementById("human-specific-canvas");
        let destCtx = destCanvas.getContext("2d");
        let srcCanvas = document.getElementById("myCanvas");

        proportion = srcCanvas.height / srcCanvas.width;
        shownWidth = srcCanvas.width / 2; 
        shownHeight = proportion * shownWidth;

        destCtx.drawImage(document.getElementById("myCanvas"), position.x - shownWidth/2, position.y - shownHeight/2, shownWidth, shownHeight, 0, 0, destCanvas.width, destCanvas.height);
    },
    update: function(){
        this.redraw();
    },
    updatePeriod: 40,
    start: function(){
        var that = this;
        setInterval(function(){
            that.update();
        }, this.updatePeriod)
    }
}

function init(){
    initControlMenu();
    addHumansToPlayground(playground);
    playground.start();
    canvas.start();
    humanSpecificCanvas.start();
    foodProducer.start();
}

class HumanGenome{

    static mix(a, b) {
        var res = new HumanGenome();
        
        return res;
      }
}

function addHumansToPlayground(playground){
    var human = {
        playground: playground,
        setPhysicalProperties: function(physicalProperties){
            this.physicalProperties = physicalProperties;
        },
        addEnvironmentSnapshot: function(snapshot){
            this.environmentSnapshots.push(snapshot);
        },
        _stopTicket: null,
        desireToStopMoving: false,
        desireToStartMoving: false,
        updatePeriod: 40,
        handleConversation: function(){
            if(this.environmentSnapshots[this.environmentSnapshots.length - 1].humans.length > 1 && Date.now() - this.lastStopTime > 20000 && this.stayingStatus != 'stopped') {
                this.desireToStopMoving = true; this.desireToStartMoving = false; this.lastStopTime = Date.now(); this.stayingStatus = 'stopped' }
            if(Date.now() - this.lastStopTime > 2000 && this.stayingStatus == 'stopped') {
                this.desireToStopMoving = false; this.desireToStartMoving = true; this.stayingStatus = 'running'; }
            
            if(this.desireToStopMoving){
                this.moveIntention.acceleration = {x: -this.physicalProperties.velocity.x / 5, y: -this.physicalProperties.velocity.y / 5} }
            if(this.desireToStartMoving){
                this.moveIntention.acceleration = randomAcceleration(accelearionModule);
                this.desireToStartMoving = false;
            }
        },
        handleFood: function(){
            if(this.environmentSnapshots[this.environmentSnapshots.length - 1].food.length > 0){
                this.foodIntention = {
                    x: this.environmentSnapshots[this.environmentSnapshots.length - 1].food[0].x,
                    y: this.environmentSnapshots[this.environmentSnapshots.length - 1].food[0].y,
                }
            } else {
                this.foodIntention = null;
            }
        },
        handleWalls: function(){
            if(this.environmentSnapshots[this.environmentSnapshots.length - 1].walls.some(a => a[0] == 'left'))
                this.moveIntention.acceleration.x = Math.abs(this.moveIntention.acceleration.x);
            if(this.environmentSnapshots[this.environmentSnapshots.length - 1].walls.some(a => a[0] == 'right'))
                this.moveIntention.acceleration.x = -Math.abs(this.moveIntention.acceleration.x);
            if(this.environmentSnapshots[this.environmentSnapshots.length - 1].walls.some(a => a[0] == 'up'))
                this.moveIntention.acceleration.y = Math.abs(this.moveIntention.acceleration.y);
            if(this.environmentSnapshots[this.environmentSnapshots.length - 1].walls.some(a => a[0] == 'down'))
                this.moveIntention.acceleration.y = -Math.abs(this.moveIntention.acceleration.y);
        },
        update: function(){
            this.handleWalls();
            this.handleConversation();
            this.handleFood(); 
        },
        status: null,
        start: function(){
            this.status = 'running';
            var that = this;
            this._stopTicket = setInterval(function(){
                that.update();
            }, this.updatePeriod)
        },
        stop: function(){
            clearInterval(this._stopTicket);
            this.status = 'stopped';
        }
    }

    var humans = range(numberOfHumans).map(a => Object.create(human));

    humans.forEach(a => {
        a.physicalProperties = {
            energy: 100,
            position: {
                x: 0,
                y: 0
            },
            velocity: {
                x: 0,
                y: 0
            },
            acceleration: {
                x: 0,
                y: 0
            }
        };
        a.stayingStatus = null;
        a.moveIntention = {};
        a.lastStopTime = null;
        a.lastStopTime = 0;
        a.moveIntention.acceleration = randomAcceleration(accelearionModule);
        a.environmentSnapshots = [];

    });

    humans.map(a => playground.objects.push({type: 'human', coreObject: a, physicalProperties: deepCopy(a.physicalProperties)}));

    humans[controlledHumanIndex].update = function(){ this.handleFood(); }
    humans[controlledHumanIndex].moveIntention.acceleration = {x: 0, y: 0};
    controlledHuman = humans[controlledHumanIndex];
}

function initControlMenu(){
    function startStopSimulation(){
        playground.toggle();
        foodProducer.toggle();
    }

    $(document).on("click", "#myCanvas", function(e){
        startStopSimulation();
    });

    $(document).on('keydown', function(e){
        if(e.which == 73) { // i
            controlledHuman.moveIntention.acceleration = {x: 0, y: -3};
        }
        if(e.which == 74) { // j
            controlledHuman.moveIntention.acceleration = {x: -3, y: 0};
        }
        if(e.which == 75) { // k
            controlledHuman.moveIntention.acceleration = {x: 0, y: 3};
        }
        if(e.which == 76) { // l
            controlledHuman.moveIntention.acceleration = {x: 3, y: 0};
        }
    });
}

$(document).ready(function(){
    init();
});

/*
    TODO 1: Check out how human can interact with environment in a bit more realistic way. Human needs to express wish to go somewhere, and than that wish can be either accepted or not.

        SUB_TODO 1: Collision detection and bouncing implementation: DISMISSED AS NOT IMPORTANT ATM. 

        SUB_TODO 2: Human needs to be updated with its environment in some form (to be able to 'see' what is around him). PROTOTYPE DONE.

        SUB_TODO 3: Human needs to be avare of time somehow; This will enable him to organize the tasks that take time, so to 'schedule' something.

        SUB_TODO 4: Make human active object. DONE.

    
    TODO 2: Implement food in the playground and energy of the human. Maybe think about human mass and different qualities of food - lowering the level of abstraction. So, when you see a human that has a lot of energy, you could perhaps think that he has recently been somewhere where there's some food? Am I right? I guess so. BUT, BUT, BUT! What we absolutely have to avoid is directly coding into the program something like 'If you see someone with a big smile on his face, then, go around this area and search for food'. It should be more dynamic, more statistically oriented, like this: 'try to find events that are statistically corelated with finding of food; If you happen to find that bumping into an energized person is statistically linked to finding food, then you should more intensively search the area around the place where you see energized person'. Or, maybe even better 'If you find that there is a correlation between energized persons and food proximity, you should just follow that person, because it means that that person is good at finding food.' Now the questions arise: 

        1) How and when is the correlation between different events generated? Is it given before runtime or is it only collected at runtime, or is it both? And is it constantly updated during the life of an agent, or is there some point in time where we say, ok - now that's it, we're done with learning this thingy.

        2) What is learned and what is given? That is really important question.

    So ok, again, I would love to train these people so that they can make smart decisions on where to search for food. So, given the same starting positions and the same 'visual systems', some strategies of finding food are better than others. I would like to try and find some of the better strategies and I would also like to try and generalize found procedures.
    






    TODO 3: Make human a 'class' of its own. And also the playground etc. This is not all that important right now.


    TODO 4: Check out the scaling of canvas and playground fitting. This is not all that important right now.
*/

/*
    Comment 1: So, ok, what did I create over here? It looks pretty much like agar.io, it's in principle a game.. not much other than that. And now I would like to create a bot for it, am I right :D Sooo, nothing special, still!! :D 

    Comment 2: I think that the right strategy for playing this game strongly depends on all the parameters of the game. The playground dimension, number of humans in the game, frequency with which we generate and remove food from the playground, can humans fight for the teritory, do humans know coordinates of themselves (i.e. how good is their orientation in space), how much do they see around themselves etc. All in all, strategy for playing the game depends on the rules of the game :D 
*/

/*
    So, what do we want in this implementation? Well, we want those who have low energy to die.. That is one thing.
    Another thing is that we want to measure the successfullness of individuals so that we can keep track over the course of time, how we are improving.
    We also very much want simulation to keep going - that is, we want some people to remain alive. So, we will put plenty of food on the field, but not too much, because, someone has to die and leave place for more efficient to live :( :) 
    But we also don't want too much people to overcrowd the field. So, mating will be done only if there aren't too many individuals on the field.

    And each human needs to have a genetic sequence that represents his strategy for playing the game. 
*/

