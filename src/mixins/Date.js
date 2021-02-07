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
      const dateArr = date.split(".");
      const swapped = [dateArr[1], dateArr[0], dateArr[2]];
      const yesterday = new Date(swapped.join("."));
      yesterday.setDate(yesterday.getDate() - 1);
      return this.formatDate(yesterday);
    },
  },
};
