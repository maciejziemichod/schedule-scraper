<template >
    <div class="container" :class="computedTheme">
        <AppNav>
            <ScheduleSelect
                @select-change="changeSchedule"
                :scheduleDates="scheduleDates"
                :selectedSchedule="currentSchedule"
            />
            <DarkModeButton @toggle-theme="toogleTheme">
                <!-- //! for some reason, without key icons don't swap -->
                <FontAwesomeIcon :icon="icon" :key="iconKey" class="fa-lg" />
            </DarkModeButton>
        </AppNav>
        <div class="remove-buttons">
            <ScheduleButtonRemove @remove-schedule="removeSchedule"
                >Remove current schedule</ScheduleButtonRemove
            >
            <ScheduleButtonRemove @remove-schedule="removeAllSchedules"
                >Remove all schedules</ScheduleButtonRemove
            >
        </div>

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
        <div>
            <Schedule
                v-for="schedule in schedules"
                :key="schedule.title"
                :schedule="schedule"
            />
        </div>
        <AppFooter />
    </div>
</template>

<script>
//TODO add search
//TODO add app description how it works, data flow etc
//TODO split the code a little bit
//TODO electron version + link in footer
//TODO make it look nicer
import Schedule from "@/components/Schedule.vue";
import ScheduleButton from "@/components/ScheduleButton.vue";
import ScheduleSelect from "@/components/ScheduleSelect.vue";
import ScheduleButtonRemove from "@/components/ScheduleButtonRemove.vue";
import DarkModeButton from "@/components/DarkModeButton.vue";
import AppNav from "@/components/AppNav.vue";
import AppFooter from "@/components/AppFooter.vue";
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
        DarkModeButton,
        AppNav,
        AppFooter,
    },
    mixins: [Date],
    data() {
        const today = this.getTodayDate();
        const regex = /([1-9]|[1-3][0-9])\.([1-9]|1[0-2])\.(20[0-9][0-9])/;
        let scheduleDates = [];
        Object.keys(localStorage).forEach((elem) => {
            if (elem.match(regex)) {
                scheduleDates.push(elem);
            }
        });
        if (scheduleDates.indexOf(today) === -1) {
            scheduleDates.unshift(today);
        }
        // convert dates to Date objects to be able to sort them, then format
        scheduleDates = scheduleDates
            .map((elem) => {
                return this.getProperDate(elem);
            })
            .sort((a, b) => {
                return b - a;
            })
            .map((elem) => {
                return this.formatDate(elem);
            });

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
            theme: "light",
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
                    this.handleRequestError(error, "poznan");
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
                    this.handleRequestError(error, "pr");
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
                    this.handleRequestError(error, "rmf");
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
                    this.handleRequestError(error, "zet");
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
                    this.handleRequestError(error, "tok");
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
                        this.handleRequestError(error, "poznan");
                        reject(error);
                    });
            });
            const promises = [pr, tok, zet, rmf, poznan];
            return Promise.all(promises);
        },
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
        toogleTheme() {
            if (this.theme === "light") {
                this.theme = "dark";
            } else {
                this.theme = "light";
            }

            //* saving theme to localstorage
            localStorage.setItem("schedule-scraper-theme", this.theme);
        },
        handleRequestError(error, schedule) {
            const errorMessage = {
                text: "Something went wrong, refresh the page",
                id: uuidv4(),
                type: "data",
            };
            const statusMessage = error.response
                ? {
                      text: `Status code: ${error.response.status}`,
                      id: uuidv4(),
                      type: "data",
                  }
                : null;

            if (schedule === "pr") {
                const prs = ["pr1", "pr2", "pr3", "pr4", "pr24"];
                prs.forEach((pr) => {
                    this.schedules[pr].data.push(errorMessage);
                    if (statusMessage) {
                        this.schedules[pr].data.push(statusMessage);
                    }
                });
            } else {
                this.schedules[schedule].data.push(errorMessage);
                if (statusMessage) {
                    this.schedules[schedule].data.push(statusMessage);
                }
            }
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
        computedTheme() {
            return this.theme === "light" ? "light-theme" : "dark-theme";
        },
        icon() {
            return this.theme === "light" ? ["fas", "moon"] : ["fas", "sun"];
        },
        iconKey() {
            return this.theme === "light" ? "moon" : "sun";
        },
    },
    mounted() {
        //* initial scraping, then saving current state to localstorage
        this.saveScraped();

        //* loading theme preferences
        const themePref = localStorage.getItem("schedule-scraper-theme");
        if (themePref) {
            this.theme = themePref;
        }
    },
};
</script>

<style>
body {
    margin: 0;
    padding: 0;
}
.light-theme {
    --font-color: #425466;
    --background-color: #ffffff;
    --hover-color: #000000;
}
.dark-theme {
    --font-color: #ebeff8;
    --background-color: #1e2933;
    --hover-color: #52597a;
}
.container {
    position: relative;
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: var(--font-color);
    background-color: var(--background-color);
    padding: 0 2rem;
    min-height: 100vh;
}
button {
    color: inherit;
    background: none;
    border: none;
    outline: none;
    padding: 0;
}
button:hover {
    cursor: pointer;
    color: var(--hover-color);
}
select {
    outline: none;
    border: none;
    border-bottom: 1px solid var(--font-color);
    color: inherit;
    background: var(--background-color);
}
a {
    color: inherit;
}
a:hover {
    color: var(--hover-color);
}
.remove-buttons {
    display: flex;
    justify-content: flex-end;
    padding: 1rem 0;
}
.remove-buttons > * {
    margin: 0 1rem;
}
</style>
