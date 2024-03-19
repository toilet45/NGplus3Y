<script>
import MetaDimensionRow from "@/components/tabs/meta-dimensions/ModernMetaDimensionRow";
import ModernMetaDimensionBoostRow from "@/components/tabs/antimatter-dimensions/ModernDimensionBoostRow";
import PrimaryButton from "@/components/PrimaryButton";
import TickspeedRow from "@/components/tabs/antimatter-dimensions/TickspeedRow";

export default {
  name: "ModernMetaDimensionsTab",
  components: {
    PrimaryButton,
    MetaDimensionRow,
    ModernMetaDimensionBoostRow,
    //TickspeedRow
  },
  data() {
    return {
      hasMetaDimensionBoosts: false,
      buyUntil10: true,
      buy10Mult: new Decimal(0),
      disabledCondition: "",
      isQuickResetAvailable: false,
      multiplierText: "",
    };
  },
  methods: {
    maxAll() {
      maxAll();
    },
    // Toggle single/10 without Continuum, otherwise cycle through all 3 if it's unlocked
    changeBuyMode() {
        player.buyUntil10 = !player.buyUntil10;
        return;
    },
    getUntil10Display() {
      return this.buyUntil10 ? "Until 10" : "Buy 1";
    },
    update() {
      this.hasMetaDimensionBoosts = player.metaDimensionBoosts > 0;
      this.buyUntil10 = player.buyUntil10;
      this.isQuickResetAvailable = Player.isInAntimatterChallenge && Player.antimatterChallenge.isQuickResettable;

      this.buy10Mult.copyFrom(MetaDimensions.buyTenMultiplier);

      this.multiplierText = `Buy 10 Dimension purchase multiplier: ${formatX(this.buy10Mult, 2, 2)}`;
    }
  }
};
</script>

<template>
  <div class="l-antimatter-dim-tab">
    <div class="modes-container">
      <button
        class="o-primary-btn l-button-container"
        @click="changeBuyMode"
      >
        {{ getUntil10Display() }}
      </button>
      <button
        class="o-primary-btn l-button-container"
        @click="maxAll"
      >
        Max All (M)
      </button>
    </div>
    <span>{{ multiplierText }}</span>
    <div class="l-dimensions-container">
      <MetaDimensionRow
        v-for="tier in 8"
        :key="tier"
        :tier="tier"
      />
    </div>
    <div class="resets-container">
      <ModernMetaDimensionBoostRow />
      <!--<AntimatterGalaxyRow />-->
    </div>
  </div>
</template>

<style scoped>
.l-button-container {
  width: 100px;
  height: 30px;
  padding: 0;
}
</style>
