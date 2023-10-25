/**
 * sleep
 */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

import {
  logger,
  PCB,
  ReadyList,
  Semasphore,
  Message_buffer,
  Primitives,
  CPU,
} from "../OS";
import chalk from "chalk";

CPU.CPU_COUNT = 2;
PCB.init(10);
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
 * 读者数量
 */
let readcount = 0;
// 主函数
CPU.start(
  () => true,
  async () => {
    await sleep(200);
    // 载入就绪的进程
    if (!PCB.getLogsEmpty()) return true;
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
    if (type == "w") {
      pname = chalk.white.bgBlue.bold(pname);
    } else {
      pname = chalk.white.bgMagenta.bold(pname);
    }
    let pp: PCB = new PCB(pname, sleeptime, type == "w" ? writer : reader);

    ReadyList.push(pp);


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
