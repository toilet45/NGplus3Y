<script>
import MetaDimensionRow from "./ModernMetaDimensionRow";
import ModernMetaDimensionBoostRow from "./ModernMetaDimensionBoostRow.vue";
import PrimaryButton from "@/components/PrimaryButton";
import TickspeedRow from "@/components/tabs/antimatter-dimensions/TickspeedRow";
import { Effects } from "../../../core/game-mechanics/effects";

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
      metaAntimatter: new Decimal(0),
      bestMA: new Decimal(0),
      metaPower: 0,
      metaEffect: new Decimal(0)
    };
  },
  methods: {
    maxAll() {
      maxAllMD();
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
      this.metaAntimatter.copyFrom(Currency.metaAntimatter.value);
      this.bestMA.copyFrom(player.records.thisQuantum.bestMA);
      this.metaPower = 8 + Effects.sum(DilationUpgrade.meta3, EternityChallenge(13).reward)
      this.metaEffect = (this.bestMA.minus(9)).pow(this.metaPower);
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
    <p>
    You have <span class="c-meta-dim-description__accent">{{ format(metaAntimatter, 2, 1) }}</span> meta antimatter
    </p>
    <p>
    Your best Meta Antimatter is <span class="c-meta-dim-description__accent">{{ format(bestMA, 2, 1) }}</span>, raised to the power of <span class="c-meta-dim-description__accent">{{ formatPow(metaPower, 2, 2)}}</span>, translated to <span class="c-meta-dim-description__accent">{{formatX(metaEffect, 2, 2) }}</span> extra power per Dimension Boost
    </p>
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
