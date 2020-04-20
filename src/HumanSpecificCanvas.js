class HumanSpecificCanvas{
    constructor(playground, updatePeriod, controlledHuman){
        this.playground = playground;
        this.updatePeriod = updatePeriod;
        this.controlledHuman = controlledHuman;
    }

    start(){
        let that = this;
        setInterval(function(){
            that.update();
        }, this.updatePeriod)
    }

    update(){
        this.redraw();
    }

    redraw(){
        this.clear();

        let position = this.controlledHuman.physicalProperties.position;

        let srcCanvas = document.getElementById("myCanvas");
        let destCanvas = document.getElementById("human-specific-canvas");
        let destCtx = destCanvas.getContext("2d");

        let proportion = srcCanvas.height / srcCanvas.width;
        let shownWidth = srcCanvas.width / 2; 
        let shownHeight = proportion * shownWidth;

        destCtx.drawImage(srcCanvas, position.x - shownWidth/2, position.y - shownHeight/2, shownWidth, shownHeight, 0, 0, destCanvas.width, destCanvas.height);
    }

    clear(){
        let c = document.getElementById("human-specific-canvas");
        let ctx = c.getContext("2d");
        ctx.clearRect(0, 0, c.width, c.height);
    }
}

module.exports = HumanSpecificCanvas;
