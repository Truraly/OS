import { PCB } from "./PCB";
import { logger } from "./Logger";
import { Semasphore } from "./Semasphore";
import chalk from "chalk";
/**
 * 进程日志类
 */
export class ProcessLog {
  /**
   * 进程
   */
  process: PCB;
  /**
   * 打印状态
   * 0:就绪，1:打印了pid，2:打印了pname
   */
  status: number;
  /**
   * laststatus 上一次的状态
   */
  laststatus: number;
  /**
   * 构造函数
   * @param process 进程
   */
  constructor(process: PCB) {
    this.process = process;
    this.status = 0;
    this.laststatus = 0;
    for (let i = 0; i < ProcessLog.logs.length; i++) {
      if (ProcessLog.logs[i] == null) {
        ProcessLog.logs[i] = this;
        return;
      }
    }
    throw new Error("进程日志队列已满");
  }
  /**
   * 最大长度
   */
  static MAX_LENGTH = 5;
  /**
   * 设置最大长度，小于当前长度无效
   *
   * 你不应该在程序运行时调用这个函数
   */
  static setMaxLength(n: number) {
    if (n <= this.MAX_LENGTH) return;
    this.MAX_LENGTH = n;
    while (this.logs.length < n) {
      this.logs.push(null);
    }
  }
  /**
   * 进程日志队列
   * 初始填充MAX_LENGTH个null
   */
  private static logs: Array<ProcessLog | null> = new Array<ProcessLog | null>(
    ProcessLog.MAX_LENGTH
  ).fill(null);
  /**
   * 获取是否有空位
   * @returns true 有空位
   * @returns false 没有空位
   */
  static getLogsEmpty(): boolean {
    return this.logs.some((item) => item == null);
  }
  /**
   * 打印表头
   */
  static printTitle(): void {
    let str = "|时间|";
    for (let i = 0; i < this.logs.length; i++) {
      str += "进程 状态|";
    }
    logger.info(str);
  }
  /**
   * 打印进程信息
   */
  static printStatus(CPUtime: number, ew: string = ""): void {
    /**
     * 获取背景色
     */
    function getBgColor(str: string = " ") {
      return [chalk.bgHex("#262626"), chalk.white][CPUtime % 2](str);
    }
    /**
     * 竖线
     */
    let L = getBgColor("|");
    /**
     * 空格
     * @param n 空格数量
     * @returns
     */
    function K(n: number = 1) {
      // 生成长度为n的空格
      let str = "";
      for (let i = 0; i < n; i++) {
        str += " ";
      }
      // 设置背景色
      return getBgColor(str);
    }
    /**
     * CPUtime
     */
    let str = L + K() + o_t_t(CPUtime) + K() + L;
    /**
     * 进程日志
     */
    this.logs.forEach((item, index) => {
      // 回收已经完成的进程
      if (item != null && item.process.status == 3 && item.laststatus == 3) {
        this.logs[index] = item = null;
      }
      // 若为空位，填充空格
      if (item == null) {
        str += K(7) + PCB.getColor(0) + K() + L;
        return;
      }
      let t = K(5);
      if (item.status == 0) {
        // 打印pid
        t = getBgColor(item.process.pid);
        item.status++;
      } else if (item.status == 1) {
        // 打印pname
        t = item.process.pname;
        item.status++;
      }
      let s = item.process.status;
      if (s == 3) {
        // 进程完成
        s = 1;
      } else if (s == 0 && item.laststatus == 2) {
        // 阻塞转就绪
        s = 2;
      }
      // 记录上一次的状态
      item.laststatus = item.process.status;
      //   console.log(s);
      str += K() + t + K() + PCB.getColor(s) + K() + L;
    });
    // 打印信号量
    Semasphore.semasphoreList.forEach((item) => {
      str += " " + item.name_ + ":" + item.value;
    });
    // 打印额外信息
    str += ew;
    // 打印
    logger.info(str);
  }
}

/**
 * 一位数补零
 * @param num
 * @param type
 * @returns
 */
function o_t_t(num: number, type: string = " ") {
  num = num % 100;
  return num < 10 ? type + num : num;
}
