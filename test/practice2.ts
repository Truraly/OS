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
  OS,
  ProcessController,
} from "../OS";
import chalk from "chalk";

OS.init({
  hardware: {
    CpuCount: 1,
    MaxPCB: 5,
  },
  software: {
    TimeOut: 0,
    MemoryAlgorithm: "NF",
    MemoryBarLength: 20,
  },
  log: {
    // showCPULoad:false,
  },
});

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

// 运行
OS.start(
  () => {
    if (CPU.CPUtime == 0) {
      ProcessController.createPCB("p1   ", 2, pro, 1, 23);
      ProcessController.createPCB("p2   ", 3, pro, 10, 10);
      ProcessController.createPCB("p3   ", 1, pro, 6, 5);
      ProcessController.createPCB("p4   ", 2, pro, 9, 2);
      ProcessController.createPCB("p5   ", 4, pro, 4, 8);
    }
    return true;
  },
  () => {
    // 结束
    return !(CPU.CPUtime > 5 && OS.checkNoTask());
  }
);
