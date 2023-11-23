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
import { SystemStatusMonitor } from "./SystemStatusMonitor";
import { ProcessController } from "./ProcessController";
import { util } from "./util";
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
};

export interface Hardware {
  /**
   * CPU数量
   */
  CpuCount: number;
  /**
   * 内存大小
   */
  MemorySize: number;
  /**
   * 能监视的PCB数量
   */
  MaxPCB: number;
}

export interface Software {
  /**
   * CPU超时时间
   */
  TimeOut: number;
  /**
   * 内存分配算法
   */
  MemoryAlgorithm: "NF" | "FF";
  /**
   * 内存条长度
   */
  MemoryBarLength: number;
}

export interface LogConfig {
  /**
   * 显示进程状态
   */
  showProcessStatus: boolean;
  /**
   * 显示CPU负载
   */
  showCPULoad: boolean;
  /**
   * 显示内存状态（百分比）
   */
  showMemory: boolean;
  /**
   * 显示内存状态（具体地址）
   */
  showMemoryDetail: boolean;
  /**
   * 显示内存条
   */
  showMemoryRate: boolean;
}

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
      CpuCount?: number;
      MemorySize?: number;
      MaxPCB?: number;
    };
    software?: {
      TimeOut?: number;
      MemoryAlgorithm?: "NF" | "FF";
      MemoryBarLength?: number;
    };
    log?: {
      showCPULoad?: boolean;
      showMemory?: boolean;
      showMemoryDetail?: boolean;
      showProcessStatus?: boolean;
      showMemoryRate?: boolean;
    };
  }) {
    // 提供默认配置
    let config_: {
      hardware: Hardware;
      software: Software;
      log: LogConfig;
    } = {
      hardware: Object.assign(
        {
          CpuCount: 1,
          MemorySize: 128,
          MaxPCB: 5,
        },
        config?.hardware || {}
      ),
      software: Object.assign(
        {
          TimeOut: 0,
          MemoryAlgorithm: "NF",
          MemoryBarLength: 50,
        },
        config?.software || {}
      ),
      log: Object.assign(
        {
          showCPULoad: true,
          showMemory: true,
          showMemoryDetail: true,
          showProcessStatus: true,
          showMemoryRate: true,
        },
        config?.log || {}
      ),
    };
    CPU.CPU_COUNT = config_.hardware.CpuCount;
    ProcessController.init(config_.hardware.MaxPCB);
    MemoryController.init(config_.software.MemoryAlgorithm);
    CPU.TIME_OUT = config_.software.TimeOut;
    ReadyList.init();

    SystemStatusMonitor.Mon = [];

    if (config_.log.showProcessStatus) SystemStatusMonitor.Mon.push("PCB");
    if (config_.log.showCPULoad) SystemStatusMonitor.Mon.push("Load");
    if (config_.log.showMemory) SystemStatusMonitor.Mon.push("MemoryBar");
    if (config_.log.showMemoryRate) SystemStatusMonitor.Mon.push("MemoryRate");
    if (config_.log.showMemoryDetail)
      SystemStatusMonitor.Mon.push("MemoryDetail");
    SystemStatusMonitor.MEMORY_BAR_LENGTH = config_.software.MemoryBarLength;

    // 打印配置信息
    logger.info("CPU数量：", CPU.CPU_COUNT);
    logger.info("监控最大大小：", SystemStatusMonitor.MAX_LENGTH);
    logger.info("超时时间：", CPU.TIME_OUT);
    logger.info("内存大小：", MemoryController.MEMORY.MEMORY_SIZE);
    logger.info("内存分配算法：", config_.software.MemoryAlgorithm);
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
    SystemStatusMonitor.printSystemStatusHead();
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
        SystemStatusMonitor.getPCBStatus();
        break;
      }
      // 打印系统状态
      SystemStatusMonitor.printSystemStatus();
      // 刷新进程状态
      SystemStatusMonitor.flushPCBList();
    }
  }

  /**
   * sleep
   */
  static sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
