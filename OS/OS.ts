import { logger, debuggerLogger } from "./Logger";
import { PCB, PStatus } from "./PCB";
import { ReadyList } from "./ReadyList";
import { Semasphore } from "./Semasphore";
import { Message_buffer } from "./Message_buffer";
import * as Primitives from "./Primitives";
import { CPU } from "./CPU";
import {
  MemoryAlgorithmNF,
  MemoryBlockNF,
  MemoryController,
  Memory,
} from "./Memory/MemoryController";
import { SystemStatusMonitor } from "./StatusMonitor/SystemStatusMonitor";

import { ProcessController } from "./ProcessController";
import { util } from "./util";

import { CPuLoadMonitor } from "./StatusMonitor/CPuLoadMonitor";
import { MemoryMonitorBar } from "./StatusMonitor/MemoryMonitorBar";
import { MemoryMonitorDetail } from "./StatusMonitor/MemoryMonitorDetail";
import { MemoryMonitorRate } from "./StatusMonitor/MemoryMonitorRate";
import { ProcessStatusMonitor } from "./StatusMonitor/ProcessStatusMonitor";

export {
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
  MemoryAlgorithmNF as MemoryNF,
  MemoryBlockNF as MemoryBlock,
  MemoryController,
  SystemStatusMonitor,
  ProcessController,
  util,
  ProcessStatusMonitor,
  CPuLoadMonitor,
  MemoryMonitorBar,
  MemoryMonitorDetail,
  MemoryMonitorRate,
};

export class OS {
  /**
   * 初始化操作系统
   */
  static initif: boolean = false;
  /**
   * 初始化操作系统
   * @param config
   */
  static init(config?: {
    hardware?: {
      CpuCount?: number; // CPU数量
      MemorySize?: number; // 内存大小
      MaxPCB?: number; // 能监视的PCB数量
    };
    software?: {
      TimeOut?: number; // CPU超时时间
      MemoryAlgorithm?: "NF" | "FF"; // 内存分配算法
      MemoryBarLength?: number; // 内存条长度
    };
    log?: {
      showCPULoad?: boolean; // 显示CPU负载
      showMemory?: boolean; // 显示内存状态（百分比）
      showMemoryDetail?: boolean; // 显示内存状态（具体地址）
      showProcessStatus?: boolean; // 显示进程状态
      showMemoryRate?: boolean; // 显示内存条
    };
  }) {
    // 初始化CPU 数量
    CPU.CPU_COUNT = config?.hardware?.CpuCount || 1;
    // 超时时间
    CPU.TIME_OUT = config?.software?.TimeOut || 0;

    // 初始进程控制器
    ProcessController.init();
    // 初始化内存控制器
    MemoryController.init(config?.software?.MemoryAlgorithm || "NF");
    // 就绪队列
    ReadyList.init();
    // 初始化进程数量大小
    OS.PROCESS_NUM_MAX = config?.hardware?.MaxPCB || 5;
    // 内存长度
    MemoryController.MEMORY.MEMORY_SIZE = config?.hardware?.MemorySize || 128;
    // 打印配置信息
    logger.info("CPU数量：", CPU.CPU_COUNT);
    logger.info("监控最大大小：", OS.PROCESS_NUM_MAX);
    logger.info("超时时间：", CPU.TIME_OUT);
    logger.info("内存大小：", MemoryController.MEMORY.MEMORY_SIZE);
    logger.info("内存分配算法：", config?.software?.MemoryAlgorithm || "NF");
    // 初始化系统状态监视器
    let Marr: Array<
      "PCB" | "MemoryDetail" | "MemoryBar" | "Load" | "MemoryRate"
    > = [];
    if (config?.log?.showProcessStatus || true) Marr.push("PCB");
    if (config?.log?.showCPULoad || true) Marr.push("Load");
    if (config?.log?.showMemory || true) Marr.push("MemoryBar");
    if (config?.log?.showMemoryRate || true) Marr.push("MemoryRate");
    if (config?.log?.showMemoryDetail || true) Marr.push("MemoryDetail");
    SystemStatusMonitor.init(Marr);
  }
  /**
   * 启动操作系统
   */
  static async start(
    beforeDo: () => boolean | Promise<boolean>,
    afterDo: () => boolean | Promise<boolean>
  ) {
    /**
     * 程序运行
     */
    logger.info("CPU开始运行");
    logger.info("-----------------------------------------------------------");
    SystemStatusMonitor.printHead();
    // 计数器+1
    while (true) {
      // 执行前
      if (!(await beforeDo())) {
        logger.info("进程执行前退出");
        // 推出程序并打印进程状态
        SystemStatusMonitor.printSystemStatus();
        break;
      }
      // 定时跳出
      if (CPU.CPUtime > CPU.TIME_OUT && CPU.TIME_OUT != 0) {
        logger.warn("进程执行超时");
        logger.warn("ReadyList.readyList:", ReadyList.readyList);
        break;
      }
      // 输出就绪队列
      logger.debug("就绪队列：", ReadyList.Print());
      // 执行进程
      CPU.main();
      //   console.log(PCB.PCBStatusList);
      if (!(await afterDo())) {
        logger.info("进程执行后退出");
        // 推出程序并打印进程状态
        SystemStatusMonitor.printSystemStatus();
        break;
      }
      // 打印系统状态
      SystemStatusMonitor.printSystemStatus();
    }
  }

  /**
   * sleep
   */
  static sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 进程上限
   */
  static PROCESS_NUM_MAX: number = 5;
}
