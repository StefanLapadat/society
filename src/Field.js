class Field{
    constructor(width, height, maxHumanVelocity, maxHumanAcceleration, maxPortionAge, maxHumanAge, updatePeriod){
        this.width = width;
        this.height = height;
        this.status = 'stopped';
        this.objects = [];
        this.maxHumanVelocity = maxHumanVelocity;
        this.maxHumanAcceleration = maxHumanAcceleration;
        this.maxPortionAge = maxPortionAge;
        this.maxHumanAge = maxHumanAge;
        this.updatePeriod = updatePeriod;
        this.stopTicket = null;
    }

    addObject(type, coreObject, physicalProperties){
        if(type === 'human'){
            this.objects.push({
                type: 'human',
                coreObject: coreObject,
                physicalProperties: util.deepCopy(physicalProperties)
            })
        }
        else if (type === 'food'){
            this.objects.push({
                type: 'food',
                coreObject: coreObject,
                physicalProperties: util.deepCopy(physicalProperties)
            })
        }
    }

    effectiveMoveIntention(coreObjMoveIntention, coreObjPhysicalProperties) {
        let effectiveCoreObjMoveIntention = util.deepCopy(coreObjMoveIntention);
        coreObjPhysicalProperties = util.deepCopy(coreObjPhysicalProperties);

        if(coreObjPhysicalProperties.velocity.x > this.maxHumanVelocity) effectiveCoreObjMoveIntention.acceleration.x = Math.min(0, effectiveCoreObjMoveIntention.acceleration.x);
        if(coreObjPhysicalProperties.velocity.y > this.maxHumanVelocity) effectiveCoreObjMoveIntention.acceleration.y = Math.min(0, effectiveCoreObjMoveIntention.acceleration.y);
        if(coreObjPhysicalProperties.velocity.x < -this.maxHumanVelocity) effectiveCoreObjMoveIntention.acceleration.x = Math.max(0, effectiveCoreObjMoveIntention.acceleration.x);
        if(coreObjPhysicalProperties.velocity.y < -this.maxHumanVelocity) effectiveCoreObjMoveIntention.acceleration.y = Math.max(0, effectiveCoreObjMoveIntention.acceleration.y);

        return effectiveCoreObjMoveIntention;
    }

    calculateSnapshotFor(object){
        let nearHumans = this.objects.filter(a => a.type == 'human' && Math.hypot(
            a.physicalProperties.position.x - object.physicalProperties.position.x,
            a.physicalProperties.position.y - object.physicalProperties.position.y ) < 50);
        
        let nearFood = this.objects.filter(a => a.type == 'food' && Math.hypot(
            a.physicalProperties.position.x - object.physicalProperties.position.x,
            a.physicalProperties.position.y - object.physicalProperties.position.y ) < 50);
        
        let walls = [];

        if(Math.abs(object.physicalProperties.position.x - this.width) < 40) walls.push(['right', Math.abs(object.physicalProperties.position.x - this.width)]);
        if(Math.abs(object.physicalProperties.position.x) < 40) walls.push(['left', Math.abs(object.physicalProperties.position.x)]);
        if(Math.abs(object.physicalProperties.position.y - this.height) < 40) walls.push(['down', Math.abs(object.physicalProperties.position.y - this.height)]);
        if(Math.abs(object.physicalProperties.position.y) < 40) walls.push(['up', Math.abs(object.physicalProperties.position.y)]);

        return {
                humans: nearHumans.map(a => a.coreObject),
                food: nearFood.map(a => ({x: a.physicalProperties.position.x, y: a.physicalProperties.position.y})),
                walls: walls
            };
    }

    update(){
        this.incrementAgeOnAllObjects();
        this.killOldAndWeak();
        let that = this;
        this.objects.filter(a => a.type == 'human').forEach(a => {
            let coreObject = a.coreObject;
            
            let coreObjMoveIntention = util.deepCopy(coreObject.moveIntention);
            let coreObjPhysicalProperties = util.deepCopy(coreObject.physicalProperties);

            let effectiveCoreObjMoveIntention = this.effectiveMoveIntention(coreObjMoveIntention, coreObjPhysicalProperties);


            coreObjPhysicalProperties.acceleration = util.deepCopy(effectiveCoreObjMoveIntention.acceleration);

            coreObjPhysicalProperties.position.x += coreObjPhysicalProperties.velocity.x;
            coreObjPhysicalProperties.position.y += coreObjPhysicalProperties.velocity.y;

            coreObjPhysicalProperties.velocity.x += coreObjPhysicalProperties.acceleration.x;
            coreObjPhysicalProperties.velocity.y += coreObjPhysicalProperties.acceleration.y;

            if(coreObjPhysicalProperties.position.x < 0) coreObjPhysicalProperties.velocity.x = Math.abs(coreObjPhysicalProperties.velocity.x);
            if(coreObjPhysicalProperties.position.x > this.width) coreObjPhysicalProperties.velocity.x = -Math.abs(coreObjPhysicalProperties.velocity.x);
            if(coreObjPhysicalProperties.position.y < 0) coreObjPhysicalProperties.velocity.y = Math.abs(coreObjPhysicalProperties.velocity.y);
            if(coreObjPhysicalProperties.position.y > this.height) coreObjPhysicalProperties.velocity.y = -Math.abs(coreObjPhysicalProperties.velocity.y);


            if(coreObject.foodIntention && that.objects.some(b =>   b.type === 'food' && 
                                        b.physicalProperties.position.x === coreObject.foodIntention.x &&
                                        b.physicalProperties.position.y === coreObject.foodIntention.y)){
                                            coreObjPhysicalProperties.energy+=1;
                                            that.removeFoodOnCoordinates(coreObject.foodIntention.x, coreObject.foodIntention.y);
                                        }

            coreObjPhysicalProperties.energy -= 0.05;
            a.physicalProperties = coreObjPhysicalProperties;

            coreObject.addEnvironmentSnapshot(this.calculateSnapshotFor(a));
            coreObject.setPhysicalProperties(a.physicalProperties);
        });
    }

    incrementAgeOnAllObjects(){
        this.objects.forEach(a => a.physicalProperties.age++);
    }

    killOldAndWeak(){
        let that = this;
        this.objects = this.objects.filter(a => (a.type == 'food' && a.physicalProperties.age < that.maxPortionAge) ||
                                                (a.type == 'human' && a.physicalProperties.age < that.maxHumanAge)
        );
    }

    removeFoodOnCoordinates(x, y){
        this.objects = this.objects.filter(a => a.type != 'food' || (a.type == 'food' && (a.physicalProperties.position.x != x || a.physicalProperties.position.y !=y)));
    }

    start(){
        this.status = 'running';
        let that = this;
        this.stopTicket = setInterval(function(){
            that.update();
        }, this.updatePeriod)
        this.objects.filter(a => a.type == 'human').forEach(a => a.coreObject.start());
    }

    stop(){
        clearInterval(this.stopTicket);
        this.objects.filter(a => a.type == 'human').forEach(a => a.coreObject.stop());
        this.status = 'stopped';
    }

    toggle(){
        if(this.status == 'running') this.stop();
        else this.start();
    }
}

module.exports = Field;
