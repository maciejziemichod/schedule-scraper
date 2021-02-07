<template>
    <button @click="$emit('toggle-theme')"><slot></slot></button>
</template>

<script>
export default {
    emits: ["toggle-theme"],
};
</script>

<style scoped>
</style>