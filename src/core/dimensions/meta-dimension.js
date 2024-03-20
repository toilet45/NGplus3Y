import { DC } from "../constants";

import { DimensionState } from "./dimension";

// Multiplier applied to all Antimatter Dimensions, regardless of tier. This is cached using a Lazy
// and invalidated every update.
export function metaDimensionCommonMultiplier() {
  let multiplier = DC.D1;
  return multiplier;
}

export function getMetaDimensionFinalMultiplierUncached(tier) {
  if (tier < 1 || tier > 8) throw new Error(`Invalid Meta Dimension tier ${tier}`);
  let multiplier = DC.D1;
  multiplier = applyMDMultipliers(multiplier, tier);
  return multiplier;
}

function applyMDMultipliers(mult, tier) {
  let multiplier = mult.times(GameCache.metaDimensionCommonMultiplier.value);

  let buy10Value = Math.floor(MetaDimension(tier).bought / 10);
  multiplier = multiplier.times(Decimal.pow(MetaDimensions.buyTenMultiplier, buy10Value));
  multiplier = multiplier.times(MetaDimBoost.multiplierToMDTier(tier));


  multiplier = multiplier.clampMin(1);

  return multiplier;
}

function applyMDPowers(mult, tier) {
  let multiplier = mult;
  return multiplier;
}

function onBuyDimension(tier) {
  if (tier === 8) Achievement(142).unlock()
}

export function buyOneMetaDimension(tier) {
  const dimension = MetaDimension(tier);
  if (!dimension.isAvailableForPurchase || !dimension.isAffordable) return false;

  const cost = dimension.cost;
  dimension.currencyAmount = dimension.currencyAmount.minus(cost);

  dimension.amount = dimension.amount.plus(1);
  dimension.bought++;

  onBuyDimension(tier);

  return true;
}

export function buyManyMetaDimension(tier) {
  const dimension = MetaDimension(tier);
  if (!dimension.isAvailableForPurchase || !dimension.isAffordableUntil10) return false;
  const cost = dimension.costUntil10;

  dimension.currencyAmount = dimension.currencyAmount.minus(cost);
  dimension.amount = dimension.amount.plus(dimension.remainingUntil10);
  dimension.bought += dimension.remainingUntil10;

  onBuyDimension(tier);

  return true;
}

export function buyAsManyMDAsYouCanBuy(tier) {
  const dimension = MetaDimension(tier);
  if (!dimension.isAvailableForPurchase || !dimension.isAffordable) return false;
  const howMany = dimension.howManyCanBuy;
  const cost = dimension.cost.times(howMany);
  dimension.currencyAmount = dimension.currencyAmount.minus(cost);
  dimension.amount = dimension.amount.plus(howMany);
  dimension.bought += howMany;

  onBuyDimension(tier);

  return true;
}

// This function doesn't do cost checking as challenges generally modify costs, it just buys and updates dimensions
function buyUntilTen(tier) {
  if (Laitela.continuumActive) return;
  const dimension = MetaDimension(tier);
  dimension.amount = Decimal.round(dimension.amount.plus(dimension.remainingUntil10));
  dimension.bought += dimension.remainingUntil10;
  onBuyDimension(tier);
}

export function maxAllMD() {
  for (let tier = 1; tier < 9; tier++) {
    buyMaxMetaDimension(tier);
  }

  // Do this here because tickspeed might not have been unlocked before
  // (and maxAll might have unlocked it by buying dimensions).
}

export function buyMaxMetaDimension(tier, bulk = Infinity) {
  const dimension = MetaDimension(tier);
  if (!dimension.isAvailableForPurchase || !dimension.isAffordableUntil10) return;
  const cost = dimension.costUntil10;
  let bulkLeft = bulk;

  // Buy any remaining until 10 before attempting to bulk-buy
  if (dimension.currencyAmount.gte(cost)) {
    dimension.currencyAmount = dimension.currencyAmount.minus(cost);
    buyUntilTen(tier);
    bulkLeft--;
  }

  if (bulkLeft <= 0) return;

  // Buy in a while loop in order to properly trigger abnormal price increases
  // This is the bulk-buy math, explicitly ignored if abnormal cost increases are active
  const maxBought = dimension.costScale.getMaxBought(
    Math.floor(dimension.bought / 10) + dimension.costBumps, dimension.currencyAmount, 10
  );
  if (maxBought === null) {
    return;
  }
  let buying = maxBought.quantity;
  if (buying > bulkLeft) buying = bulkLeft;
  dimension.amount = dimension.amount.plus(10 * buying).round();
  dimension.bought += 10 * buying;
  dimension.currencyAmount = dimension.currencyAmount.minus(Decimal.pow10(maxBought.logPrice));
}

class MetaDimensionState extends DimensionState {
  constructor(tier) {
    super(() => player.dimensions.meta, tier);
    const BASE_COSTS = [null, 10, 100, 1e4, 1e6, 1e9, 1e13, 1e18, 1e24];
    this._baseCost = BASE_COSTS[tier];
    const BASE_COST_MULTIPLIERS = [null, 1e3, 1e4, 1e5, 1e6, 1e8, 1e10, 1e12, 1e15];
    this._baseCostMultiplier = BASE_COST_MULTIPLIERS[tier];
  }

