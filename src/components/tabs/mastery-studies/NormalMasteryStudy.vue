<script>
import DescriptionDisplay from "@/components/DescriptionDisplay";
import EffectDisplay from "@/components/EffectDisplay";
import HintText from "@/components/HintText";
import MasteryStudyButton from "./MasteryStudyButton";

export default {
  name: "NormalMasteryStudy",
  components: {
    DescriptionDisplay,
    EffectDisplay,
    HintText,
    MasteryStudyButton
  },
  props: {
    setup: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    showCost: true,
  }),
  computed: {
    study() {
      return this.setup.study;
    },
    hintText() {
      const id = this.study.id;
      const costMult = this.study.config.costMult;
      return `${id} (×${format(costMult,2,2)})`;
    },
    isUseless() {
      return Pelle.uselessTimeStudies.includes(this.study.id) && Pelle.isDoomed;
    }
  },
  methods: {
    update() {
      this.showCost = true;
      // We don't show ST cost if purchased because the first 1-2 of each "set" won't actually cost ST. There's no
      // particularly sensible way to accurately display the actual ST spent other than tracing through buy order
      // of all current studies for every study, and even then it looks odd in practice because then a few studies
      // appear more expensive simply due to buy order.
    },
  }
};
</script>

<template>
  <MasteryStudyButton
    :setup="setup"
    :show-cost="showCost"
  >
    <HintText
      type="studies"
      class="l-hint-text--time-study"
    >
      MS {{ hintText }}
    </HintText>
    <span :class="{ 'o-pelle-disabled': isUseless }">
      <DescriptionDisplay
        :config="study.config"
      />
      <EffectDisplay
        br
        :config="study.config"
      />
    </span>
  </MasteryStudyButton>
</template>

<style scoped>

</style>
