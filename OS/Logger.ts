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
    file: {
      type: "fileSync", // use fileSync instead of file
      filename: "logs/app.log",
      maxLogSize: 10485760,
      backups: 3,
      compress: true,
      layout: {
        type: "pattern",
        pattern: "%d %p %c %m%n",
      },
    },
  },
  categories: {
    default: {
      appenders: ["OS"],
      level: "info",
    },
    debugger: {
      appenders: ["file"],
      //   level: "debug",
      level: "warn",
    },
  },
});

export const logger = Log4js.getLogger("OS");
export const debuggerLogger = Log4js.getLogger("debugger");
logger.info("-----------------------------------------------------------");
