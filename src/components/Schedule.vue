<template>
    <div v-show="schedule.show">
        <h1>{{ schedule.title }}</h1>
        <div class="schedule">
            <div
                v-for="elem in schedule.data"
                :key="elem.id"
                :class="elem.type"
            >
                {{ elem.text }}
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