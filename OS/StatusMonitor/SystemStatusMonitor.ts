import {
  logger,
  debuggerLogger,
  PCB,
  ReadyList,
  Semasphore,
  Message_buffer,
  Primitives,
  CPU,
  PStatus,
  Memory,
  MemoryBlock,
  ProcessController,
  MemoryController,
  util,
} from "../OS";
import chalk from "chalk";
import { ProcessStatusMonitor } from "../OS";
import { MemoryMonitorBar } from "./MemoryMonitorBar";
import { MemoryMonitorDetail } from "./MemoryMonitorDetail";
import { CPuLoadMonitor } from "./CPuLoadMonitor";
import { MemoryMonitorRate } from "./MemoryMonitorRate";
import { StatusMonitor } from "./StatusMonitor";
import { AdditionalMonitor } from "./AdditionalMonitor";
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
