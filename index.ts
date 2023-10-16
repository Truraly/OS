import chalk from "chalk";
import { logger } from "./Logger";
import { PCB } from "./PCB";
import { ReadyList } from "./ReadyList";
import { Semasphore } from "./Semasphore";
import { ProcessLog } from "./ProcessLog";
/**
 * 超时时间
 */
const TIME_OUT = 0;
/**
 * 最大长度
 */
const MAX_LENGTH = 8;
ProcessLog.setMaxLength(MAX_LENGTH);

/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
/**
 * 程序运行时间
 */
let CPUtime = 0;
/**
 * 主函数
 */
export async function start() {
  /**
   * 程序运行
   */
  const readyList = new ReadyList();
  setSema_arr.forEach((v) => {
    new Semasphore(v[1], v[0], readyList);
  });
  logger.info("开始运行\n");
  ProcessLog.printTitle();
  while (true) {
    let ew: string = " add:";
    // 计数器+1
    ++CPUtime;
    if (!(await runtimefun(CPUtime, readyList))) {
      // 打印进程状态
      ProcessLog.printStatus(CPUtime, ew);
      break;
    }
    // 输出就绪队列
    logger.debug("就绪队列：", readyList.toString());
    // 定时跳出
    if (CPUtime > TIME_OUT && TIME_OUT != 0) {
      logger.warn("进程执行超时");
      //   logger.warn(test);
      logger.warn(readyList);
      break;
    }
    readyList.sort();
    // 执行进程
    let length_ = readyList.length;
    for (let i = 0; i < length_; i++) {
      let p: PCB = readyList.run();
      logger.debug("进程" + p.pname + "开始执行");
      p.run();
      logger.debug("进程" + p.pname + "执行完毕", p);
      if (p.status == 3) {
      } else if (p.status == 2) {
      } else if (p.status == 1) {
        readyList.rePush(p);
      } else {
        logger.error(p);
        throw new Error("进程状态出错");
      }
    }
    // 打印进程状态
    ProcessLog.printStatus(CPUtime); //, ew);
  }
}
/**
 * 运行函数
 * @param c
 * @param r
 * @returns 是否结束 true:未结束 false:结束
 */
let runtimefun: (c: number, r: ReadyList) => boolean | Promise<boolean> = (
  c,
  r
) => {
  throw new Error("未定义运行函数");
};

export function addruntimefun(
  fun: (c: number, r: ReadyList) => boolean | Promise<boolean>
) {
  runtimefun = fun;
}

let setSema_arr: [string, number][] = [];
/**
 * 设置信号量
 */
export function setSema(n: string, num: number) {
  setSema_arr.push([n, num]);
}
