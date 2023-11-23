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
export class SystemStatusMonitor {
  /**
   * 监视器列表
   */
  static MonList: Array<StatusMonitor> = [];
  /**
   * 初始化
   * @param Mon 需要监控的属性
   */
  static init(
    Mon: Array<"PCB" | "MemoryDetail" | "MemoryBar" | "Load" | "MemoryRate">
  ) {
    Mon.forEach((item) => {
      switch (item) {
        case "PCB":
          let M1 = new ProcessStatusMonitor();
          M1.init();
          SystemStatusMonitor.MonList.push(M1);
          break;
        case "MemoryDetail":
          let M2 = new MemoryMonitorDetail();
          M2.init();
          SystemStatusMonitor.MonList.push(M2);
          break;
        case "MemoryBar":
          let M3 = new MemoryMonitorBar();
          M3.init();
          SystemStatusMonitor.MonList.push(M3);
          break;
        case "Load":
          let M4 = new CPuLoadMonitor();
          M4.init();
          SystemStatusMonitor.MonList.push(M4);
          break;
        case "MemoryRate":
          let M5 = new MemoryMonitorRate();
          M5.init();
          SystemStatusMonitor.MonList.push(M5);
          break;
      }
    });
  }
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
    logger.info(str);

    // 删除需要删除的进程
    SystemStatusMonitor.delPCB.forEach((item) => {
      ProcessController.deletePCB(item);
    });
    SystemStatusMonitor.delPCB = new Array<PCB>();
  }

  /**
   * 需要删除的进程
   */
  static delPCB = new Array<PCB>();
}
