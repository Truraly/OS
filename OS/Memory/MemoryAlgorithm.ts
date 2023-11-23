/**
 * 分配算法抽象类
 */
export abstract class MemoryAlgorithm {
  /**
   * 分配内存
   */
  abstract distributeMemory(size: number, pid: number): MemoryBlock | null;
  /**
   * 释放内存
   */
  abstract freeMemory(block: MemoryBlock): MemoryBlock;
  /**
   * 初始化内存
   */
  abstract init(): void;
  /**
   * 遍历内存
   */
  abstract forEach(
    callback: (block: MemoryBlock, index: number) => any,
    start?: MemoryBlock
  ): any;
}

/**
 * MemoryBlock
 */
export interface MemoryBlock {
  /**
   * 起始地址
   */
  start: number;
  /**
   * 大小
   */
  size: number;
  /**
   * 状态
   * @example 0 空闲
   * @example 1 已分配
   */
  status: number;
  /**
   * 进程ID
   */
  pid: number;
}
