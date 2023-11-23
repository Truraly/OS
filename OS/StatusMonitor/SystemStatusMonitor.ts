import chalk from "chalk";
import {
  CPU,
  logger,
  debuggerLogger,
  MemoryAlgorithm,
  MemoryBlock,
  MemoryAlgorithmFF,
  MemoryBlockFF,
  checkMemory,
  MemoryAlgorithmNF,
  MemoryBlockNF,
  MemoryController,
  Memory,
  Message_buffer,
  OS,
  PCB,
  PStatus,
  RunFunctions,
  send,
  P,
  V,
  ProcessController,
  ReadyList,
  Semasphore,
  AdditionalMonitor,
  CPuLoadMonitor,
  MemoryMonitorBar,
  MemoryMonitorDetail,
  MemoryMonitorRate,
  ProcessStatusMonitor,
  StatusMonitor,
  util,
} from "../index";
import wcwidth from "wcwidth";
export class SystemStatusMonitor {
  /**
   * 监视器列表
   */
  static MonList: Array<StatusMonitor> = [];
  //   /**
  //    * 初始化
  //    * @param Mon 需要监控的属性
  //    */
  //   static init() {}
  /**
   * 打印头部
   */
  static printHead() {
    let headstr = "|时间 |";
    SystemStatusMonitor.MonList.forEach((item) => {
      headstr += item.getHead();
    });
    logger.info(headstr);
  }
  /**
   * 打印状态
   */
  static printSystemStatus() {
    debuggerLogger.debug("CPU.CPUtime", CPU.CPUtime);
    let str = `| ${util.formatStr(
      Math.floor(CPU.CPUtime % 1000).toString(),
      3
    )} |`;
    SystemStatusMonitor.MonList.forEach((item) => {
      str += item.getStatus();
    });
    // 获取控制台宽度
    let width = process.stdout.columns - 2;
    // 添加清除颜色的字符
    logger.info(util.formatStr(str, width, "") + chalk.reset(" "));
  }
}
