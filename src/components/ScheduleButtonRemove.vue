<template>
    <button @click="$emit('remove-schedule')">
        <slot></slot>
    </button>
</template>

<script>
export default {
    emits: ["remove-schedule"],
};
</script>

<style scoped>
</style>