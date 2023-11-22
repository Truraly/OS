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
import chalk from "chalk";
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
    // logger.info("start Memory.MEMORY_POINTER", Memory.MEMORY_POINTER.start);
    return (
      Memory.forEach((block: MemoryBlock, index) => {
        Memory.MEMORY_POINTER = block;
        if (block.status == 0 && block.size >= size) {
          // 占用这个块
          block.status = 1;
          block.pid = pid;
          // 如果大小合适,直接返回
          if (block.size == size) return block;
          // 如果大小不等
          else {
            let newBlock: MemoryBlock = {
              start: block.start + size,
              size: block.size - size,
              status: 0,
              pid: 0,
              last: block,
              next: block.next,
            };
            // 前后合并
            newBlock = Memory.freeMemory(newBlock);
            // 修改指针
            block.next.last = block;
            // 修改指针
            block.size = size;
            block.next = newBlock;
            return block;
          }
        }
      }, Memory.MEMORY_POINTER.next) || null
    );
  }

  /**
   * 释放内存
   */
  static freeMemory(block: MemoryBlock): MemoryBlock {
    block.status = 0;
    block.pid = 0;
    // 如果上一个块空闲
    while (block.last.status == 0 && block.last.start < block.start) {
      if (block == Memory.MEMORY_POINTER) Memory.MEMORY_POINTER = block.last;
      block.last.size += block.size;
      block.last.next = block.next;
      block.next.last = block.last;
      block = block.last;
    }
    // 如果下一个块空闲
    while (block.next.status == 0 && block.next.start > block.start) {
      if (block.next == Memory.MEMORY_POINTER) Memory.MEMORY_POINTER = block;
      block.size += block.next.size;
      block.next = block.next.next;
      block.next.last = block;
    }
    return block;
  }

  /**
   * 打印内存
   */
  static print(ret: boolean = false) {
    let str = "";
    Memory.forEach((block, index) => {
      let add = `${block.start} ${block.start + block.size - 1}`;
      str +=
        `|` +
        (block.status == 1
          ? chalk.bgHex("#66bc7e").bold(add)
          : chalk.bgGray.bold(add));
    });
    str += `|`;
    if (!ret) logger.info("内存:", str);
    else return str;
  }

  /**
   * 打印内存 进度条形式
   * @param len 进度条长度
   * @param ret 是否返回
   */
  static print2(len: number, ret: boolean = false) {
    let str = "";
    let p = Memory.MEMORY_SIZE / len;
    // 统计每一段内存被占用的数量
    let arr = new Array(len).fill(0);
    Memory.forEach((block, index) => {
      // logger.warn(block.status);
      if (block.status == 0) return;
      let start = block.start;
      let end = block.start + block.size - 1;
      for (let i = start; i <= end; i++) {
        arr[Math.floor(i / p)]++;
      }
    });
    // 绘制进度条
    // 小于33% 灰色 33%-66% 浅绿 66%-100% 绿
    arr.forEach((v) => {
      v = (v / p) * 100;
      if (v < 33) {
        str += chalk.bgGray(" ");
      } else if (v < 66) {
        str += chalk.bgHex("#66bc7e")(" ");
      } else {
        str += chalk.bgHex("#2a9d8f")(" ");
      }
    });
    if (!ret) logger.info("内存:", str);
    else return str;
  }

  /**
   * 遍历内存
   */
  static forEach(
    callback: (block: MemoryBlock, index: number) => any,
    start: MemoryBlock = Memory.HEAD_POINTER
  ) {
    let temp: MemoryBlock = start;
    let pointer: MemoryBlock = start;
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
