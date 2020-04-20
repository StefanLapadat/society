class Canvas{
    constructor(playground, updatePeriod){
        this.playground = playground;
        this.updatePeriod = updatePeriod;
    }

    start(){
        var that = this;
        setInterval(function(){
            that.update();
        }, this.updatePeriod)
    }

    update(){
        this.redraw();
    }

    redraw(){
        this.clear();
        var that = this;

        this.playground.objects.forEach(element => {
            if(element.type==='human'){
                that.drawHuman(element);
            }
            if(element.type=='food'){
                that.drawFoodPortion(element);
            }
        });
    }

    drawHuman(element){
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

    drawFoodPortion(element){
        var canvas = document.getElementById("myCanvas");
        var context = canvas.getContext("2d");
        context.beginPath();
        
        context.arc(element.physicalProperties.position.x, element.physicalProperties.position.y, 10, 0, Math.PI * 2, false);
        context.fillStyle = "green";
        context.fill();
    }

    clear(){
        let c = document.getElementById("myCanvas");
        let ctx = c.getContext("2d");
        ctx.clearRect(0, 0, c.width, c.height);
    }
}

module.exports = Canvas;
