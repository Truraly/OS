import {
  CPU,
  logger,
  debuggerLogger,
  MemoryAlgorithm,
  MemoryBlock,
  MemoryAlgorithmFF,
  MemoryBlockFF,
  checkMemory,
  MemoryAlgorithmNF,
  MemoryBlockNF,
  MemoryController,
  Memory,
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
} from "./index";
/**
 * 消息缓冲区
 */
export class Message_buffer {
  /**
   * 发送者进程标识符
   */
  sender: string;
  /**
   * 消息长度
   */
  size: number;
  /**
   * 消息文本
   */
  text: string;
  /**
   * 下一消息缓冲区指针
   */
  next: Message_buffer | null;
  /**
   * 构造函数
   * @param sender
   * @param size
   * @param text
   */
  constructor(sender: string, size: number, text: string) {
    this.sender = sender;
    this.size = size;
    this.text = text;
    this.next = null;
  }
}
