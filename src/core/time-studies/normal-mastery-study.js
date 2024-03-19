import { MasteryStudyState } from "./mastery-studies";

export const NormalMasteryStudies = {};

/*NormalMasteryStudies.pathList = [
  { path: TIME_STUDY_PATH.ANTIMATTER_DIM, studies: [71, 81, 91, 101], name: "Antimatter Dims" },
  { path: TIME_STUDY_PATH.INFINITY_DIM, studies: [72, 82, 92, 102], name: "Infinity Dims" },
  { path: TIME_STUDY_PATH.TIME_DIM, studies: [73, 83, 93, 103], name: "Time Dims" },
  { path: TIME_STUDY_PATH.ACTIVE, studies: [121, 131, 141], name: "Active" },
  { path: TIME_STUDY_PATH.PASSIVE, studies: [122, 132, 142], name: "Passive" },
  { path: TIME_STUDY_PATH.IDLE, studies: [123, 133, 143], name: "Idle" },
  { path: TIME_STUDY_PATH.LIGHT, studies: [221, 223, 225, 227, 231, 233], name: "Light" },
  { path: TIME_STUDY_PATH.DARK, studies: [222, 224, 226, 228, 232, 234], name: "Dark" }
];

NormalTimeStudies.paths = NormalTimeStudies.pathList.mapToObject(e => e.path, e => e.studies);*/

export class NormalMasteryStudyState extends MasteryStudyState {
  constructor(config) {
    const type = MASTERY_STUDY_TYPE.NORMAL;
    super(config, type);
    /*const path = NormalTimeStudies.pathList.find(p => p.studies.includes(this.id));
    this._path = path?.path ?? TIME_STUDY_PATH.NONE;*/
  }

  get isUnlocked() {
    return this.config.unlocked?.() ?? true;
  }

  get isBought() {
    return GameCache.masteryStudies.value[this.id];
  }

  // The requiresST prop is an array containing IDs indicating other studies which, if ANY in the array are purchased,
  // will cause the study to also cost space theorems. This array is effectively assumed to be empty if not present.

  checkRequirement() {
    const check = req => (typeof req === "number"
      ? TimeStudy(req).isBought
      : req());
    const currTree = GameCache.currentStudyTree.value;
    switch (this.config.reqType) {
      case MS_REQUIREMENT_TYPE.AT_LEAST_ONE:
        return this.config.requirement.some(r => check(r));
      case MS_REQUIREMENT_TYPE.ALL:
        return this.config.requirement.every(r => check(r));
      case MS_REQUIREMENT_TYPE.DIMENSION_PATH:
        // In some cases of loading, sometimes the current tree might be undefined when this code is executed. The
        // exact situations seem unclear, but it may be an interaction between the automator and offline progress
        return this.config.requirement.every(r => check(r)) && currTree &&
          currTree.currDimPathCount < currTree.allowedDimPathCount;
      default:
        throw Error(`Unrecognized MS requirement type: ${this.reqType}`);
    }
  }

  // This checks for and forbids buying studies due to being part of a set which can't normally be bought
  // together (eg. active/passive/idle and light/dark) unless the player has the requisite ST.
  checkSetRequirement() {
    return this.costsST() ? !Pelle.isDisabled("V") && (V.availableST >= this.STCost) : true;
  }

  get canBeBought() {
    return this.checkRequirement() && this.checkSetRequirement();
  }

  get isEffectActive() {
    return this.isBought;
  }

  purchase(auto = false) {
    if (this.isBought || !this.isAffordable || !this.canBeBought) return false;
    if (GameEnd.creditsEverClosed) return false;
    player.timestudy.studies.push(this.id);
    Currency.timeTheorems.subtract(this.cost);
    GameCache.masteryStudies.invalidate();
    MasteryStudyTree.commitToGameState([MasteryStudy(this.id)]);
    return true;
  }

  purchaseUntil() {
    MasteryStudyTree.commitToGameState(buyMasteryStudiesUntil(this.id));
  }

  get path() {
    return this._path;
  }
}

NormalMasteryStudyState.studies = mapGameData(
  GameDatabase.eternity.masteryStudies.normal,
  config => new NormalMasteryStudyState(config)
);

NormalMasteryStudyState.all = NormalMasteryStudyState.studies.filter(e => e !== undefined);

/**
 * @returns {NormalMasteryStudyState}
 */
export function MasteryStudy(id) {
  return NormalMasteryStudyState.studies[id];
}

/**
 * @returns {NormalMasteryStudyState[]}
 */
MasteryStudy.boughtNormalMS = function() {
  return player.masterystudy.studies.map(id => TimeStudy(id));
};
