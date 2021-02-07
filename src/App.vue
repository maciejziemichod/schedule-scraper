<template>
    <ScheduleSelect
        @select-change="changeSchedule"
        :scheduleDates="scheduleDates"
        :selectedSchedule="currentSchedule"
    />
    <ScheduleButtonRemove @remove-schedule="removeSchedule"
        >Remove current schedule</ScheduleButtonRemove
    >
    <ScheduleButtonRemove @remove-schedule="removeAllSchedules"
        >Remove all schedules</ScheduleButtonRemove
    >

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
//TODO add app description how it works, data flow etc
import Schedule from "@/components/Schedule.vue";
import ScheduleButton from "@/components/ScheduleButton.vue";
import ScheduleSelect from "@/components/ScheduleSelect.vue";
import ScheduleButtonRemove from "@/components/ScheduleButtonRemove.vue";
//TODO switch from axios to fetch
import axios from "axios";
import cheerio from "cheerio";
import { v4 as uuidv4 } from "uuid";
import Date from "@/mixins/Date.js";

const PROXY =
    process.env.NODE_ENV === "development"
        ? "http://localhost:3000/"
        : "https://cors-proxy-schedule.herokuapp.com/";

export default {
    name: "App",
    components: {
        Schedule,
        ScheduleButton,
        ScheduleSelect,
        ScheduleButtonRemove,
    },
    mixins: [Date],
    data() {
        let date = this.getTodayDate();
        const scheduleDates = [date];
        date = this.getDayBefore(date);
        while (localStorage.getItem(date)) {
            scheduleDates.push(date);
            date = this.getDayBefore(date);
        }
        const today = this.getTodayDate();
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
            currentSchedule: today,
            scheduleDates,
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
            return this.prepareData(
                array.filter((elem, index) => {
                    if (elem.match(regex) && index !== 0) {
                        if (array[index - 1].match(regex)) {
                            return false;
                        }
                    }
                    if (elem.trim() === "") {
                        return false;
                    }
                    return true;
                })
            );
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

            this.schedules.rmf.data = this.prepareData(rmf);
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
            this.schedules.zet.data = this.prepareData(zet);
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
            this.schedules.tok.data = this.prepareData(tokData);
        },
        parsePoznan(data) {
            const link = this.getPoznanScheduleLink(data);
            //* it has to return a promise, otherwhise scrape().then won't wait for it to end
            return axios
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
            this.schedules.poznan.data = this.prepareData(poznanData);
        },
        prepareData(data) {
            // it adds id and type for each piece of data
            const regex = /([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]/;
            return data.map((text, index) => {
                const type = text.match(regex) ? "time" : ["data"];
                if (
                    type !== "time" &&
                    index !== 0 &&
                    !data[index - 1].match(regex)
                ) {
                    // when data is after data in array, "fw" adds left padding to the data div so the time div is always on the left
                    type.push("fw");
                }
                return { text, id: uuidv4(), type };
            });
        },
        scrape() {
            //* Polskie Radio scraping
            const pr = axios
                .get(
                    `${PROXY}www.polskieradio.pl/Portal/Schedule/Schedule.aspx`,
                    {
                        headers: { "X-Requested-With": "XMLHttpRequest" },
                    }
                )
                .then((res) => {
                    this.parsePR(res.data);
                })
                .catch((error) => {
                    console.error(error);
                });

            //* RMF FM scraping
            const rmf = axios
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
            const zet = axios
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
            const tok = axios
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
            const poznan = new Promise((resolve, reject) => {
                axios
                    .get(`${PROXY}https://radiopoznan.fm/kontakt`, {
                        headers: { "X-Requested-With": "XMLHttpRequest" },
                    })
                    .then((res) => {
                        this.parsePoznan(res.data).then(() => {
                            resolve();
                        });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
            const promises = [pr, tok, zet, rmf, poznan];
            return Promise.all(promises);
        },
        //TODO remove it later
        log(value = "") {
            console.log("test", value);
        },
        //TODO add ability to remove certain schedules, as well as remove all of them
        changeSchedule(date) {
            this.currentSchedule = date;
            this.schedules = JSON.parse(localStorage.getItem(date));
        },
        removeSchedule(date = this.currentSchedule) {
            localStorage.removeItem(date);
            if (date !== this.getTodayDate()) {
                this.scheduleDates.splice(this.scheduleDates.indexOf(date), 1);
            } else {
                // when removing today, scrape schedules again
                this.saveScraped().then(() => {
                    this.changeSchedule(this.getTodayDate());
                });
            }
        },
        removeAllSchedules() {
            // desctructuring because removeSchedule mutates scheduleDates
            [...this.scheduleDates].forEach((date) => {
                this.removeSchedule(date);
            });
        },
        saveScraped() {
            return new Promise((resolve) => {
                this.scrape().then(() => {
                    localStorage.setItem(
                        this.getTodayDate(),
                        JSON.stringify(this.schedules)
                    );
                    resolve();
                });
            });
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
        //* initial scraping, then saving current state to localstorage
        this.saveScraped();
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
