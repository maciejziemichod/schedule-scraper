<template>
    <select v-model="selected" @change="$emit('select-change', selected)">
        <option v-for="date in scheduleDates" :value="date" :key="date">
            {{ date }}
        </option>
    </select>
</template>

<script>
import Date from "@/mixins/Date.js";

export default {
    mixins: [Date],
    data() {
        return {
            selected: this.selectedSchedule,
        };
    },
    props: {
        scheduleDates: {
            type: Array,
            required: true,
        },
        selectedSchedule: {
            type: String,
            required: true,
        },
    },
    emits: ["select-change"],
    watch: {
        selectedSchedule(newVal) {
            this.selected = newVal;
        },
    },
};
</script>

<style scoped>
</style>