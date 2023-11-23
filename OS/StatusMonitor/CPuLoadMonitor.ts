import chalk from "chalk";
import {
  debuggerLogger,
  PCB,
  PStatus,
  ProcessController,
  util,
  OS,
  CPU,
} from "../OS";
import { StatusMonitor } from "./StatusMonitor";
export class CPuLoadMonitor extends StatusMonitor {
  /**
   * 初始化
   */
  init(): boolean {
    CPuLoadMonitor.instance = this;
    this.loadCount = 0;
    return true;
  }
  /**
   * 单例对象
   */
  static instance: CPuLoadMonitor;
  /**
   * getHead
   */
  getHead(): string {
    return util.formatStr("负载", Math.max(CPU.CPU_COUNT, 4) - 2) + "|";
  }
  /**
   * 负载计数
   */
  loadCount: number;
  /**
   * 获取负载
   */
  getStatus(): string {
    let str = "";
    for (let i = 0; i < this.loadCount; i++) {
      str += "*";
    }
    return util.formatStr(str, Math.max(CPU.CPU_COUNT, 4)) + "|";
  }

}
