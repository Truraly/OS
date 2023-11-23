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
  StatusMonitor,
  SystemStatusMonitor,
  util,
} from "../index";
/**
 * 使用循环首次适应算法实现内存分配 NF = Next Fit
 */
export class MemoryAlgorithmNF extends MemoryAlgorithm {
  /**
   * 内存访问指针
   */
  MEMORY_POINTER: MemoryBlockNF = null as any;
  /**
   * 头指针
   */
  HEAD_POINTER: MemoryBlockNF = null as any;

  /**
   * 初始化内存
   */
  init() {
    this.MEMORY_POINTER = {
      start: 0,
      size: MemoryController.MEMORY.MEMORY_SIZE,
      status: 0,
      pid: 0,
      last: null as any,
      next: null as any,
    };
    this.MEMORY_POINTER.last = this.MEMORY_POINTER;
    this.MEMORY_POINTER.next = this.MEMORY_POINTER;
    this.HEAD_POINTER = this.MEMORY_POINTER;
  }

  /**
   * 分配内存
   * @param size 大小
   * @param pid 进程ID
   * @returns 分配块 如果分配失败则返回null
   */
  distributeMemory(size: number, pid: number): MemoryBlockNF | null {
    // logger.info("start Memory.MEMORY_POINTER", Memory.MEMORY_POINTER.start);
    return (
      this.forEach((block: MemoryBlockNF, index) => {
        this.MEMORY_POINTER = block;
        if (block.status == 0 && block.size >= size) {
          // 占用这个块
          block.status = 1;
          block.pid = pid;
          // 如果大小合适,直接返回
          if (block.size == size) return block;
          // 如果大小不等
          else {
            let newBlock: MemoryBlockNF = {
              start: block.start + size,
              size: block.size - size,
              status: 0,
              pid: 0,
              last: block,
              next: block.next,
            };
            // 前后合并
            newBlock = this.freeMemory(newBlock);
            // 修改指针
            block.next.last = newBlock;
            // 修改指针
            block.size = size;
            block.next = newBlock;
            return block;
          }
        }
      }, this.MEMORY_POINTER.next) || null
    );
  }

  /**
   * 释放内存
   */
  freeMemory(block: MemoryBlockNF): MemoryBlockNF {
    block.status = 0;
    block.pid = 0;
    // 如果上一个块空闲
    while (block.last.status == 0 && block.last.start < block.start) {
      if (block == this.MEMORY_POINTER) this.MEMORY_POINTER = block.last;
      block.last.size += block.size;
      block.last.next = block.next;
      block.next.last = block.last;
      block = block.last;
    }
    // 如果下一个块空闲
    while (block.next.status == 0 && block.next.start > block.start) {
      if (block.next == this.MEMORY_POINTER) this.MEMORY_POINTER = block;
      block.size += block.next.size;
      block.next = block.next.next;
      block.next.last = block;
    }
    return block;
  }

  /**
   * 遍历内存
   */
  forEach(
    callback: (block: MemoryBlockNF, index: number) => any,
    start: MemoryBlockNF = this.HEAD_POINTER
  ) {
    let temp: MemoryBlockNF = start;
    let pointer: MemoryBlockNF = start;
    let index = 0;
    let res = callback(pointer, index++);
    if (res) return res;
    pointer = pointer.next;
    // 遍历内存
    while (pointer != temp) {
      let res = callback(pointer, index++);
      if (res) return res;
      pointer = pointer.next;
    }
  }
}

/**
 * 内存分配块
 */
export interface MemoryBlockNF extends MemoryBlock {
  /**
   * 上一个
   */
  last: MemoryBlockNF;
  /**
   * 下一个
   */
  next: MemoryBlockNF;
}
