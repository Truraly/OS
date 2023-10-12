import { logger } from "../Logger";
import { PCB } from "../PCB";
import { ReadyList } from "../ReadyList";
import { Semasphore } from "../Semasphore";
import { ProcessLog } from "../ProcessLog";
import chalk from "chalk";

/**
 * 写者进程函数
 */
const writer: Array<(p: PCB) => number> = [
  (p) => (Semasphore.findByName("Wmutex").P(p) ? 0 : 1),
  (p) => {
    p.needTime--;
    if (p.needTime > 0) return 2;
    return 0;
  },
  (p) => {
    Semasphore.findByName("Wmutex").V(p);
    return 0;
  },
];

/**
 * 读者进程函数
 */
const reader: Array<(p: PCB) => number> = [
  (p) => (Semasphore.findByName("Rmutex").P(p) ? 0 : 1),
  (p) => {
    if (readcount == 0) {
      logger.debug("第一个读者");
      return Semasphore.findByName("Wmutex").P(p) ? 0 : 1;
    }
    return 0;
  },
  (p) => {
    readcount++;
    Semasphore.findByName("Rmutex").V(p);
    return 0;
  },
  (p) => {
    p.needTime--;
    if (p.needTime > 0) return 2;
    return 0;
  },
  (p) => {
    return Semasphore.findByName("Rmutex").P(p) ? 0 : 1;
  },
  (p) => {
    readcount--;
    Semasphore.findByName("Rmutex").V(p);
    if (readcount == 0) {
      logger.debug("最后一个读者");
      Semasphore.findByName("Wmutex").V(p);
    }
    return 0;
  },
];

/**
 * 读者数量
 */
let readcount = 0;

async function main(CPUtime: number, readyList: ReadyList): Promise<boolean> {
  await sleep(500);
  let ew: string = "";
  // 载入就绪的进程
  if (!ProcessLog.getLogsEmpty()) return true;
  // 随机数
  if (Math.random() < 0.5) return true;
  // 随机读者写者
  let type = Math.random() > 0.6 ? "w" : "r";
  // 随机阻塞时间
  let sleeptime = Math.floor(Math.random() * 10) + 2;
  //

  let pp: PCB = new PCB(
    type + CPUtime,
    sleeptime,
    type == "w" ? writer : reader
  );
  // 删除超长的部分
  pp.pname = pp.pname.slice(0, 4);
  // 填充空格
  while (pp.pname.length < 5) pp.pname += " ";
  // 颜色
  if (type == "w") {
    pp.pname = chalk.white.bgBlue.bold(pp.pname);
  } else {
    pp.pname = chalk.white.bgMagenta.bold(pp.pname);
  }

  readyList.push(pp);
  ew += pp.pname + "," + pp.needTime + " ";
  // 添加到log
  new ProcessLog(pp);

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
