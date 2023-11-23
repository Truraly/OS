/**
 * 可持续性读写者问题
 */

////////////////////////////////////////////////
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
  SystemStatusMonitor,
  ProcessController,
  type RunFunctions as RunFunction,
} from "../OS/OS";
/////////////////////////////////////////
// 系统配置
OS.init({
  hardware: {
    CpuCount: 2,
    MemorySize: 128,
    MaxPCB: 6,
  },
  software: {
    TimeOut: 0,
    MemoryAlgorithm: "FF",
    MemoryBarLength: 20,
  },
  log: {
    showCPULoad: true,
    showMemoryBar: true,
    showMemoryDetail: true,
    showMemoryRate: true,
    showProcessStatus: true,
  },
});
////////////////////////////////////////
// 初始环境
/**
 * 写信号量
 */
let Wmutex = new Semasphore(1, "Wmutex");
/**
 * 读写“读者数量”信号量
 */
let Rmutex = new Semasphore(1, "Rmutex");
/**
 * 读者数量
 */
let readcount = 0;

////////////////////////////////////////
// 进程逻辑

/**
 * 写者进程函数
 */
const writer: Array<RunFunction> = [
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
 */
const reader: Array<RunFunction> = [
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

// 主函数
OS.start(
  async () => {
    await OS.sleep(100);
    // await OS.sleep(10);
    // 载入就绪的进程
    if (!ProcessController.getLogsEmpty()) return true;
    // 随机数
    if (Math.random() < 0.6) return true;
    // 随机读者写者
    let type = Math.random() > 0.6 ? "w" : "r";
    // 随机阻塞时间
    let sleeptime = Math.floor(Math.random() * 10) + 2;
    //
    let pname = type + CPU.CPUtime;
    // 删除超长的部分
    pname = pname.slice(0, 4);
    // 填充空格
    while (pname.length < 5) pname += " ";
    // 颜色
    // if (type == "w") {
    //   pname = chalk.white.bgBlue.bold(pname);
    // } else {
    //   pname = chalk.white.bgMagenta.bold(pname);
    // }
    ProcessController.createPCB(
      pname,
      sleeptime,
      type == "w" ? writer : reader,
      0,
      type == "w" ? 11 : 5
    );
    return true;
  },
  () => true
);
