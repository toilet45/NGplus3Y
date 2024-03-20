<script>
import CostDisplay from "@/components/CostDisplay";

export default {
  name: "MasteryStudyButton",
  components: {
    CostDisplay
  },
  props: {
    setup: {
      type: Object,
      required: true
    },
    showCost: {
      type: Boolean,
      required: false,
      default: true
    },
    specialClick: {
      type: Function,
      required: false,
      default: null,
    }
  },
  data() {
    return {
      isUseless: false,
      isBought: false,
      isAvailableForPurchase: false,
      eternityChallengeRunning: false,
      isCompleteEC: false,
    };
  },
  computed: {
    study() {
      return this.setup.study;
    },
    styleObject() {
      return {
        top: `${this.setup.top}rem`,
        left: `${this.setup.left}rem`
      };
    },
    classObject() {
      return {
        "o-time-study": !this.isUseless,
        "l-time-study": true,
        "c-pelle-useless": this.isUseless,
        "c-pelle-useless--bought": this.isUseless && this.isBought,
        "c-pelle-useless--unavailable": this.isUseless && !this.isAvailableForPurchase && !this.isBought,
        "c-pelle-useless-available": this.isUseless && !this.isAvailableForPurchase && !this.isBought,
        "o-time-study--small": this.setup.isSmall,
        "o-time-study--unavailable": !this.isAvailableForPurchase && !this.isBought && !this.isUseless,
        "o-time-study--available": this.isAvailableForPurchase && !this.isBought,
        "o-time-study--bought": this.isBought && !this.isUseless,
      };
    },
    pathClass() {
      switch (this.study.type) {
        case MASTERY_STUDY_TYPE.NORMAL:
          return "o-time-study-normal";
        case MASTERY_STUDY_TYPE.ETERNITY_CHALLENGE:
          return "o-time-study-eternity-challenge";
      }
      return "";
    },
    studyClass() {
      if (this.isUseless) return "";
      let pathClasses = "";
      if (!this.isAvailableForPurchase && !this.isBought) {
        pathClasses += `${this.pathClass}--unavailable`;
      }
      if (this.isAvailableForPurchase && !this.isBought) {
        pathClasses += `${this.pathClass}--available`;
      }
      if (this.isBought) {
        pathClasses += `${this.pathClass}--bought`;
      }
      if (this.isCompleteEC) {
        pathClasses += ` ${this.pathClass}--complete`;
      }
      return pathClasses;
    },
    eternityChallengeAnim() {
      return this.eternityChallengeRunning ? "o-time-study-eternity-challenge--running" : "";
    },
    config() {
      return { ...this.study.config, formatCost: value => (value * this.MSMult >= 1e6 ? format(value* this.MSMult) : formatInt(value* this.MSMult)) };
    },
    showDefaultCostDisplay() {
      const costCond = (this.showCost);
      return !this.setup.isSmall && !this.doomedRealityStudy && costCond;
    },
    customCostStr() {
      return this.setup.isSmall
        ? `${formatInt(this.config.cost * this.MSMult)} TT`
        : quantifyInt("Time Theorem", this.config.cost * this.MSMult);
    },
    doomedRealityStudy() {
      return this.study.type === TIME_STUDY_TYPE.DILATION && this.study.id === 6 && Pelle.isDoomed;
    },
    MSMult(){
      return MSCostMult();
    }
  },
  methods: {
    update() {
      const study = this.study;
      this.isUseless = Pelle.uselessTimeStudies.includes(this.study.id) && Pelle.isDoomed;
      this.isBought = study.isBought;
      this.eternityChallengeRunning = study.type === TIME_STUDY_TYPE.ETERNITY_CHALLENGE &&
        EternityChallenge.current?.id === study.id;
      if (!this.isBought) {
        this.isAvailableForPurchase = study.canBeBought && study.isAffordable;
      }
      this.isCompleteEC = this.study.type === TIME_STUDY_TYPE.ETERNITY_CHALLENGE &&
        EternityChallenge(this.study.id).remainingCompletions === 0;
    },
    handleClick() {
      if (this.specialClick === null || !this.study.isBought) this.study.purchase();
      else this.specialClick();
    },
    shiftClick() {
      if (this.study.purchaseUntil) this.study.purchaseUntil();
    }
  }
};

export class MasteryStudySetup {
  constructor(props) {
    this.study = props.study;
    this.row = props.row;
    this.column = props.column;
  }

  setPosition(layout) {
    this.top = layout.itemPosition(this.row);
    const row = layout.rows[this.row];
    this.left = row.itemPosition(this.column, layout);
    this.width = row.layout.itemWidth;
    this.height = row.layout.itemHeight;
  }

  get path() {
    return this.study.path;
  }
}
</script>

<template>
  <button
    :class="[classObject, studyClass, eternityChallengeAnim]"
    :style="styleObject"
    @click.exact="handleClick"
    @click.shift.exact="shiftClick"
  >
    <slot />
    <CostDisplay
      br
      :config="config"
      name="Time Theorem"
    />
  </button>
</template>

<style scoped>

</style>
