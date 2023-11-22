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
      type: "file",
      filename: "logs/app.log",
      maxLogSize: 10485760, // max size for log file, in bytes. Once this size is reached, a new log file will be created.
      backups: 3, // number of backup files to keep
      compress: true, // compress the backups
    },

  },
  categories: {
    default: {
      appenders: ["OS", "file"], // both appenders will now be used
      level: "info",
    },
    debugger: {
        appenders: ["OS", "file"],
        level: "debug",
    }
  },
});

export const logger = Log4js.getLogger("OS");
export const debuggerLogger = Log4js.getLogger("debugger");
logger.info("-----------------------------------------------------------");
