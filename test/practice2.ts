// 操作系统实验2
// 进程调度
import {
  logger,
  PCB,
  ReadyList,
  Semasphore,
  Message_buffer,
  Primitives,
  CPU,
  Memory,
} from "../OS/OS";
import chalk from "chalk";
CPU.CPU_COUNT = 1;
PCB.ewif = true;
PCB.init();
Memory.init();
// time priority
// 2 1
// 3 10
// 1 6
// 2 9
// 4 4

/**
 * 进程函数
 */
const pro: Array<(p: PCB) => number> = [
  (p) => {
    // 需要时间-1
    p.needTime--;
    // 优先级/2
    p.priority = Math.ceil(p.priority / 2);
    // 如果时间为0，进程执行完毕
    if (p.needTime > 0) return 2;
    return 1;
  },
];
// 创建进程
[
  PCB.createPCB("p1   ", 2, pro, 1, 23),
  PCB.createPCB("p2   ", 3, pro, 10, 10),
  PCB.createPCB("p3   ", 1, pro, 6, 5),
  PCB.createPCB("p4   ", 2, pro, 9, 2),
  PCB.createPCB("p5   ", 4, pro, 4, 8),
].forEach((p) => {
  logger.debug(p);
  if (p == null) return;
  ReadyList.push(p);
});

// 运行
CPU.start(
  () => true,
  () => {
    // 结束
    if (ReadyList.len() == 0) return false;
    return true;
  }
);
