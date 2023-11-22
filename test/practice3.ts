// 操作系统实验2
/////////////////////////////////////////////////
import {
  logger,
  PCB,
  ReadyList,
  Semasphore,
  Message_buffer,
  Primitives,
  CPU,
  Memory,
  OS,
} from "../OS/OS";
import chalk from "chalk";
/////////////////////////////////////////
// 系统配置

OS.init({
  hardware: {
    CpuCount: 5,
    MaxPCB: 4,
  },
  software: {
    TimeOut: 0,
    Msgif: true,
  },
});

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
PCB.createPCB("p1   ", 10, pro, 0, 10);
PCB.createPCB("p3   ", 3, pro, 0, 4);
PCB.createPCB("px   ", 1, pro, 0, 12);
PCB.createPCB("p2   ", 4, pro, 0, 6);
// 运行
CPU.start(
  () => true,
  () => {
    if (CPU.CPUtime == 3) {
      PCB.createPCB("p4   ", 2, pro, 0, 6);
    }
    // 结束
    if (ReadyList.len() == 0) return false;
    return true;
  }
);
