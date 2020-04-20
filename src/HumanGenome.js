class HumanGenome{

    turnOnSeeingHumanGene = new TurnOnSeeingHumanGene(123);

    static mix(a, b) {
        var res = new HumanGenome();

        res.turnOnSeeingHumanGene = TurnOnSeeingHumanGene.mix(a.turnOnSeeingHumanGene, b.turnOnSeeingHumanGene);

        return res;
    }
}

class TurnOnSeeingHumanGene{
    directionOfTurning;

    constructor(directionOfTurning){
        this.directionOfTurning = directionOfTurning;
    }

    static mix(turnOnSeeingHumanGeneA, turnOnSeeingHumanGeneB){
        return new TurnOnSeeingHumanGene(randomMixOfTwoQuantities(turnOnSeeingHumanGeneA.directionOfTurning, turnOnSeeingHumanGeneB.directionOfTurning));
    }
}

function randomMixOfTwoQuantities(qa, qb){
    var weightA = Math.random();
    var weightB = 1 - weightA;

    return qa * weightA + qb * weightB;
}

module.exports = HumanGenome;

