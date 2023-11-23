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
  MemoryMonitorBar,
  MemoryMonitorDetail,
  MemoryMonitorRate,
  ProcessStatusMonitor,
  StatusMonitor,
  SystemStatusMonitor,
  util,
} from "../index";
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
  static instance: CPuLoadMonitor | undefined;
  /**
   * getHead
   */
  getHead(): string {
    return util.formatStr("负载", Math.max(CPU.CPU_COUNT, 4)) + "|";
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
  /**
   * 设置负载
   */
  setLoad(load: number) {
    this.loadCount = load;
  }
}
