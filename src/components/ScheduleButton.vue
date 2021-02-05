<template>
    <button @click="$emit('toggle-schedule')">{{ text }}</button>
</template>

<script>
export default {
    emits: ["toggle-schedule"],
    props: {
        text: {
            type: String,
            required: true,
        },
    },
};
</script>

<style scoped>
</style>