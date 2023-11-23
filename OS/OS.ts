import { logger, debuggerLogger } from "./Logger";
import { PCB, PStatus, RunFunctions } from "./PCB";
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
import { AdditionalMonitor } from "./StatusMonitor/AdditionalMonitor";

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
  RunFunctions,
  AdditionalMonitor,
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
      showMemoryBar?: boolean; // 显示内存状态（百分比）
      showMemoryDetail?: boolean; // 显示内存状态（具体地址）
      showProcessStatus?: boolean; // 显示进程状态
      showMemoryRate?: boolean; // 显示内存条
      showAdditional?: boolean; // 显示额外信息
    };
  }) {
    if (OS.initif) {
      logger.error("重复初始化操作系统");
      process.exit();
    }
    // 初始化CPU 数量
    CPU.CPU_COUNT = config?.hardware?.CpuCount || 1;
    // 初始化进程数量最大值
    OS.PROCESS_NUM_MAX = config?.hardware?.MaxPCB || 5;

    // 超时时间
    CPU.TIME_OUT = config?.software?.TimeOut || 0;
    // 初始化内存控制器
    MemoryController.init(
      config?.software?.MemoryAlgorithm || "NF",
      config?.hardware?.MemorySize || 128
    );
    // 初始化进程状态监视器
    if (config?.log?.showProcessStatus !== false) {
      let M1 = new ProcessStatusMonitor();
      M1.init();
      SystemStatusMonitor.MonList.push(M1);
    }
    if (config?.log?.showCPULoad !== false) {
      let M4 = new CPuLoadMonitor();
      M4.init();
      SystemStatusMonitor.MonList.push(M4);
    }
    if (config?.log?.showMemoryBar !== false) {
      let M3 = new MemoryMonitorBar();
      M3.init(config?.software?.MemoryBarLength || 20);
      SystemStatusMonitor.MonList.push(M3);
    }
    if (config?.log?.showMemoryRate !== false) {
      let M5 = new MemoryMonitorRate();
      M5.init();
      SystemStatusMonitor.MonList.push(M5);
    }
    if (config?.log?.showMemoryDetail !== false) {
      let M2 = new MemoryMonitorDetail();
      M2.init();
      SystemStatusMonitor.MonList.push(M2);
    }
    if (config?.log?.showAdditional !== false) {
      let M6 = new AdditionalMonitor();
      M6.init();
      SystemStatusMonitor.MonList.push(M6);
    }

    // SystemStatusMonitor.init();

    // 初始进程控制器
    ProcessController.init();
    // 就绪队列
    ReadyList.init();

    // 打印配置信息
    logger.info("CPU数量：", CPU.CPU_COUNT);
    logger.info("监控最大大小：", OS.PROCESS_NUM_MAX);
    logger.info("超时时间：", CPU.TIME_OUT);
    logger.info("内存大小：", MemoryController.MEMORY.MEMORY_SIZE, "KB");
    logger.info("内存分配算法：", config?.software?.MemoryAlgorithm || "NF");

    OS.initif = true;
  }
  /**
   * 启动操作系统
   */
  static async start(
    beforeDo: () => boolean | Promise<boolean>,
    afterDo: () => boolean | Promise<boolean>
  ) {
    if (!OS.initif) {
      logger.error("操作系统未初始化");
      process.exit();
    }
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
      // 打印系统状态
      SystemStatusMonitor.printSystemStatus();
      if (!(await afterDo())) {
        logger.info("进程执行后退出");
        break;
      }
      // 删除进程
      // 删除需要删除的进程
      OS.delPCBList.forEach((item) => {
        ProcessController.deletePCB(item);
      });
      OS.delPCBList = new Array<PCB>();
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

  /**
   * 需要删除的进程
   */
  static delPCBList = new Array<PCB>();
  /**
   * 检查是否还有任务
   * @returns true 没有任务
   * @returns false 有任务
   */
  static checkNoTask(): boolean {
    return (
      ReadyList.len() == 0 &&
      ProcessController.PCBList.every((item) => item == null) &&
      OS.delPCBList.length == 0 &&
      ProcessStatusMonitor.instance?.PCBStatusListHis.every((item) =>
        item.every((item) => item == PStatus.empty)
      )
    );
  }
}
