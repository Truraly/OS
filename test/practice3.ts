// 操作系统实验2
/////////////////////////////////////////////////
import {
  logger,
  debuggerLogger,
  PCB,
  ReadyList,
  Semasphore,
  Message_buffer,
  Primitives,
  CPU,
  Memory,
  OS,
  ProcessController,
  SystemStatusMonitor,
  ProcessStatusMonitor,
  PStatus,
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
    MemoryAlgorithm: "NF",
  },
  log: {
    // showCPULoad:false,
  },
});

/**
 * 进程函数
 */
const pro: Array<(p: PCB) => number> = [
  (p) => {
    // 需要时间-1
    p.needTime--;
    if (p.needTime > 0) return 2;
    // 如果时间为0，进程执行完毕
    return 1;
  },
];

// 运行
OS.start(
  () => {
    debuggerLogger.debug("当前时间片：", CPU.CPUtime);
    if (CPU.CPUtime == 3) {
      ProcessController.createPCB("p4   ", 2, pro, 0, 6);
    } else if (CPU.CPUtime == 0) {
      // 创建进程
      ProcessController.createPCB("p1   ", 10, pro, 0, 10);
      ProcessController.createPCB("p3   ", 3, pro, 0, 4);
      ProcessController.createPCB("px   ", 1, pro, 0, 12);
      ProcessController.createPCB("p2   ", 4, pro, 0, 6);
    }
    return true;
  },
  () => {
    // 结束
    return !(CPU.CPUtime > 5 && OS.checkNoTask());
  }
);
