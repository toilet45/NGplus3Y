import { DC } from "./constants";

class MetaDimBoostRequirement {
  constructor(tier, amount) {
    this.tier = tier;
    this.amount = amount;
  }

  get isSatisfied() {
    const dimension = MetaDimension(this.tier);
    return dimension.totalAmount.gte(this.amount);
  }
}

export class MetaDimBoost {
  static get power() {
    let boost = DC.D2.timesEffectsOf(
      Achievement(144),
      DilationUpgrade.meta2
    );
    return boost;
  }

  static multiplierToMDTier(tier) {
    const normalBoostMult = MetaDimBoost.power.pow(this.purchasedBoosts + 1 - tier).clampMin(1);
    return normalBoostMult;
  }

  static get maxDimensionsUnlockable() {
    return 8;
  }

  static get canUnlockNewDimension() {
    return MetaDimBoost.purchasedBoosts + 4 < MetaDimBoost.maxDimensionsUnlockable;
  }

  static get maxBoosts() {
    return Infinity;
  }

  static get canBeBought() {
    if (MetaDimBoost.purchasedBoosts >= this.maxBoosts) return false;
    return true;
  }

  static get lockText() {
    if (DimBoost.purchasedBoosts >= this.maxBoosts) {
      return "Locked"
    }
    return null;
  }

  static get requirement() {
    return this.bulkRequirement(1);
  }

  static bulkRequirement(bulk) {
    const targetResets = MetaDimBoost.purchasedBoosts + bulk;
    const tier = Math.min(targetResets + 3, this.maxDimensionsUnlockable);
    let amount = 20;
    const discount = 0;
    if (tier === 8) {
      let multiplier = 15
      amount += Math.max(MetaDimBoost.purchasedBoosts - 4, 0) * multiplier;
      let scaleStart = 15;
      if (MetaDimBoost.purchasedBoosts >= scaleStart){
        amount += 5 * (MetaDimBoost.purchasedBoosts - scaleStart);
        multiplier += 5;
      }
    }

    amount = Math.round(amount);

    return new MetaDimBoostRequirement(tier, amount);
  }

  static get unlockedByBoost() {
    if (MetaDimBoost.lockText !== null) return MetaDimBoost.lockText;
    const boosts = MetaDimBoost.purchasedBoosts;
    const allMDUnlocked = false;

    let newUnlock = "";
    if (!allMDUnlocked && boosts < MetaDimBoost.maxDimensionsUnlockable - 4) {
      newUnlock = `unlock the ${boosts + 5}th Meta Dimension`;
    }

    const formattedMultText = `give a ${formatX(MetaDimBoost.power, 2, 1)} multiplier `;
    let dimensionRange = `to the 1st Meta Dimension`;
    if (boosts > 0) dimensionRange = `to Meta Dimensions 1-${Math.min(boosts + 1, 8)}`;
    if (boosts >= MetaDimBoost.maxDimensionsUnlockable - 1) dimensionRange = `to all Meta Dimensions`;

    let boostEffects;
    if (newUnlock === "") boostEffects = `${formattedMultText} ${dimensionRange}`;
    else boostEffects = `${newUnlock} and ${formattedMultText} ${dimensionRange}`;

    if (boostEffects === "") return "Meta Dimension Boosts are currently useless";
    const areDimensionsKept = true
    if (areDimensionsKept) return boostEffects[0].toUpperCase() + boostEffects.substring(1);
    return `Reset your Meta Dimensions to ${boostEffects}`;
  }

  static get purchasedBoosts() {
    return Math.floor(player.metaDimensionBoosts);
  }

  static get totalBoosts() {
    return Math.floor(this.purchasedBoosts);
  }

  static get startingMetaDimensionBoosts() {
    return 0;
  }
}

// eslint-disable-next-line max-params
export function softMDBReset(tempBulk, forcedMDReset = false, forcedMAReset = false, enteringQuantumChallenge = false) {
  //if (Currency.antimatter.gt(Player.infinityLimit)) return;
  const bulk = Math.min(tempBulk, MetaDimBoost.maxBoosts - player.metaDimensionBoosts);
  EventHub.dispatch(GAME_EVENT.META_DIMBOOST_BEFORE, bulk);
  player.metaDimensionBoosts = Math.max(0, player.metaDimensionBoosts + bulk);
  //resetChallengeStuff();
  const canKeepDimensions = false;
  if (forcedMDReset || !canKeepDimensions) {
    MetaDimensions.reset();
  }
  //skipResetsIfPossible(enteringQuantumChallenge);
  const canKeepMetaAntimatter = false
  if (!forcedMDReset && canKeepMetaAntimatter) {
    Currency.metaAntimatter.bumpTo(Currency.metaAntimatter.startingValue);
  } else {
    Currency.metaAntimatter.reset();
  }
  EventHub.dispatch(GAME_EVENT.META_DIMBOOST_AFTER, bulk);
}

export function skipMDBResetsIfPossible(enteringQuantumChallenge) {
  if (enteringQuantumChallenge) return;
}

export function manualRequestMetaDimensionBoost(bulk) {
  if (!MetaDimBoost.requirement.isSatisfied) return;
  if (!MetaDimBoost.canBeBought) return;
  if (GameEnd.creditsEverClosed) return;
  if (player.options.confirmations.dimensionBoost) {
    Modal.dimensionBoost.show({ bulk });
    return;
  }
  requestMetaDimensionBoost(bulk);
}

export function requestMetaDimensionBoost(bulk) {
  if (!MetaDimBoost.requirement.isSatisfied) return;
  if (!MetaDimBoost.canBeBought) return;
  Tutorial.turnOffEffect(TUTORIAL_STATE.DIMBOOST);
  if (false && bulk) maxBuyDimBoosts();
  else softMDBReset(1);
}

function maxBuyDimBoosts() {
  // Boosts that unlock new dims are bought one at a time, unlocking the next dimension
  if (MetaDimBoost.canUnlockNewDimension) {
    if (MetaDimBoost.requirement.isSatisfied) softMDBReset(1);
    return;
  }
  const req1 = MetaDimBoost.bulkRequirement(1);
  if (!req1.isSatisfied) return;
  const req2 = MetaDimBoost.bulkRequirement(2);
  if (!req2.isSatisfied) {
    softMDBReset(1);
    return;
  }
  // Linearly extrapolate dimboost costs. req1 = a * 1 + b, req2 = a * 2 + b
  // so a = req2 - req1, b = req1 - a = 2 req1 - req2, num = (dims - b) / a
  const increase = req2.amount - req1.amount;
  const dim = MetaDimension(req1.tier);
  let maxBoosts = Math.min(Number.MAX_VALUE,
    1 + Math.floor((dim.totalAmount.toNumber() - req1.amount) / increase));
  if (MetaDimBoost.bulkRequirement(maxBoosts).isSatisfied) {
    softMDBReset(maxBoosts);
    return;
  }
  // But in case of EC5 it's not, so do binary search for appropriate boost amount
  let minBoosts = 2;
  while (maxBoosts !== minBoosts + 1) {
    const middle = Math.floor((maxBoosts + minBoosts) / 2);
    if (MetaDimBoost.bulkRequirement(middle).isSatisfied) minBoosts = middle;
    else maxBoosts = middle;
  }
  softMDBReset(minBoosts);
}
