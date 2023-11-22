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
} from "../OS/OS";
/**
 * 内存模拟对象
 * 使用循环首次适应算法实现内存分配 NF
 */
export class Memory {
  /**
   * 内存大小 单位 KB
   */
  static MEMORY_SIZE = 128;
  /**
   * 内存访问指针
   */
  static MEMORY_POINTER: MemoryBlock = null as any;
  /**
   * 头指针
   */
  static HEAD_POINTER: MemoryBlock = null as any;

  /**
   * 初始化内存
   */
  static init() {
    Memory.MEMORY_POINTER = {
      start: 0,
      size: Memory.MEMORY_SIZE,
      status: 0,
      pid: 0,
      last: null as any,
      next: null as any,
    };
    Memory.MEMORY_POINTER.last = Memory.MEMORY_POINTER;
    Memory.MEMORY_POINTER.next = Memory.MEMORY_POINTER;
    Memory.HEAD_POINTER = Memory.MEMORY_POINTER;
  }

  /**
   * 分配内存
   * @param size 大小
   * @param pid 进程ID
   * @returns 分配块 如果分配失败则返回null
   */
  static distributeMemory(size: number, pid: number): MemoryBlock | null {
    let temp: MemoryBlock = Memory.MEMORY_POINTER;
    let pointer: MemoryBlock = Memory.MEMORY_POINTER;
    pointer = pointer.next;
    if (pointer == temp && pointer.size >= size && pointer.status == 0) {
      pointer.status = 1;
      pointer.pid = pid;
      let newBlock: MemoryBlock = {
        start: pointer.start + size,
        size: pointer.size - size,
        status: 0,
        pid: 0,
        last: pointer,
        next: pointer.next,
      };
      // 修改指针
      pointer.size = size;
      pointer.next = newBlock;
      return pointer;
    }
    // 遍历内存
    while (pointer != temp) {
      // 如果当前块空闲且大小足够
      if (pointer.status == 0 && pointer.size >= size) {
        // 如果大小相等
        pointer.status = 1;
        pointer.pid = pid;
        if (pointer.size == size) {
          return pointer;
        } else {
          // 如果大小不等
          let newBlock: MemoryBlock = {
            start: pointer.start + size,
            size: pointer.size - size,
            status: 0,
            pid: 0,
            last: pointer,
            next: pointer.next,
          };
          // 修改指针
          pointer.size = size;
          pointer.next = newBlock;
          return pointer;
        }
      }
      // 指针后移
      pointer = pointer.next;
    }
    // 如果分配失败
    return null;
  }

  /**
   * 释放内存
   */
  static freeMemory(block: MemoryBlock) {
    block.status = 0;
    block.pid = 0;
    // 如果上一个块空闲，并且不是头指针
    if (block.last.status == 0 && block != Memory.HEAD_POINTER) {
      block.last.size += block.size;
      block.last.next = block.next;
      block.next.last = block.last;
      block = block.last;
    }
    // 如果下一个块空闲，并且不是头指针
    if (block.next.status == 0 && block.next != Memory.HEAD_POINTER) {
      block.size += block.next.size;
      block.next = block.next.next;
      block.next.last = block;
    }
  }

  /**
   * 打印内存
   */
  static print() {
    let str = "";
    let temp: MemoryBlock = Memory.HEAD_POINTER;
    let pointer: MemoryBlock = Memory.HEAD_POINTER;
    str += `|${pointer.start} S:${pointer.status} ${
      pointer.start + pointer.size - 1
    }`;
    pointer = pointer.next;
    // 遍历内存
    while (pointer != temp) {
      str += `|${pointer.start} S:${pointer.status} ${
        pointer.start + pointer.size - 1
      }`;
      pointer = pointer.next;
    }
    str += `|`;
    logger.info("内存:", str);
  }
}

/**
 * 内存分配块
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
  /**
   * 上一个
   */
  last: MemoryBlock;
  /**
   * 下一个
   */
  next: MemoryBlock;
}
