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
  SystemStatusMonitor,
} from "./index";
import wcwidth from "wcwidth";
export class util {
  /**
   * 获取指定数量的空位
   */
  static getEmpty(n: number): string {
    let str = "";
    for (let i = 0; i < n; i++) {
      str += " ";
    }
    return str;
  }
  /**
   * 将字符出传转为指定背景的字符
   * @param str 字符串
   */
  static getBgColor(str: string) {
    return [chalk.bgHex("#262626"), chalk.white][CPU.CPUtime % 2](str);
  }
  /**
   * 截取字符串 不足补空格
   * @param str 字符串
   * @param n 截取长度
   * @param fillStr 填充字符
   * 忽略改变颜色的字符
   */
  static formatStr(str: string, n: number, fillStr: string = " "): string {
    let length = 0;
    // 如果有中文，占两个字符
    for (let i = 0; i < str.length; i++) {
      if (str[i] == "\u001b") {
        // 跳过改变颜色的字符
        while (str[i] != "m") {
          i++;
        }
        continue;
      }
      length += wcwidth(str[i]);
      if (length > n) {
        return str.slice(0, i) + "…";
      }
    }
    for (let i = 0; i < n - length; i++) {
      str += fillStr;
    }
    return str;
  }
}
