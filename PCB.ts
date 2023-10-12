import { logger } from "./Logger";
import chalk from "chalk";

export class PCB {
  /**
   * PID
   */
  pid: string;
  /**
   * 进程名
   */
  pname: string;
  /**
   * run函数
   * @returns TODO:返回运行状态
   */
  run() {
    logger.debug(this.pname, "执行");
    while (this.funs.length > 0) {
      let fun = this.funs.shift();
      if (fun) {
        // 如果被阻塞，跳出
        let r = fun(this);
        if (r == 1) {
          logger.debug("阻塞-z");
          return;
        } else if (r == 2) {
          logger.debug("循环-x");
          this.funs.unshift(fun);
          return;
        }
      } else throw new Error("进程函数出错");
    }
    if (this.funs.length == 0) {
      this.status = 3;
    }
  }
  /**
   * 进程函数
   * @param p 进程
   * @returns 0 阻塞
   * @returns 1 执行完毕
   * @returns 2 循环
   */
  funs: Array<(p: PCB) => number>;
  /**
   * 进程要求时间
   */
  needTime: number;
  /**
   * 进程状态
   * 0:就绪，1:执行，2:阻塞，3:执行完毕，4:已删除
   */
  status: number;
  /**
   * 优先级
   */
  priority: number;
  /**
   * 构造函数
   * @param name 进程名
   * @param time 进程要求时间
   * @param fun 进程函数列表
   * @param priority 优先级
   */
  constructor(
    name: string,
    time: number,
    fun: Array<(p: PCB) => number>,
    priority: number = 0
  ) {
    this.funs = new Array<(p: PCB) => number>(...fun);
    this.pname = name;
    this.needTime = time;
    this.status = 0;
    this.priority = priority;
    this.pid = Math.floor(Math.random() * 100000).toString();
    // 不满5位补0
    while (this.pid.length < 5) {
      this.pid += " ";
    }
  }
  /**
   * 获取颜色
   * @param n
   * @returns
   */
  static getColor(n: number) {
    return [
      chalk.blue.bgGray.bold(" "),
      chalk.blue.bgGreen.bold(" "),
      chalk.blue.bgYellow.bold(" "),
      chalk.blue.bgGray.bold(" "),
    ][n];
  }
}
