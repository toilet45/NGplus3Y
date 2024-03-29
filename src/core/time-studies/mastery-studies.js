import { GameMechanicState } from "../game-mechanics";


// This is only ever called from manual player actions, which means we can immediately commit them to the game state
// eslint-disable-next-line complexity
export function buyMasteryStudiesUntil(id, ec = -1) {
  let studyArray = [];
  return studyArray;
}

export function MSCostMult(){
    let i = 1;
    for (const study of MasteryStudy.boughtNormalMS()) {
      i *= study.config.costMult;
    }
    return i;
  }

  export function respecMasteryStudies(auto) {
    for (const study of MasteryStudy.boughtNormalMS()) {
      study.refund();
    }
    player.masterystudy.studies = [];
    GameCache.masteryStudies.invalidate();
    const ecStudy = TimeStudy.eternityChallenge.current();
    if (ecStudy > 12) {
      ecStudy.refund();
      player.challenge.eternity.unlocked = 0;
    }
    if (!auto) {
      Tab.eternity.masteryStudies.show();
    }
    GameCache.currentMasteryStudyTree.invalidate();
  }

export class MasteryStudyState extends GameMechanicState {
  constructor(config, type) {
    super(config);
    this.type = type;
  }

  get cost() {
    return this.config.cost * MSCostMult();
  }

  refund() {
    Currency.timeTheorems.add(this.cost);
  }

  get isAffordable() {
    return Currency.timeTheorems.gte(this.cost);
  }

  get canBeBought() {
    return true;
  }
}
