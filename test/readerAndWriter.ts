import { logger } from "../Logger";
import { PCB } from "../PCB";
import { ReadyList } from "../ReadyList";
import { Semasphore } from "../Semasphore";
import { ProcessLog } from "../ProcessLog";
import chalk from "chalk";
/**
 * 读者写者进入时间
 * [id, type, time, sleeptime, status]
 * status 0:未执行，1:启动，2:阻塞，3:执行完毕
 */
// let test = [
//   [1, "w", 3, 5],
//   [2, "w", 16, 5],
//   [3, "r", 5, 2],
//   [4, "w", 6, 5],
//   [5, "r", 4, 3],
//   [6, "r", 11, 4],
// ];
// logger.info(test);

let test: [number, string, number, number][] = new Array<
  [number, string, number, number]
>();
let nn = Math.floor(Math.random() * 30) + 5;
for (let i = 1; i < nn; i++) {
  // 随机读者写者
  let type = Math.random() > 0.6 ? "w" : "r";
  // 随机时间
  let time = Math.floor(Math.random() * i * 3) + i * 2;
  // 随机阻塞时间
  let sleeptime = Math.floor(Math.random() * 10) + 2;
  test.push([i, type, time, sleeptime]);
}
logger.info(test);

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
  let ew: string = "";
  // 载入就绪的进程
  test.forEach((item) => {
    if (!((item[2] as number) <= CPUtime)) return;
    // 限制监听的进程数量
    if (!ProcessLog.getLogsEmpty()) return;
    let pp: PCB = new PCB(
      (item[1].toString() + item[0].toString()) as string,
      item[3] as number,
      item[1] == "w" ? writer : reader
    );
    // 删除超长的部分
    pp.pname = pp.pname.slice(0, 4);
    // 填充空格
    while (pp.pname.length < 5) pp.pname += " ";
    // 颜色
    if (item[1] == "w") {
      pp.pname = chalk.white.bgBlue.bold(pp.pname);
    } else {
      pp.pname = chalk.white.bgMagenta.bold(pp.pname);
    }

    readyList.push(pp);
    logger.debug("进程" + pp.pname + "已载入");
    ew += pp.pname + "," + pp.needTime + " ";
    test = test.filter((_item) => _item[0] != item[0]);
    // 添加到log
    new ProcessLog(pp);
  });
  // 结束
  if (test.length == 0 && readyList.length == 0) return false;
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