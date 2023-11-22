// 原语列表
import {
  logger,
  PCB,
  ReadyList,
  Semasphore,
  Message_buffer,
  Primitives,
  PStatus,
} from "./OS";
/**
 * 发送消息原语
 * @param PID 进程标识符
 * @param a 消息缓冲区
 */
export function send(PID: string, a: Message_buffer) {
  // 根据a.size申请缓冲区getbuf(a.size,i)（JS不需要做）
  // 复制a.text到缓冲区
  let i: Message_buffer = {
    sender: a.sender,
    size: a.size,
    text: a.text,
    next: null,
  };
  // 将发送区a.text的内容复制到接收区i.text中（JS不需要做）
  // 将i插入到进程PID的消息队列中
  let p: PCB | null = PCB.findByPid(PID);
  if (!p) {
    throw new Error("进程不存在");
  }
  P(p.mutex, PCB.findByPid(a.sender) as PCB);
  if (p.front == null) {
    p.front = i;
  } else {
    let temp: Message_buffer | null = p.front;
    while (temp?.next != null) {
      temp = temp.next;
    }
    temp.next = i;
  }
  V(p.mutex);
  V(p.sm);
}

/**
 * P原语
 * @param s 信号量
 * @param 调用 P 的进程
 * @returns true 执行, false 阻塞
 */
export function P(s: Semasphore, p: PCB): boolean {
  s.value--;
  // 如果s.value<0，进程插入s.queue中
  if (s.value < 0) {
    s.queue.push(p);
    p.showStatus = p.status = PStatus.block;
    return false;
  }
  return true;
}

/**
 * V原语
 * @param s 信号量
 */
export function V(s: Semasphore) {
  s.value++;
  // 如果s.value<=0，从s.queue中释放一个进程
  if (s.value <= 0) {
    let p: PCB | undefined = s.queue.shift();
    if (p) {
      p.status = PStatus.ready;
      p.showStatus = PStatus.blockToReady;
      ReadyList.rePush(p);
    }
  }
}
