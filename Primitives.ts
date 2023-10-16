// 原语列表
import {
  logger,
  PCB,
  ReadyList,
  Semasphore,
  Message_buffer,
  Primitives,
} from "./OS";
/**
 * 发送消息原语
 * @param PID 进程标识符
 * @param a 消息缓冲区
 */
export function send(PID: string, a: Message_buffer) {
  // 根据a.size申请缓冲区（JS不需要做）
  // 复制a.text到缓冲区
  let i: Message_buffer = new Message_buffer(a.sender, a.size, a.text);
  // 将发送区a.text的内容复制到接收区i.text中（JS不需要做）
  // 将i插入到进程PID的消息队列中
  let p: PCB | null = PCB.findByPid(PID);
  if (!p) {
    throw new Error("进程不存在");
  }
  if (p.front == null) {
    p.front = i;
  } else {
  }
}

/**
 * P原语
 * @param s 信号量
 * @param 调用 P 的进程
 */
export function P(s: Semasphore, p: PCB) {
  // s.value--
  s.value--;
  // 如果s.value<0，进程插入s.queue中
  if (s.value < 0) {
    s.queue.push(p);
    p.status = 2;
  }
}

/**
 * V原语
 * @param s 信号量
 */
export function V(s: Semasphore) {
  // s.value++
  s.value++;
  // 如果s.value<=0，从s.queue中释放一个进程
  if (s.value <= 0) {
    let p: PCB | undefined = s.queue.shift();
    if (p) {
      p.status = 0;
      //   Semasphore.readyList.push(p);
    }
  }
}