  /**
   * @returns {ExponentialCostScaling}
   */
  get costScale() {
    return new ExponentialCostScaling({
      baseCost: this._baseCost,
      baseIncrease: this._baseCostMultiplier,
      costScale: Player.metaDimensionMultDecrease,
      scalingCostThreshold: Number.MAX_VALUE
    });
  }

  /**
   * @returns {Decimal}
   */
  get cost() {
    return this.costScale.calculateCost(Math.floor(this.bought / 10) + this.costBumps);
  }

  /** @returns {number} */
  get costBumps() { return this.data.costBumps; }
  /** @param {number} value */
  set costBumps(value) { this.data.costBumps = value; }

  /**
   * @returns {number}
   */
  get boughtBefore10() {
    return this.bought % 10;
  }

  /**
   * @returns {number}
   */
  get remainingUntil10() {
    return 10 - this.boughtBefore10;
  }

  /**
   * @returns {Decimal}
   */
  get costUntil10() {
    return this.cost.times(this.remainingUntil10);
  }

  get howManyCanBuy() {
    const ratio = this.currencyAmount.dividedBy(this.cost);
    return Decimal.floor(Decimal.max(Decimal.min(ratio, 10 - this.boughtBefore10), 0)).toNumber();
  }

  /**
   * @returns {Decimal}
   */
  get rateOfChange() {
    const tier = this.tier;
    if (tier === 8) return DC.D0;
    let toGain = MetaDimension(tier + 1).productionPerSecond;
    return toGain.times(10).dividedBy(this.amount.max(1)).times(getGameSpeedupForDisplay());
  }

  /**
   * @returns {boolean}
   */
  get isProducing() {
    const tier = this.tier;
    return this.totalAmount.gt(0);
  }

  /**
   * @returns {Decimal}
   */
  get currencyAmount() {
    return Currency.metaAntimatter.value;
  }

  /**
   * @param {Decimal} value
   */
  set currencyAmount(value) {
    Currency.metaAntimatter.value = value;
  }

  /**
   * Continuum doesn't continually update dimension amount because that would require making the code
   * significantly messier to handle it properly. Instead an effective amount is calculated here, which
   * is only used for production and checking for boost/galaxy. Doesn't affect achievements.
   * Taking the max is kind of a hack but it seems to work in all cases. Obviously it works if
   * continuum isn't unlocked. If the dimension is being produced and the continuum is unlocked,
   * the dimension will be being produced in large numbers (since the save is endgame), so the amount
   * will be larger than the continuum and so the continuum is insignificant, which is fine.
   * If the dimension isn't being produced, the continuum will be at least the amount, so
   * the continuum will be used and that's fine. Note that when continuum is first unlocked,
   * both 8d amount and 8d continuum will be nonzero until the next infinity, so taking the sum
   * doesn't work.
   * @param {Decimal} value
   */
  get totalAmount() {
    return this.amount;
  }

  /**
    * @returns {boolean}
    */
  get isAffordable() {
    return this.cost.lte(this.currencyAmount);
  }

  /**
   * @returns {boolean}
   */
  get isAffordableUntil10() {
    return this.costUntil10.lte(this.currencyAmount);
  }

  get isAvailableForPurchase() {
    if (this.tier > MetaDimBoost.totalBoosts + 4) return false;
    const hasPrevTier = this.tier === 1 || MetaDimension(this.tier - 1).totalAmount.gt(0);
    return hasPrevTier;
  }

  reset() {
    this.amount = DC.D0;
    this.bought = 0;
    this.costBumps = 0;
  }

  resetAmount() {
    this.amount = DC.D0;
  }

  get multiplier() {
    return GameCache.metaDimensionFinalMultipliers[this.tier].value;
  }

  get productionPerSecond() {
    const tier = this.tier;
    let amount = this.totalAmount;
    let production = amount.times(this.multiplier);
    return production;
  }
}

/**
 * @function
 * @param {number} tier
 * @return {MetaDimensionState}
 */
export const MetaDimension = MetaDimensionState.createAccessor();

export const MetaDimensions = {
  /**
   * @type {MetaDimensionState[]}
   */
  all: MetaDimension.index.compact(),

  reset() {
    for (const dimension of MetaDimensions.all) {
      dimension.reset();
    }
    GameCache.dimensionMultDecrease.invalidate();
  },

  resetAmountUpToTier(maxTier) {
    for (const dimension of MetaDimensions.all.slice(0, maxTier)) {
      dimension.resetAmount();
    }
  },

  get buyTenMultiplier() {
    let mult = DC.D2;
    return mult;
  },

  tick(diff) {
    // Stop producing antimatter at Big Crunch goal because all the game elements
    // are hidden when pre-break Big Crunch button is on screen.
    let maxTierProduced = 7;
    let nextTierOffset = 1;
    for (let tier = maxTierProduced; tier >= 1; --tier) {
      MetaDimension(tier + nextTierOffset).produceDimensions(MetaDimension(tier), diff / 10);
    }
    MetaDimension(1).produceCurrency(Currency.metaAntimatter, diff);
  }
};
