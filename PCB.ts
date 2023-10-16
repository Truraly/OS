import chalk from "chalk";

/**
 * 最大进程数量
 */
const MAX_LENGTH = 8;

import {
  logger,
  ReadyList,
  Semasphore,
  Message_buffer,
  Primitives,
} from "./OS";
export class PCB {
  /**
   * PID
   */
  readonly pid: string;
  /**
   * 进程名
   */
  readonly pname: string;
  /**
   * run函数
   * @returns 0 阻塞 1 执行完毕 2 循环
   */
  run() {
    logger.debug(this.pname, "执行");
    while (this.funs.length > 0) {
      let res: number = this.funs[0](this);
      logger.debug("执行函数，res:", res);
      switch (res) {
        case 0:
          logger.debug("进程", this.pname, "阻塞");
          this.funs.shift();
          this.setStatus(6);
          return 6;
        case 1:
          this.funs.shift();
          continue;
        case 2:
          logger.debug("进程", this.pname, "时间片用完，进入就绪队列");
          this.setStatus(1);
          return 2;
        default:
          this.funs.shift();
          continue;
      }
    }
    logger.debug("进程", this.pname, "执行完毕");
    this.status = 3;
    this.setStatus(5);
    return 1;
  }
  /**
   * 进程函数列表
   * @param p 进程
   * @returns 0 阻塞
   * @returns 1 执行完毕
   * @returns 2 循环
   */
  funs: Array<(p: PCB) => number>;
  /**
   * 设置进程本轮状态
   * @param status number
   * 0:就绪，1:执行，2:阻塞，3:执行完毕，4:已删除（渲染不用）
   * 5:刚执行完毕，6:运作转阻塞 （用于渲染）
   */
  setStatus(status: number) {
    let index = PCB.PCBList.findIndex((item) => item == this);
    if (index == -1) {
      throw new Error("进程不存在");
    }
    PCB.PCBStatusList[index] = status;
  }
  /**
   * 进程剩余任务量
   */
  needTime: number;
  /**
   * 进程状态
   * 0:就绪，1:执行，2:阻塞，3:执行完毕，4:已删除
   * 5:刚执行完毕，6:运作转阻塞 （用于渲染）
   */
  status: number;
  /**
   * 优先级
   */
  priority: number;

