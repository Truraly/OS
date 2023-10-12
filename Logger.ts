import Log4js from "log4js";
Log4js.configure({
  appenders: {
    OS: {
      type: "console",
      layout: {
        type: "pattern",
        pattern: "%m",
      },
    },
  },
  categories: {
    default: {
      appenders: ["OS"],
        // level: "debug",
      level: "info",
    },
  },
});

export const logger = Log4js.getLogger("OS");
