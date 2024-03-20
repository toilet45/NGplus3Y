<script>
import MetaDimensionRow from "./ClassicMetaDimensionRow";
import PrimaryButton from "@/components/PrimaryButton";
import MetaDimensionBoostRow from "./ClassicMetaDimensionBoostRow.vue";

export default {
  name: "ClassicAntimatterDimensionsTab",
  components: {
    PrimaryButton,
    MetaDimensionRow,
    MetaDimensionBoostRow
  },
  data() {
    return {
      hasDimensionBoosts: false,
      buy10Mult: new Decimal(0),
      currentSacrifice: new Decimal(0),
      hasRealityButton: false,
      multiplierText: "",
      metaAntimatter: new Decimal(0),
      bestMA: new Decimal(0),
      hasMeta3: false,
      metaEffect: new Decimal(0)
    };
  },
  methods: {
    update() {
      this.metaAntimatter.copyFrom(Currency.metaAntimatter.value);
      this.hasDimensionBoosts = player.metaDimensionBoosts > 0;
      this.isQuickResetAvailable = Player.isInAntimatterChallenge && Player.antimatterChallenge.isQuickResettable;
      this.buy10Mult.copyFrom(AntimatterDimensions.buyTenMultiplier);
      this.bestMA.copyFrom(player.records.thisQuantum.bestMA);
      this.hasMeta3 = DilationUpgrade.meta3.isBought;
      this.metaEffect = (this.bestMA.minus(9)).pow(this.hasMeta3 ? 9 : 8);
    },
    quickReset() {
      softReset(-1, true, true);
    }
  }
};
</script>

<template>
  <div class="l-old-ui-antimatter-dim-tab">
    <p>
    You have <span class="c-meta-dim-description__accent">{{ format(metaAntimatter, 2, 1) }}</span> meta antimatter
    </p>
    <p>
    Your best Meta Antimatter is <span class="c-meta-dim-description__accent">{{ format(bestMA, 2, 1) }}</span>, raised to the power of <span class="c-meta-dim-description__accent">{{ formatPow(hasMeta3 ? 9 : 8, 2, 2)}}</span>, translated to <span class="c-meta-dim-description__accent">{{formatX(metaEffect, 2, 2) }}</span> extra power per Dimension Boost
    </p>
    <div class="l-dimensions-container">
      <MetaDimensionRow
        v-for="tier in 8"
        :key="tier"
        :tier="tier"
      />
      <MetaDimensionBoostRow />
      <!--<AntimatterGalaxyRow />-->
    </div>
    <div class="l-flex" />
  </div>
</template>

<style scoped>
.l-flex {
  flex: 1 0;
}
</style>
