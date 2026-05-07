<template><div class="hidden"></div></template>
<script setup>
defineProps({ batch: { type: String, default: null }, visible: { type: Boolean, default: false } })
defineEmits(["close", "quiz-created"])
</script>
