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
  SystemStatusMonitor,
  util,
} from "../index";
/**
 * 状态监控器抽象类
 */

export abstract class StatusMonitor {
    /**
     * 获取状态
     */
    abstract getStatus(): string;
    /**
     * 初始化
     */
    abstract init(): boolean;
    /**
     * 获取表头
     */
    abstract getHead(): string;
}
