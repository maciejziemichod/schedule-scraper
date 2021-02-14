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
    margin: 0 0.8rem 0.3rem 0;
    padding: 0.3rem 0.7rem;
    border: 1px solid var(--font-color);
    border-radius: 0.3rem;
}
.btn:first-of-type {
    margin-left: 0;
}
.btn:hover {
    background-color: var(--font-color);
    color: var(--background-color);
    border-color: var(--font-color);
}
.active {
    background-color: #635bff;
    border-color: #635bff;
    color: var(--background-color);
}
</style>