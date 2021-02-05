<template>
    <div v-show="schedule.show">
        <h1>{{ schedule.title }}</h1>
        <div class="schedule">
            <div
                v-for="(program, index) in schedule.data"
                :key="program"
                :class="scheduleClass(program, index)"
            >
                {{ program }}
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        schedule: {
            required: true,
            validator: function (value) {
                if (typeof value !== "object") {
                    return false;
                }
                if (
                    !value.title ||
                    !value.keywords ||
                    !value.data ||
                    !Object.keys(value).includes("show")
                ) {
                    return false;
                }
                if (typeof value.title !== "string") {
                    return false;
                }
                if (
                    !Array.isArray(value.keywords) ||
                    !Array.isArray(value.data)
                ) {
                    return false;
                }
                return true;
            },
        },
    },
    methods: {
        scheduleClass(program, index) {
            if (!program) {
                return "";
            }
            const regex = /([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]/;
            if (program.match(regex)) {
                return "time";
            } else {
                const classes = ["data"];
                if (
                    index !== 0 &&
                    !this.schedule.data[index - 1].match(regex)
                ) {
                    //* when data is after data in array, "fw" adds left padding to the data div so the time div is always on the left
                    classes.push("fw");
                }
                return classes;
            }
        },
    },
};
</script>

<style scoped>
:root {
    --padding: 10px;
}
.data,
.time {
    display: inline-block;
}
.data {
    width: 80%;
}
.data.fw,
.data:first-of-type {
    padding-left: 20%;
}
.time {
    padding-top: 10px;
    width: 20%;
}
.time:not(:first-of-type):before {
    content: "";
    display: block;
    position: relative;
    bottom: 5px;
    width: calc(100vw - 35px);
    height: 0;
    border-top: solid 1px black;
}
</style>