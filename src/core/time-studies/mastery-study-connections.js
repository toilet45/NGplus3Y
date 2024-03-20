import MasteryStudyButton from "../../components/tabs/mastery-studies/MasteryStudyButton.vue";
import { MasteryStudy } from "./normal-mastery-study";
import { TimeStudy } from "./normal-time-study";

export class MasteryStudyConnection {
  constructor(from, to, override) {
    this._from = from;
    this._to = to;
    this._override = override;
  }

  get from() {
    return this._from;
  }

  get to() {
    return this._to;
  }

  get isOverridden() {
    return this._override !== undefined && this._override();
  }

  get isSatisfied() {
    return this.isOverridden || this._from.isBought;
  }
}

/**
 * @type {MasteryStudyConnection[]}
 */
MasteryStudy.allConnections = (function() {
  const MS = id => MasteryStudy(id);
  const EC = id => TimeStudy.eternityChallenge(id);
  const connections = [
    [MS(11), MS(21)],
    [MS(11), MS(22)],
    [MS(11), MS(23)],
    [MS(11), MS(24)],
    [MS(11), MS(25)],
    [MS(11), MS(26)],
    /*[MS(21), EC(13)],
    [MS(22), EC(13)],
    [MS(25), EC(14)],
    [MS(26), EC(14)],*/
  ].map(props => new MasteryStudyConnection(props[0], props[1], props[2]));

  return connections;
}());
