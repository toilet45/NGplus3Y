import { DC } from "../../../constants";

const thisInfinityMult = thisInfinity => {
  // All "this inf time" or "best inf time" mults are * 10
  const scaledInfinity = thisInfinity * 10 + 1;
  const cappedInfinity = Math.min(Math.pow(scaledInfinity, 0.125), 500);
  return DC.D15.pow(Math.log(scaledInfinity) * cappedInfinity);
};
const passiveIPMult = () => {
  const isEffarigLimited = Effarig.isRunning && Effarig.currentStage === EFFARIG_STAGES.ETERNITY;
  const normalValue = Perk.studyPassive.isBought ? 1e50 : 1e25;
  return isEffarigLimited
    ? Math.min(normalValue, Effarig.eternityCap.toNumber())
    : normalValue;
};


/**
 * List of time study specifications and attributes
 * {
 *  @property {Number} id                   Numerical ID shown for each time study in code and in-game
 *  @property {Number} cost                 Amount of available time theorems required to purchase
 *  @property {Object[]} requirement   Array of Numbers or functions which are checked to determine purchasability
 *  @property {Number} reqType              Number specified by enum in MS_REQUIREMENT_TYPE for requirement behavior
 *  @property {function: @return String} description  Text to be shown in-game for the time study's effects
 *  @property {function: @return Number} effect       Numerical value for the effects of a study
 *  @property {String[]} cap     Hard-coded cap for studies which don't scale forever
 *  @property {String} formatEffect   Formatting function for effects, if the default formatting isn't appropriate
 *  @property {Number} costMult Cost Multiplier for Mastery Studies
 * }
 */
export const masteryTimeStudies = [
  {
    id: 11,
    cost: 2e71,
    // All requirements of an empty array will always evaluate to true, so this study is always purchasable
    requirement: [],
    reqType: MS_REQUIREMENT_TYPE.ALL,
    description: () => `Increase the IP multiplier rebuyable upgrade's base to ${formatX(2.2, 1, 1)}`,
    effect: 2.2,
    costMult: 1,
    //formatEffect: value => formatX(value, 2, 1)
  },
  {
    id: 21,
    cost: 5e71,
    requirement: [11],
    reqType: MS_REQUIREMENT_TYPE.ALL,
    description: "Remote Antimatter Galaxy scaling starts later based on Dimension Boosts",
    effect: () => Math.floor(DimBoost.totalBoosts / 3000),
    costMult: 2.5,
    formatEffect: value => `+${formatInt(value)}`
  },
  {
    id: 22,
    cost: 5e71,
    requirement: [11],
    reqType: MS_REQUIREMENT_TYPE.ALL,
    description: "Remote Antimatter Galaxy scaling starts later based on Tachyonic Galaxies",
    effect: () => Math.floor(player.dilation.totalTachyonGalaxies / 7),
    costMult: 2.5,
    formatEffect: value => `+${formatInt(value)}`
  },
  {
    id: 23,
    cost: 5e71,
    requirement: [11],
    reqType: MS_REQUIREMENT_TYPE.ALL,
    description: "Remote Antimatter Galaxy scaling starts later based on Replicanti Galaxies",
    effect: () => Math.floor(Replicanti.galaxies.total / 4),
    costMult: 2.5,
    formatEffect: value => `+${formatInt(value)}`
  },
  {
    id: 31,
    cost: 2e71,
    requirement: [21],
    reqType: MS_REQUIREMENT_TYPE.ALL,
    description: "Reduce Dimension Boost scaling by 1",
    effect: 1,
    costMult: 6,
  },
  {
    id: 32,
    cost: 2e71,
    requirement: [21],
    reqType: MS_REQUIREMENT_TYPE.ALL,
    description: "Dimension Boosts affect Meta Dimensions at a reduced rate",
    effect: () => {
      let x = Math.max(DimBoost.totalBoosts / 5e4 - 10, 1) > 10000 ? Math.pow(6 + Math.log10(Math.max(DimBoost.totalBoosts / 5e4 - 10, 1)), 4) : Math.max(DimBoost.totalBoosts / 5e4 - 10, 1);
      return Math.pow(x, Math.sqrt(Math.max(DimBoost.totalBoosts / 1e5 - 5.5, 1)));
    },
    costMult: 6,
    formatEffect: value => formatX(value, 2, 1)
  },
  {
    id: 33,
    cost: 2e71,
    requirement: [22],
    reqType: MS_REQUIREMENT_TYPE.ALL,
    description: "Meta Dimension Boosts boost Dilated Time gain",
    effect: () => MetaDimBoost.totalBoosts + 1,
    costMult: 6,
    formatEffect: value => formatX(value, 2, 1)
  },
  {
    id: 34,
    cost: 2e71,
    requirement: [22],
    reqType: MS_REQUIREMENT_TYPE.ALL,
    description: "Antimatter Galaxies boost Tachyon Particle gain",
    effect: () => player.galaxies / 100 + 1,
    costMult: 6,
    formatEffect: value => formatX(value, 2, 1)
  },
  {
    id: 35,
    cost: 2e71,
    requirement: [23],
    reqType: MS_REQUIREMENT_TYPE.ALL,
    description: "Uncap the Replicanti chance upgrade",
    effect: 1,
    costMult: 6,
  },
  {
    id: 36,
    cost: 2e71,
    requirement: [23],
    reqType: MS_REQUIREMENT_TYPE.ALL,
    description: "Move Remote Galaxy Scaling to 5000 Replicanti Galaxies",
    effect: 1,
    costMult: 6,
  },
];
