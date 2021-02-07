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
        let date = this.getTodayDate();
        const scheduleDates = [date];
        date = this.getDayBefore(date);
        while (localStorage.getItem(date)) {
            scheduleDates.push(date);
            date = this.getDayBefore(date);
        }
        return {
            scheduleDates,
            selected: this.getTodayDate(),
        };
    },
    emits: ["select-change"],
};
</script>

<style scoped>
</style>