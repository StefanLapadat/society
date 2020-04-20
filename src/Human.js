class Human{
    constructor(field){
        this.field = field;
        this.physicalProperties = {
            energy: 100,
            age: 0,
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
        this.stayingStatus = null;
        this.moveIntention = {};
        this.lastStopTime = null;
        this.lastStopTime = 0;
        this.accelearionModule = 3;
        this.moveIntention.acceleration = util.random2DVector(this.accelearionModule);
        this.environmentSnapshots = [];
        this.stopTicket = null;
        this.desireToStopMoving = false;
        this.desireToStartMoving = false;
        this.updatePeriod = 40;
    }

    start(){
        let that = this;
        this.stopTicket = setInterval(function(){
            that.update();
        }, this.updatePeriod)
        this.status = 'running';
    }

    stop(){
        clearInterval(this.stopTicket);
        this.status = 'stopped';
    }

    update(){
        this.handleWalls();
        this.handleConversation();
        this.handleFood();
        this.handleMating();
    }

    handleWalls(){
        if(this.environmentSnapshots[this.environmentSnapshots.length - 1].walls.some(a => a[0] == 'left'))
            this.moveIntention.acceleration.x = Math.abs(this.moveIntention.acceleration.x);
        if(this.environmentSnapshots[this.environmentSnapshots.length - 1].walls.some(a => a[0] == 'right'))
            this.moveIntention.acceleration.x = -Math.abs(this.moveIntention.acceleration.x);
        if(this.environmentSnapshots[this.environmentSnapshots.length - 1].walls.some(a => a[0] == 'up'))
            this.moveIntention.acceleration.y = Math.abs(this.moveIntention.acceleration.y);
        if(this.environmentSnapshots[this.environmentSnapshots.length - 1].walls.some(a => a[0] == 'down'))
            this.moveIntention.acceleration.y = -Math.abs(this.moveIntention.acceleration.y);
    }

    handleConversation(){
        if(this.environmentSnapshots[this.environmentSnapshots.length - 1].humans.length > 1 && Date.now() - this.lastStopTime > 20000 && this.stayingStatus != 'stopped') {
            this.desireToStopMoving = true; this.desireToStartMoving = false; this.lastStopTime = Date.now(); this.stayingStatus = 'stopped' }
        if(Date.now() - this.lastStopTime > 2000 && this.stayingStatus == 'stopped') {
            this.desireToStopMoving = false; this.desireToStartMoving = true; this.stayingStatus = 'running'; }
        
        if(this.desireToStopMoving){
            this.moveIntention.acceleration = {x: -this.physicalProperties.velocity.x / 5, y: -this.physicalProperties.velocity.y / 5} }
        if(this.desireToStartMoving){
            this.moveIntention.acceleration = util.random2DVector(this.accelearionModule);
            this.desireToStartMoving = false;
        }
    }

    handleFood(){
        if(this.environmentSnapshots[this.environmentSnapshots.length - 1].food.length > 0){
            this.foodIntention = {
                x: this.environmentSnapshots[this.environmentSnapshots.length - 1].food[0].x,
                y: this.environmentSnapshots[this.environmentSnapshots.length - 1].food[0].y,
            }
        } else {
            this.foodIntention = null;
        }
    }

    handleMating(){
        
    }

    setPhysicalProperties(physicalProperties){
        this.physicalProperties = physicalProperties;
    }

    addEnvironmentSnapshot(snapshot){
        this.environmentSnapshots.push(snapshot);
    }
}

module.exports = Human;
