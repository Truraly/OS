import chalk from "chalk";
import {
  logger,
  PCB,
  ReadyList,
  Semasphore,
  Message_buffer,
  Primitives,
} from "./OS";
/**
 * 超时时间
 */
const TIME_OUT = 0;
/**
 * 最大长度
 */
const MAX_LENGTH = 8;
/**
 * CPU数量
 */
const CPU_COUNT = 99;
// const CPU_COUNT = 1;

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
  setSema_arr.forEach((v) => {
    new Semasphore(v[1], v[0]);
  });
  logger.info("开始运行\n");
  PCB.printTitle();
  while (true) {
    let ew: string = "";
    // 计数器+1
    ++CPUtime;

    if (!(await runtimefun(CPUtime))) {
      // 推出程序
      // 打印进程状态
      PCB.printStatus(CPUtime, ew);
      break;
    }

    // 输出就绪队列
    logger.debug("就绪队列：", ReadyList.Print());
    // 定时跳出
    if (CPUtime > TIME_OUT && TIME_OUT != 0) {
      logger.warn("进程执行超时");
      logger.warn(ReadyList.readyList);
      break;
    }
    // 排序
    ReadyList.sort();
    // 执行进程
    let length_ = ReadyList.len();
    // 设置状态为阻塞
    PCB.PCBStatusList.map((v) => {
      v = 6;
    });

    for (let i = 0; i < length_ && i < CPU_COUNT; i++) {
      //   console.log(i);
      let p: PCB = ReadyList.run();
      logger.debug("进程" + p.pname + "开始执行");
      p.run();
    //   ew += "运行进程" + p.pname + "优先级" + p.priority 
      logger.debug("进程" + p.pname + "执行完毕", p);
      switch (p.status) {
        case 3:
          break;
        case 2:
          break;
        case 1:
          ReadyList.rePush(p);
          break;
        default:
          logger.error(p);
          throw new Error("进程状态出错");
      }
    }
    // 打印进程状态
    PCB.printStatus(CPUtime, ew);
  }
}
/**
 * 运行函数
 * @param c
 * @param r
 * @returns 是否结束 true:未结束 false:结束
 */
let runtimefun: (c: number) => boolean | Promise<boolean> = (c) => {
  throw new Error("未定义运行函数");
};

export function addruntimefun(fun: (c: number) => boolean | Promise<boolean>) {
  runtimefun = fun;
}

let setSema_arr: [string, number][] = [];
/**
 * 设置信号量
 */
export function setSema(n: string, num: number) {
  setSema_arr.push([n, num]);
}
