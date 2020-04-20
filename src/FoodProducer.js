class FoodProducer{
    constructor(field, meanNumOfPortionsPerPeriod, updatePeriod){
        this.field = field;
        this.meanNumOfPortionsPerPeriod = meanNumOfPortionsPerPeriod;
        this.updatePeriod = updatePeriod;
        this.status = null;
        this.stopTicket = null;
    }

    start(){
        this.status = 'running';
        let that = this;
        this.stopTicket = setInterval(function(){
            that.update();
        }, this.updatePeriod);
    }

    stop(){
        clearInterval(this.stopTicket);
        this.status = 'stopped';
    }

    toggle(){
        if(this.status == 'running') this.stop();
        else this.start();
    }

    update(){
        this.addNewPortions();
    }

    addNewPortions(){
        let numNewPortions = Math.floor(Math.random() * 2 * this.meanNumOfPortionsPerPeriod);
        for(let i = 0; i<numNewPortions; i++){
            let position = {
                x: Math.floor(Math.random() * this.field.width),
                y: Math.floor(Math.random() * this.field.height)
            };
            let newPortion = {};
            this.field.addObject('food', newPortion, { position: position, age: 0});
        }
    }
}

module.exports = FoodProducer;
