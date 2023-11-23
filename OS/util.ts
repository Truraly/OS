import chalk from "chalk";
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
} from "./OS";
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
   */
  static formatStr(str: string, n: number) {
    if (str.length > n) {
      return str.slice(0, n - 1) + "…";
    }
    let str_ = str;
    for (let i = 0; i < n - str.length; i++) {
      str_ += " ";
    }
    return str_;
  }
}
