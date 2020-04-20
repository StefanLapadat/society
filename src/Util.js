function range(n) {
    res = [];
    for(var i = 0; i<n; i++) res.push(i);
    return res;
}

function deepCopy(simpleObj){
    return JSON.parse(JSON.stringify(simpleObj));
}

function random2DVector(module){
    fi = Math.random() * 2 * Math.PI;

    return {
        x: module * Math.cos(fi),
        y: module * Math.sin(fi)
    };
}


module.exports = {
    range,
    deepCopy,
    random2DVector
}