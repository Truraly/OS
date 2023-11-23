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
  CPuLoadMonitor,
  MemoryMonitorBar,
  MemoryMonitorDetail,
  MemoryMonitorRate,
  ProcessStatusMonitor,
  StatusMonitor,
  SystemStatusMonitor,
  util,
} from "../index";
export class AdditionalMonitor extends StatusMonitor {
  /**
   * 初始化
   */
  init(): boolean {
    AdditionalMonitor.instance = this;
    return true;
  }
  /**
   * 单例对象
   */
  static instance: AdditionalMonitor | undefined;
  /**
   * getHead
   */
  getHead(): string {
    return " 附加信息";
  }
  /**
   * Message
   */
  message: string = " ";
  /**
   * 获取额外信息
   */
  getStatus(): string {
    let str = this.message;
    this.message = " ";
    return str;
  }
  /**
   * 设置额外信息
   */
  setMessage(message: string) {
    this.message += message + " ";
  }
}
