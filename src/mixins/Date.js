export default {
  methods: {
    formatDate(date) {
      return [date.getDate(), date.getMonth() + 1, date.getFullYear()].join(
        "."
      );
    },
    getTodayDate() {
      return this.formatDate(new Date());
    },
    getDayBefore(date) {
      const yesterday = this.getProperDate(date);
      yesterday.setDate(yesterday.getDate() - 1);
      return this.formatDate(yesterday);
    },
    getProperDate(date) {
      const dateArr = date.split(".");
      const swapped = [dateArr[1], dateArr[0], dateArr[2]];
      const properDate = new Date(swapped.join("."));
      return properDate;
    },
  },
};
