/**
 * 内存模拟
 *
 * 若无特殊说明，内存大小单位均为 KB
 */
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
  util,
} from "../index";
/**
 * 内存控制对象
 */
export class MemoryController {
  /**
   * 内存对象
   */
  static memoryAlgorithm: MemoryAlgorithm = null as any;
  /**
   * 内存对象
   */
  static MEMORY: Memory = null as any;
  /**
   * 初始化
   */
  static init(Algorithm: string, memorySize: number): void {
    MemoryController.MEMORY = new Memory();
    MemoryController.MEMORY.MEMORY_SIZE = memorySize;
    switch (Algorithm) {
      case "NF":
        this.memoryAlgorithm = new MemoryAlgorithmNF();
        break;
      case "FF":
        this.memoryAlgorithm = new MemoryAlgorithmFF();
        break;
      default:
        this.memoryAlgorithm = new MemoryAlgorithmNF();
        break;
    }
    this.memoryAlgorithm.init();
  }
}

/**
 * 内存模拟抽象类
 */
export class Memory {
  /**
   * 内存大小 单位 KB
   */
  MEMORY_SIZE: number = 128;
}