  /**
   * 消息队列队首指针
   */
  front: Message_buffer | null;
  /**
   * 消息队列互斥信号量
   */
  mutex: Semasphore;
  /**
   * 消息队列非空信号量
   * 0 阻塞
   * 1 执行
   */
  sm: Semasphore;

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
    this.front = null;
    this.mutex = new Semasphore(1, "mutex-" + this.pname);
    this.sm = new Semasphore(0, "sm-" + this.pname);
    // 插入就绪队列
    for (let i = 0; i < PCB.PCBList.length; i++) {
      if (!PCB.PCBList[i]) {
        PCB.PCBList[i] = this;
        PCB.PCBStatusList[i] = 1;
        return;
      }
    }
    throw new Error("进程列表已满");
  }

  ////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////
  /**
   * 获取颜色
   * @param n
   * @returns
   */
  static getColor(n: number) {
    // console.log(n);
    return [
      // * 0:就绪，1:执行，2:阻塞，3:执行完毕，4:已删除（渲染不用）
      // * 5:刚执行完毕，6:运作转阻塞 （用于渲染）
      chalk.blue.bgGray.bold(" "),
      chalk.blue.bgGreen.bold(" "),
      chalk.blue.bgYellow.bold(" "),
      chalk.blue.bgGreen.bold(" "),
      chalk.blue.bgGray.bold(" "),
      chalk.blue.bgGreen.bold(" "),
      chalk.blue.bgHex("#eb9100").bold(" "),
    ][n];
  }

  /**
   * 进程列表
   */
  static PCBList: Array<PCB | null> = new Array(MAX_LENGTH).fill(null);
  /**
   * 刷新进程列表，删除已删除进程
   */
  static flush() {
    let length_ = PCB.PCBList.length;
    for (let i = 0; i < length_; i++) {
      if (PCB.PCBList[i] && (PCB.PCBList[i] as PCB).status == 4) {
        PCB.PCBList[i] = null;
      } else if (PCB.PCBList[i] && (PCB.PCBList[i] as PCB).status == 3) {
        (PCB.PCBList[i] as PCB).status = 4;
      }
    }
    // 将刚执行完毕的进程状态改为已删除
    // 将刚转阻塞的进程状态改为阻塞
    PCB.PCBStatusList.forEach((item, index) => {
      if (item == 5) {
        PCB.PCBStatusList[index] = 0;
      } else if (item == 6) {
        PCB.PCBStatusList[index] = 2;
      }
    });
    // TODO:删除已经没用的记录
  }
  /**
   * 根据pid查找进程
   * @param pid
   */
  static findByPid(pid: string): PCB | null {
    let length_ = PCB.PCBList.length;
    for (let i = 0; i < length_; i++) {
      if (PCB.PCBList[i] && (PCB.PCBList[i] as PCB).pid == pid) {
        return PCB.PCBList[i];
      }
    }
    return null;
  }
  ////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////
  /**
   * 获取是否有空位
   * @returns true 有空位
   * @returns false 没有空位
   */
  static getLogsEmpty(): boolean {
    return this.PCBList.some((item) => item == null);
  }
  /**
   * 打印表头
   */
  static printTitle(): void {
    let str = "|时间|";
    for (let i = 0; i < this.PCBList.length; i++) {
      str += "进程 状态|";
    }
    logger.info(str);
  }

  /**
   * 进程信息列表his
   */
  static PCBStatusListHis: Array<Array<number>> = [
    new Array<number>(MAX_LENGTH).fill(0),
    new Array<number>(MAX_LENGTH).fill(0),
  ];

  /**
   * 进程信息列表
   * 0:空位，1:就绪，2:执行，3:阻塞，4:已执行完毕，5:刚执行完毕，6:运作转阻塞
   */
  static PCBStatusList: Array<number> = new Array<number>(MAX_LENGTH).fill(0);

  /**
   * 打印进程信息
   */
  static printStatus(CPUtime: number, ew: string = ""): void {
    // console.log("");
    // console.log("PCB.PCBStatusListHis[1]", PCB.PCBStatusListHis[1].join(" "));
    // console.log("PCB.PCBStatusListHis[0]", PCB.PCBStatusListHis[0].join(" "));
    // console.log("PCB.PCBStatusList", PCB.PCBStatusList.join(" "));
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
    for (let i = 0; i < PCB.PCBStatusList.length; i++) {
      let item = PCB.PCBStatusList[i];

      let t = K(5);

      // 如果上一位为非0，但上上一位为0，则打印进程ID
      // 打印进程状态
      if (item == 0) {
        // 打印空格
      } else if (PCB.PCBStatusListHis[0][i] == 0) {
        // 如果上一位为0，则打印进程名
        t = getBgColor((PCB.PCBList[i] as PCB).pname);
      } else if (PCB.PCBStatusListHis[1][i] == 0) {
        // 打印进程ID
        t = getBgColor((PCB.PCBList[i] as PCB).pid);
      } else if (item == 5) {
        let cont = 1;
        for (let j = 0; PCB.PCBStatusListHis[j][i] != 0; j++) {
          cont++;
        }
        t = getBgColor("PT " + o_t_t(cont));
      }

      str += K() + t + K() + PCB.getColor(item) + K() + L;
    }

    // 打印信号量
    // Semasphore.semasphoreList.forEach((item) => {
    //   str += " " + item.name_ + ":" + item.value;
    // });
    // 打印额外信息
    str += ew;
    // 打印
    logger.info(str);

    // 记录进程状态
    PCB.PCBStatusListHis.unshift(new Array<number>(...PCB.PCBStatusList));
    // console.log("PCB.PCBStatusListHis[0]", PCB.PCBStatusListHis[0].join(" "));
    PCB.flush();
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
