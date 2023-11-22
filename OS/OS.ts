import { logger } from "./Logger";
import { PCB, PStatus } from "./PCB";
import { ReadyList } from "./ReadyList";
import { Semasphore } from "./Semasphore";
import { Message_buffer } from "./Message_buffer";
import * as Primitives from "./Primitives";
import { CPU } from "./CPU";
import { Memory, MemoryBlock } from "./Memory";

export {
  logger,
  PCB,
  ReadyList,
  Semasphore,
  Message_buffer,
  Primitives,
  CPU,
  PStatus,
  Memory,
  MemoryBlock,
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
      Msgif?: boolean;
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
          Msgif: true,
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
    PCB.init(config_.hardware.MaxPCB);
    Memory.init();
    PCB.ewif = config_.software.Msgif;
    CPU.TIME_OUT = config_.software.TimeOut;
  }
  /**
   * 启动操作系统
   * TODO
   */
  static async start() {}

  /**
   * sleep
   */
  static sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
