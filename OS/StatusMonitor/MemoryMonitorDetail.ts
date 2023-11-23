import chalk from "chalk";
import {
  debuggerLogger,
  PCB,
  PStatus,
  ProcessController,
  util,
  OS,
  MemoryController,
  CPU,
} from "../OS";
import { StatusMonitor } from "./StatusMonitor";
export class MemoryMonitorDetail extends StatusMonitor {
  /**
   * 单例对象
   */
  static instance: MemoryMonitorDetail;
  /**
   * 初始化
   * @param BarLength 内存条长度
   */
  init(BarLength: number = 50): boolean {
    MemoryMonitorDetail.instance = this;
    return true;
  }
  /**
   * getHead
   */
  getHead(): string {
    return "内存详情";
  }
  /**
   * 获取内存条
   */
  getStatus(): string {
    let str = "";
    MemoryController.memoryAlgorithm.forEach((block, index) => {
      debuggerLogger.debug("block", block);
      let add = `${block.start} ${block.start + block.size - 1}`;
      str +=
        `|` +
        (block.status == 1
          ? chalk.bgHex("#66bc7e").bold(add)
          : chalk.bgGray.bold(add));
    });
    str += `|`;
    return str;
  }
}
