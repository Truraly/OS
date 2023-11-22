import { logger, debuggerLogger } from "./Logger";
import { PCB, PStatus } from "./PCB";
import { ReadyList } from "./ReadyList";
import { Semasphore } from "./Semasphore";
import { Message_buffer } from "./Message_buffer";
import * as Primitives from "./Primitives";
import { CPU } from "./CPU";
import { Memory, MemoryBlock } from "./Memory";
import { SystemStatusMonitor } from "./SystemStatusMonitor";
import { ProcessController } from "./ProcessController";
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
  MemoryBlock,
  SystemStatusMonitor,
  ProcessController,
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
   * 是否显示额外信息
   */
  Msgif: boolean;
}

export interface LogConfig {
  /**
   * 显示进程状态
   */
  showStatus: boolean;
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
    };
    log?: {
      showCPULoad?: boolean;
      showMemory?: boolean;
      showMemoryDetail?: boolean;
      showStatus?: boolean;
    };
  }) {
    // 提供默认配置
    let config_ = Object.assign(
      {
        hardware: {
          CpuCount: 1,
          MemorySize: 128,
          MaxPCB: 5,
        },
        software: {
          TimeOut: 0,
        },
        log: {
          showCPULoad: true,
          showMemory: true,
          showMemoryDetail: false,
          showStatus: true,
        },
      },
      config
    );

    CPU.CPU_COUNT = config_.hardware.CpuCount;
    ProcessController.init(config_.hardware.MaxPCB);
    Memory.init();
    CPU.TIME_OUT = config_.software.TimeOut;
    ReadyList.init();

    // 打印配置信息
    logger.info("CPU数量：", CPU.CPU_COUNT);
    logger.info("监控最大大小：", SystemStatusMonitor.MAX_LENGTH);
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
    while (++CPU.CPUtime) {
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
        SystemStatusMonitor.printStatus();
        break;
      }
      // 打印进程状态
      SystemStatusMonitor.printSystemStatus();
      SystemStatusMonitor.resetLoad();
    }
  }

  /**
   * sleep
   */
  static sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
