<template>
    <div>
        <ScheduleButton
            :text="'Hide all'"
            :isActive="areAllHidden"
            @toggle-schedule="hideAllSchedules()"
        />
        <ScheduleButton
            :text="'Show all'"
            :isActive="areAllShown"
            @toggle-schedule="showAllSchedules()"
        />
    </div>
    <div>
        <ScheduleButton
            v-for="schedule in schedules"
            :key="schedule.title"
            :text="schedule.title"
            :isActive="schedule.show"
            @toggle-schedule="schedule.show = !schedule.show"
        />
    </div>
    <!-- //TODO add buttons styled like tailwind components elements badges/buttons/button groups -->
    <!-- they will all be off by default, you can turn on as many as you want, there are also buttons to toggle all -->
    <div>
        <Schedule
            v-for="schedule in schedules"
            :key="schedule.title"
            :schedule="schedule"
        />
    </div>
</template>

<script>
//TODO when all axios are done, save this day's schedules to localstorage, so that user can go back to previous days using button,
// it will just swap schedules data
import Schedule from "@/components/Schedule.vue";
import axios from "axios";
import ScheduleButton from "@/components/ScheduleButton.vue";
import cheerio from "cheerio";

const PROXY = "https://cors-proxy-schedule.herokuapp.com/";

