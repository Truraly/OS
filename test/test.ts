import {
  logger,
  PCB,
  ReadyList,
  Semasphore,
  Message_buffer,
  Primitives,
} from "../OS";
import chalk from "chalk";

/**
 * 写者进程函数
 */
const writer: Array<(p: PCB) => number> = [
  (p) => (Semasphore.findByName("Wmutex").P(p) ? 1 : 0),
  (p) => {
    p.needTime--;
    if (p.needTime > 0) return 2;
    return 1;
  },
  (p) => {
    Semasphore.findByName("Wmutex").V(p);
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
  (p) => (Semasphore.findByName("Rmutex").P(p) ? 1 : 0),
  (p) => {
    if (readcount == 0) {
      logger.debug("第一个读者");
      return Semasphore.findByName("Wmutex").P(p) ? 1 : 0;
    }
    return 1;
  },
  (p) => {
    readcount++;
    Semasphore.findByName("Rmutex").V(p);
    return 1;
  },
  (p) => {
    p.needTime--;
    if (p.needTime > 0) return 2;
    return 1;
  },
  (p) => {
    return Semasphore.findByName("Rmutex").P(p) ? 1 : 0;
  },
  (p) => {
    readcount--;
    Semasphore.findByName("Rmutex").V(p);
    if (readcount == 0) {
      logger.debug("最后一个读者");
      Semasphore.findByName("Wmutex").V(p);
    }
    return 1;
  },
];

/**
 * 读者数量
 */
let readcount = 0;

async function main(CPUtime: number): Promise<boolean> {
  await sleep(500);
  let ew: string = "";
//   console.log("PCB.getLogsEmpty()", PCB.getLogsEmpty());
//   console.log("PCB.PCBList", PCB.PCBList);
  // 载入就绪的进程
  if (!PCB.getLogsEmpty()) return true;
  // 随机数
  if (Math.random() < 0.4) return true;
  // 随机读者写者
  let type = Math.random() > 0.5 ? "w" : "r";
  // 随机阻塞时间
  let sleeptime = Math.floor(Math.random() * 10) + 2;
  //
  let pname = type + CPUtime;
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
  ew += pp.pname + "," + pp.needTime + " ";
  // 添加到log
  //   new ProcessLog(pp);

  return true;
}
import { start, addruntimefun, setSema } from "../index";
/**
 * 写信号量
 */
setSema("Wmutex", 1);
/**
 * 读写“读者数量”信号量
 */
setSema("Rmutex", 1);
addruntimefun(main);
start();

/**
 * sleep
 */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
