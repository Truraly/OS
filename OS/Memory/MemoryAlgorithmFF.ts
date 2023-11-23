import { MemoryController } from "./MemoryController";
import { MemoryAlgorithm, MemoryBlock } from "./MemoryAlgorithm";
import { debuggerLogger } from "../Logger";
/**
 * 使用首次适应算法实现内存分配 FF = First Fit
 */
export class MemoryAlgorithmFF extends MemoryAlgorithm {
  /**
   * 头指针
   */
  HEAD_POINTER: MemoryBlockFF = null as any;

  /**
   * 初始化内存
   */
  init() {
    this.HEAD_POINTER = {
      start: 0,
      size: MemoryController.MEMORY.MEMORY_SIZE,
      status: 0,
      pid: 0,
      last: null as any,
      next: null as any,
    };
    this.HEAD_POINTER.last = this.HEAD_POINTER;
    this.HEAD_POINTER.next = this.HEAD_POINTER;
  }

  /**
   * 分配内存
   * @param size 大小
   * @param pid 进程ID
   * @returns 分配块 如果分配失败则返回null
   */
  distributeMemory(size: number, pid: number): MemoryBlockFF | null {
    return (
      this.forEach((block: MemoryBlockFF, index) => {
        if (block.status == 0 && block.size >= size) {
          // 占用这个块
          block.status = 1;
          block.pid = pid;
          // 如果大小合适,直接返回
          if (block.size == size) return block;
          // 如果大小不等,分割块
          else {
            let newBlock: MemoryBlockFF = {
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
            block.size = size
            block.next = newBlock;
            return block;
          }
        }
      }) || null
    );
  }

  /**
   * 释放内存
   */
  freeMemory(block: MemoryBlockFF): MemoryBlockFF {
    block.status = 0;
    block.pid = 0;
    // 如果上一个块空闲
    while (block.last.status == 0 && block.last.start < block.start) {
      block.last.size += block.size;
      block.last.next = block.next;
      block.next.last = block.last;
      block = block.last;
    }
    // 如果下一个块空闲
    while (block.next.status == 0 && block.next.start > block.start) {
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
    callback: (block: MemoryBlockFF, index: number) => any,
    start: MemoryBlockFF = this.HEAD_POINTER
  ) {
    let temp: MemoryBlockFF = start;
    let pointer: MemoryBlockFF = start;
    let index = 0;
    let res = callback(pointer, index++);
    if (res) return res;
    pointer = pointer.next;
    // 遍历内存
    while (pointer != temp) {
      let res = callback(pointer, index++);
      if (res) return res;
      pointer = pointer.next;
      checkMemory(pointer);
    }
  }
}

/**
 * 内存分配块
 */
export interface MemoryBlockFF extends MemoryBlock {
  /**
   * 上一个
   */
  last: MemoryBlockFF;
  /**
   * 下一个
   */
  next: MemoryBlockFF;
}
/**
 * 检查内存是否合法
 */
export function checkMemory(memory: MemoryBlockFF) {
  // @ts-ignore
  if (memory == MemoryController.memoryAlgorithm.HEAD_POINTER) return;
  //   if (memory.next.last != memory) {
  //     debuggerLogger.error("memory", memory);
  //     throw new Error("内存块指针错误");
  //   }
  //   if (memory.last.next != memory) {
  //     debuggerLogger.error("memory", memory);
  //     throw new Error("内存块指针错误");
  //   }
  // if (memory.next.start < memory.start) {
  //   debuggerLogger.error("memory", memory);
  //   throw new Error("内存块指针错误");
  // }
  // if (memory.last.start > memory.start) {
  //   debuggerLogger.error("memory", memory);
  //   throw new Error("内存块指针错误");
  // }
  if (
    memory.next.start != memory.start + memory.size &&
    memory.next.start != 0
  ) {
    debuggerLogger.error("memory", memory);
    throw new Error("内存块指针错误");
  }
}
