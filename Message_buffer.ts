
/**
 * 消息缓冲区
 */
export class Message_buffer {
    sender: string; //发送者进程标识符
    size: number; //消息长度
    text: string; // 消息文本
    next: Message_buffer | null; //下一消息缓冲区指针
    constructor(sender: string, size: number, text: string) {
      this.sender = sender;
      this.size = size;
      this.text = text;
      this.next = null;
    }
  }