// 操作系统实验1
// 读写者问题
import {
  logger,
  PCB,
  ReadyList,
  Semasphore,
  Message_buffer,
  Primitives,
  CPU,
  Memory,
  SystemStatusMonitor,
  OS,
  ProcessController,
} from "../OS/OS";
import chalk from "chalk";

OS.init({
  hardware: {
    CpuCount: 1,
    MaxPCB: 5,
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
 * 写者进程函数
 */
const writer: Array<(p: PCB) => number> = [
  (p) => (Primitives.P(Wmutex, p) ? 1 : 0),
  (p) => {
    p.needTime--;
    if (p.needTime > 0) return 2;
    return 1;
  },
  (p) => {
    Primitives.V(Wmutex);
    return 1;
  },
];

/**
 * 读者进程函数
 * @returns 0 阻塞
 * @returns 1 执行完毕
 * @returns 2 循环
 */
const reader: Array<(p: PCB) => number> = [
  (p) => (Primitives.P(Rmutex, p) ? 1 : 0),
  (p) => {
    if (readcount == 0) {
      logger.debug("第一个读者");
      return Primitives.P(Wmutex, p) ? 1 : 0;
    }
    return 1;
  },
  (p) => {
    readcount++;
    Primitives.V(Rmutex);
    return 1;
  },
  (p) => {
    p.needTime--;
    if (p.needTime > 0) return 2;
    return 1;
  },
  (p) => (Primitives.P(Rmutex, p) ? 1 : 0),
  (p) => {
    readcount--;
    Primitives.V(Rmutex);
    if (readcount == 0) {
      logger.debug("最后一个读者");
      Primitives.V(Wmutex);
    }
    return 1;
  },
];
/**
 * 读者写者进入时间
 * [id, type, time, sleeptime, status]
 * status 0:未执行，1:启动，2:阻塞，3:执行完毕
 */
let test = [
  [1, "w", 3, 5],
  [2, "w", 16, 5],
  [3, "r", 5, 2],
  [4, "w", 6, 5],
  [5, "r", 4, 3],
  [6, "r", 11, 4],
];
logger.info(test);

/**
 * 读者数量
 */
let readcount = 0;
// 主函数
OS.start(
  () => {
    if (!SystemStatusMonitor.getLogsEmpty()) return true;
    // 载入就绪的进程
    test.forEach((item) => {
      // console.log(item);
      if (!((item[2] as number) <= CPU.CPUtime)) return;
      let type = item[1] as string;
      //
      let pname = type + CPU.CPUtime;
      let sleeptime = item[3] as number;
      // 删除超长的部分
      pname = pname.slice(0, 4);
      // 填充空格
      while (pname.length < 5) pname += " ";
    //   // 颜色
    //   if (type == "w") {
    //     pname = chalk.white.bgBlue.bold(pname);
    //   } else {
    //     pname = chalk.white.bgMagenta.bold(pname);
    //   }
      let newPCB = ProcessController.createPCB(
        pname,
        sleeptime,
        type == "w" ? writer : reader,
        0,
        type == "w" ? 3 : 6
      );
      if (newPCB != null) {
        ReadyList.push(newPCB);
      }
      test.splice(test.indexOf(item), 1);
    });
    // 结束

    if (test.length == 0 && ReadyList.len() == 0) return false;
    return true;
  },
  () => {
    return true;
  }
);

/**
 * 写信号量
 */
let Wmutex = new Semasphore(1, "Wmutex");
/**
 * 读写“读者数量”信号量
 */
let Rmutex = new Semasphore(1, "Rmutex");
