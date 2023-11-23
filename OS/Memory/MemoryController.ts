/**
 * 内存模拟
 *
 * 若无特殊说明，内存大小单位均为 KB
 */
import {
  logger,
  PCB,
  ReadyList,
  Semasphore,
  Message_buffer,
  Primitives,
  CPU,
  PStatus,
} from "../OS";
import chalk from "chalk";
import { MemoryAlgorithm, MemoryBlock } from "./MemoryAlgorithm";
import { MemoryAlgorithmNF, MemoryBlockNF } from "./MemoryAlgorithmNF";
export { MemoryAlgorithmNF, MemoryBlockNF };
import { MemoryAlgorithmFF, MemoryBlockFF } from "./MemoryAlgorithmFF";
export { MemoryAlgorithmFF, MemoryBlockFF };
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
  static init(Algorithm: string): void {
    MemoryController.MEMORY = new Memory();
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

