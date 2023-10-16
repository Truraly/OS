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

// let test: [number, string, number, number][] = new Array<
//   [number, string, number, number]
// >();
// let nn = Math.floor(Math.random() * 30) + 5;
// for (let i = 1; i < nn; i++) {
//   // 随机读者写者
//   let type = Math.random() > 0.6 ? "w" : "r";
//   // 随机时间
//   let time = Math.floor(Math.random() * i * 3) + i * 2;
//   // 随机阻塞时间
//   let sleeptime = Math.floor(Math.random() * 10) + 2;
//   test.push([i, type, time, sleeptime]);
// }
// logger.info(test);

/**
 * 读者数量
 */
let readcount = 0;

async function main(CPUtime: number): Promise<boolean> {
  let ew: string = "";
    if (!PCB.getLogsEmpty()) return true;
  // 载入就绪的进程
  test.forEach((item) => {
    if (!((item[2] as number) <= CPUtime)) return;
    let type = item[1] as string;
    //
    let pname = type + CPUtime;
    let sleeptime = item[3] as number;
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
  });
  // 结束
  if (test.length == 0 && ReadyList.len() == 0) return false;
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
addruntimefun(main as any);
start();

/**
 * sleep
 */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
