<template>
    <button :class="{ active: isActive }" @click="$emit('toggle-schedule')">
        {{ text }}
    </button>
</template>

<script>
export default {
    emits: ["toggle-schedule"],
    props: {
        text: {
            type: String,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: false,
        },
    },
};
</script>

<style scoped>
.active {
    background-color: blue;
}
</style>