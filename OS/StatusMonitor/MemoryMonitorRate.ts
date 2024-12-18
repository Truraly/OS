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
  ProcessStatusMonitor,
  StatusMonitor,
  SystemStatusMonitor,
  util,
} from "../index";
export class MemoryMonitorRate extends StatusMonitor {
  /**
   * 单例对象
   */
  static instance: MemoryMonitorRate;
  /**
   * 初始化
   * @param BarLength 内存条长度
   */
  init(BarLength: number = 50): boolean {
    MemoryMonitorRate.instance = this;
    return true;
  }
  /**
   * getHead
   */
  getHead(): string {
    return "MRate|";
  }
  /**
   * 获取内存使用率,返回百分比,保留1位小数
   */
  getStatus(): string {
    let UseCount = 0;
   MemoryController.memoryAlgorithm.forEach((block, index) => {
      if (block.status == 1) UseCount += block.size;
    });
    return (
     util.formatStr(
        (
          Math.round((UseCount /MemoryController.MEMORY.MEMORY_SIZE) * 1000) /
          10
        ).toString() + "%",
        5
      ) + "|"
    );
  }
}
