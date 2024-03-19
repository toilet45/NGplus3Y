<script>
import ClassicMetaDimensionsTab from "./ClassicMetaDimensionsTab";
import ModernMetaDimensionsTab from "./ModernMetaDimensionsTab";

export default {
  name: "MetaDimensionsTab",
  components: {
    ClassicMetaDimensionsTab,
    ModernMetaDimensionsTab
  },
  computed: {
    activeComponent() {
      return this.$viewModel.newUI
        ? "ModernMetaDimensionsTab"
        : "ClassicMetaDimensionsTab";
    }
  },
};
</script>

<template>
  <component :is="activeComponent" />
</template>
