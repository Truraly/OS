import chalk from "chalk";
import process from "process";
import {
  logger,
  ReadyList,
  Semasphore,
  Message_buffer,
  Primitives,
  Memory,
  MemoryBlock,
  SystemStatusMonitor,
  CPU,
  ProcessController,
} from "./OS";

export class PCB {
  //////////////////////////////////////////////////////////////
  // 对象属性
  /**
   * PID
   */
  readonly pid: string;
  /**
   * 进程名
   */
  readonly pname: string;
  /**
   * 进程函数列表
   * @param p 进程
   * @returns 0 被阻塞
   * @returns 1 程序正常执行
   * @returns 2 当前fun需要再次执行
   */
  funs: Array<(p: PCB) => number>;
  /**
   * 进程剩余任务量
   */
  needTime: number;
  /**
   * 进程加入时间
   */
  joinTime: number;
  /**
   * 进程状态
   * 0:空位，1:就绪，2:执行，3:阻塞，4:已执行完毕，5:运作转阻塞，6:已删除
   */
  status: PStatus;

  /**
   * 优先级
   */
  priority: number;

  /**
   * 消息队列队首指针
   */
  front: Message_buffer | null;
  /**
   * 消息队列互斥信号量
   */
  mutex: Semasphore;
  /**
   * 消息队列非空信号量
   * 0 阻塞
   * 1 执行
   */
  sm: Semasphore;
  /**
   * 分配的内存块
   */
  memory: MemoryBlock | null = null;
}

/**
 * 进程状态
 * 0:空位，1:就绪，2:执行，3:阻塞，4:已执行完毕，5:运作转阻塞，6:已删除
 */
export enum PStatus {
  /**
   * 空位
   */
  empty = 0,
  /**
   * 就绪
   */
  ready = 1,
  /**
   * 执行
   */
  run = 2,
  /**
   * 阻塞
   */
  block = 3,
  /**
   * 执行->完毕
   */
  finish = 4,
  /**
   * 运作->阻塞
   */
  runToBlock = 5,
  /**
   * 已删除（用于渲染空行）
   * 释放PCB
   */
  deleted = 6,
  /**
   * 阻塞->就绪
   */
  blockToReady = 7,
}