export default {
    name: "App",
    components: {
        Schedule,
        ScheduleButton,
    },
    data() {
        return {
            schedules: {
                pr1: {
                    title: "Polskie Radio 1",
                    keywords: ["pr1"],
                    data: [],
                    show: false,
                },
                pr2: {
                    title: "Polskie Radio 2",
                    keywords: ["pr2"],
                    data: [],
                    show: false,
                },
                pr3: {
                    title: "Polskie Radio 3",
                    keywords: ["pr3"],
                    data: [],
                    show: false,
                },
                pr4: {
                    title: "Polskie Radio 4",
                    keywords: ["pr4"],
                    data: [],
                    show: false,
                },
                pr24: {
                    title: "Polskie Radio 24",
                    keywords: ["pr24"],
                    data: [],
                    show: false,
                },
                rmf: {
                    title: "RMF FM",
                    keywords: ["rmf"],
                    data: [],
                    show: false,
                },
                zet: {
                    title: "Radio ZET",
                    keywords: ["zet"],
                    data: [],
                    show: false,
                },
                tok: {
                    title: "TOK FM",
                    keywords: ["tok"],
                    data: [],
                    show: false,
                },
                poznan: {
                    title: "Radio Poznań",
                    keywords: ["poznań", "poznan"],
                    data: [],
                    show: false,
                },
            },
        };
    },
    methods: {
        showAllSchedules() {
            Object.keys(this.schedules).forEach((elem) => {
                this.schedules[elem].show = true;
            });
        },
        hideAllSchedules() {
            Object.keys(this.schedules).forEach((elem) => {
                this.schedules[elem].show = false;
            });
        },
        finalPRFilter(array) {
            const regex = /([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]/;
            return array.filter((elem, index) => {
                if (elem.match(regex) && index !== 0) {
                    if (array[index - 1].match(regex)) {
                        return false;
                    }
                }
                if (elem.trim() === "") {
                    return false;
                }
                return true;
            });
        },
        parsePR(data) {
            const $ = cheerio.load(data);
            const columns = $(".scheduleViewContainer");
            const filterPR = (data) => {
                const array = $(data)
                    .find("ul li span")
                    .filter(function () {
                        if (
                            this.attribs.class &&
                            ($(this).hasClass("programmeDescription") ||
                                $(this).hasClass("now") ||
                                $(this).hasClass(
                                    "emitedNowProgrammeStartHour"
                                ) ||
                                $(this).hasClass(
                                    "emitedNowProgrammeStopHourSpan"
                                ))
                        ) {
                            return false;
                        }
                        if ($(this).text().trim() === "-") {
                            return false;
                        }
                        return true;
                    })
                    .map(function () {
                        return $(this).text();
                    })
                    .toArray();
                return array;
            };
            this.schedules.pr1.data = this.finalPRFilter(
                filterPR(columns.get(0))
            );
            this.schedules.pr2.data = this.finalPRFilter(
                filterPR(columns.get(1))
            );
            this.schedules.pr3.data = this.finalPRFilter(
                filterPR(columns.get(2))
            );
            this.schedules.pr4.data = this.finalPRFilter(
                filterPR(columns.get(3))
            );
            this.schedules.pr24.data = this.finalPRFilter(
                filterPR(columns.get(5))
            );
        },
        parseRMF(data) {
            const $ = cheerio.load(data);
            const rmf = $("#program")
                .last()
                .contents()
                .filter(function () {
                    if (["small", "br"].includes(this.tagName)) {
                        return false;
                    }
                    if (
                        this.attribs &&
                        this.attribs.href &&
                        this.attribs.href.includes("/ludzie")
                    ) {
                        return false;
                    }
                    if (this.data && ["", "-"].includes(this.data.trim())) {
                        return false;
                    }
                    return true;
                })
                .map(function () {
                    return $(this).text().trim();
                })
                .toArray();

            this.schedules.rmf.data = rmf;
        },
        parseZET(data) {
            const $ = cheerio.load(data);
            const zet = $(
                ".schedule__schedule__list .list-element .list-element__name p"
            )
                .filter(function () {
                    const classes = this.attribs.class;
                    return (
                        classes.includes("list-element__name--time") ||
                        classes.includes("list-element__name__text")
                    );
                })
                .map(function () {
                    return $(this).text().trim();
                })
                .toArray();
            this.schedules.zet.data = zet;
        },
        parseTOK(data) {
            const $ = cheerio.load(data);
            const tokData = [];
            $("section.tok-schedule__tab_content ul.active li a").each(
                function () {
                    tokData.push(
                        $(this).find("span.tok-schedule__time").text()
                    );
                    tokData.push(
                        $(this).find("h3.tok-schedule__program--name").text()
                    );
                }
            );
            this.schedules.tok.data = tokData;
        },
        parsePoznan(data) {
            const link = this.getPoznanScheduleLink(data);
            axios
                .get(`${PROXY}${link}`, {
                    headers: { "X-Requested-With": "XMLHttpRequest" },
                })
                .then((res) => {
                    this.parsePoznanScheduleData(res.data);
                })
                .catch((error) => {
                    console.error(error);
                });
        },
        getPoznanScheduleLink(data) {
            const $ = cheerio.load(data);
            const link = $("nav ul.nav a")
                .filter(function () {
                    return $(this).text() === "Ramówka";
                })
                .get(0).attribs.href;
            return "radiopoznan.fm" + link;
        },
        parsePoznanScheduleData(data) {
            const $ = cheerio.load(data);
            const poznanData = [];

            $("#play_list li")
                .filter(function () {
                    return ["", "past", "active"].includes(this.attribs.class);
                })
                .contents()
                .filter(function () {
                    return $(this).text().trim() !== "";
                })
                .each(function () {
                    poznanData.push($(this).text().trim());
                });
            this.schedules.poznan.data = poznanData;
        },
    },
    computed: {
        areAllShown() {
            let response = true;
            Object.keys(this.schedules).forEach((elem) => {
                if (!this.schedules[elem].show) {
                    response = false;
                }
            });
            return response;
        },
        areAllHidden() {
            let response = true;
            Object.keys(this.schedules).forEach((elem) => {
                if (this.schedules[elem].show) {
                    response = false;
                }
            });
            return response;
        },
    },
    mounted() {
        //TODO save data once a day to localstorage or something, so the axios when hits and gets resposne second time
        // checks if it is the same as the saved one, if so mark this piece of data in localstorage as valid and don't
        // request the url again this day, serve cached one

        //* Polskie Radio scraping
        axios
            .get(`${PROXY}www.polskieradio.pl/Portal/Schedule/Schedule.aspx`, {
                headers: { "X-Requested-With": "XMLHttpRequest" },
            })
            .then((res) => {
                this.parsePR(res.data);
            })
            .catch((error) => {
                console.error(error);
            });

        //* RMF FM scraping
        axios
            .get(`${PROXY}www.rmf.fm/ramowka/`, {
                headers: { "X-Requested-With": "XMLHttpRequest" },
            })
            .then((res) => {
                this.parseRMF(res.data);
            })
            .catch((error) => {
                console.error(error);
            });

        //* Radio ZET scraping
        axios
            .get(`${PROXY}www.radiozet.pl/Radio/Ramowka-radiowa/`, {
                headers: { "X-Requested-With": "XMLHttpRequest" },
            })
            .then((res) => {
                this.parseZET(res.data);
            })
            .catch((error) => {
                console.error(error);
            });

        //* TOK FM scraping
        axios
            .get(`${PROXY}audycje.tokfm.pl/ramowka`, {
                headers: { "X-Requested-With": "XMLHttpRequest" },
            })
            .then((res) => {
                this.parseTOK(res.data);
            })
            .catch((error) => {
                console.error(error);
            });

        //* Radio Poznań scraping
        // starting from /kontakt, because it loads faster than main page and i need to get schedule link, which changes everyday
        axios
            .get(`${PROXY}https://radiopoznan.fm/kontakt`, {
                headers: { "X-Requested-With": "XMLHttpRequest" },
            })
            .then((res) => {
                this.parsePoznan(res.data);
            })
            .catch((error) => {
                console.error(error);
            });
    },
};
</script>

<style>
/* //TODO style it, inspire from tailwind css */
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    margin-top: 60px;
}
</style>
