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
      metaAntimatter: new Decimal(0)
    };
  },
  methods: {
    update() {
      this.metaAntimatter.copyFrom(Currency.metaAntimatter.value);
      this.hasDimensionBoosts = player.metaDimensionBoosts > 0;
      this.isQuickResetAvailable = Player.isInAntimatterChallenge && Player.antimatterChallenge.isQuickResettable;
      this.buy10Mult.copyFrom(AntimatterDimensions.buyTenMultiplier);
    },
    quickReset() {
      softReset(-1, true, true);
    }
  }
};
</script>

<template>
  <div class="l-old-ui-antimatter-dim-tab">
    <span>You have {{ format(metaAntimatter, 2, 1) }} meta mntimatter</span>
    <br>
    <span>Your best Meta Antimatter is x, raised to the power to the power of y, translated to z extra power per dimension boost</span>
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
