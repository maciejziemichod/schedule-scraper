<template>
    <button
        class="btn"
        :class="{ active: isActive }"
        @click="$emit('toggle-schedule')"
    >
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

<style>
.btn {
    margin: 0 0.5rem;
}
.btn:first-of-type {
    margin-left: 0;
}
.active {
    color: #635bff;
}
</style>