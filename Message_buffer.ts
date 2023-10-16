import { logger, PCB, ReadyList, Semasphore, Primitives } from "./OS";
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
