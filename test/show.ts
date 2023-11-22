// 带有显示的读写者问题

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
    CpuCount: 4,
    MaxPCB: 10,
  },
  software: {
    TimeOut: 0,
    Msgif: true,
  },
});

function s2(p: PCB) {
  let msg = p.front?.sender + " " + p.front?.text;
  if (msg == undefined) {
    throw new Error("消息队列为空");
  }
  //   console.log(msg);
  PCB.ew = msg.replace(/ +/, "进程");
  p.front = p.front?.next || null;
  return 1;
}

function s1(p: PCB) {
  return Primitives.P(p.sm, p) ? 1 : 0;
}
/**
 * 显示进程
 *    * @returns 0 阻塞
 * @returns 1 执行完毕
 * @returns 2 循环
 */
let showp: PCB = new PCB(chalk.black.bgWhite.bold("show "), 1, [
  s1,
  s2,
  (p) => {
    p.funs.unshift(s2);
    p.funs.unshift(s1);
    return 2;
  },
]);
ReadyList.push(showp);

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
    Primitives.send(showp.pid, new Message_buffer(p.pid, 1, "读取完毕 "));
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
    await OS.sleep(200);
    // 载入就绪的进程
    if (!PCB.getLogsEmpty()) return true;
    // 随机数
    if (Math.random() < 0.7) return true;
    // 随机读者写者
    let type = Math.random() > 0.7 ? "w" : "r";
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

    PCB.createPCB(pname, sleeptime, type == "w" ? writer : reader);

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
