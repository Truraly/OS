import chalk from "chalk";
import process from "process";
import {
  logger,
  ReadyList,
  Semasphore,
  Message_buffer,
  Primitives,
  Memory,
  MemoryBlock,
} from "./OS";
export class PCB {
  ///////////////////////////////////////
  // 全局属性
  /**
   * 额外信息
   */
  static ewif: boolean = false;
  static ew: string = "";
  /**
   * 最大进程数量
   */
  static MAX_LENGTH = 5;
  //////////////////////////////////////////////////////////////
  // 对象属性
  /**
   * PID
   */
  readonly pid: string;
  /**
   * 进程名
   */
  readonly pname: string;
  /**
   * 进程函数列表
   * @param p 进程
   * @returns 0 阻塞
   * @returns 1 执行完毕
   * @returns 2 循环
   */
  funs: Array<(p: PCB) => number>;
  /**
   * 进程剩余任务量
   */
  needTime: number;
  /**
   * 进程状态
   * 0:空位，1:就绪，2:执行，3:阻塞，4:已执行完毕，5:运作转阻塞，6:已删除
   */
  status: PStatus;
  /**
   * 本轮展示的状态
   *  @param status number
   *  0:空位，1:就绪，2:执行，3:阻塞，4:已执行完毕，5:运作转阻塞，6:已删除
   */
  set showStatus(status: PStatus) {
    logger.debug("PCB.PCBList", PCB.PCBList);
    let index = PCB.PCBList.findIndex((item) => item == this);
    if (index == -1) {
      throw new Error("进程不存在");
      process.exit(0);
    }
    PCB.PCBStatusList[index] = status;
  }
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
   * 分配的内存块
   */
  memory: MemoryBlock | null = null;

  //////////////////////////////////////////////////////////////
  // 对象方法
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
          return 0;
        case 1:
          this.funs.shift();
          continue;
        case 2:
          logger.debug("进程", this.pname, "时间片用完，进入就绪队列");
          this.status = PStatus.ready;
          return 2;
        default:
          this.funs.shift();
          continue;
      }
    }
    logger.debug("进程", this.pname, "执行完毕");
    this.showStatus = this.status = PStatus.finish;

    return 1;
  }

  /**
   * 创建进程
   * @param name 进程名
   * @param time 进程要求时间
   * @param fun 进程函数列表
   * @param priority 优先级
   * @param memory 内存大小
   */
  static createPCB(
    name: string,
    time: number,
    fun: Array<(p: PCB) => number>,
    priority: number = 0,
    memory: number = 1
  ): PCB | null {
    if (PCB.PCBList.length == 0) {
      logger.error("PCB未初始化");
      process.exit();
    }
    let newPCB = new PCB(name, time, fun, priority);
    // 检查是否有空位
    let MemoryBlock = Memory.distributeMemory(
      memory,
      new Number(newPCB.pid).valueOf()
    );
    if (MemoryBlock == null) {
      logger.error("内存不足");
      return null;
    }
    newPCB.memory = MemoryBlock;
    // 插入就绪队列
    for (let i = 0; i < PCB.PCBList.length; i++) {
      if (!PCB.PCBList[i]) {
        PCB.PCBList[i] = newPCB;
        PCB.PCBStatusList[i] = 1;
        // logger.debug("创建进程", newPCB.pname, "成功");
        newPCB.showStatus = newPCB.status = PStatus.ready;
        return newPCB;
      }
    }
    logger.error("PCB已满");
    return null;
  }
  /**
   * 构造函数
   * @param name 进程名
   * @param time 进程要求时间
   * @param fun 进程函数列表
   * @param priority 优先级
   * @param memory 内存大小
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
    this.status = PStatus.ready;
    this.priority = priority;
    this.pid = Math.floor(Math.random() * 100000).toString();
    // 不满5位补0
    while (this.pid.length < 5) {
      this.pid += " ";
    }
    this.front = null;
    this.mutex = new Semasphore(1, "mutex-" + this.pname);
    this.sm = new Semasphore(0, "sm-" + this.pname);
    this.memory = null;
  }
  /**
   * 初始化
   */
  static init(n: number = PCB.MAX_LENGTH) {
    PCB.MAX_LENGTH = n;
    PCB.PCBList = new Array(PCB.MAX_LENGTH).fill(null);
    PCB.PCBStatusListHis = [
      new Array<number>(PCB.MAX_LENGTH).fill(0),
      new Array<number>(PCB.MAX_LENGTH).fill(0),
    ];
    PCB.PCBStatusList = new Array<number>(PCB.MAX_LENGTH).fill(0);
  }

  ////////////////////////////////////////////////////////////////////////////////////
  // 输出相关
  ////////////////////////////////////////////////////////////////////////////////////
  /**
   * 获取颜色
   * @param n Status
   * @returns
   */
  static getColor = (n: PStatus) => STATUS_COLOR[n].color;

  /**
   * 进程列表
   */
  static PCBList: Array<PCB | null> = [];
  // new Array(PCB.MAX_LENGTH).fill(null);
  /**
   * 刷新进程列表，删除已删除进程
   */
  static flush() {
    let length_ = PCB.PCBList.length;
    for (let i = 0; i < length_; i++) {
      let p: PCB | null = PCB.PCBList[i];
      if (p == null) continue;
      if (p.status == PStatus.deleted) {
        p.showStatus = PStatus.empty;
        PCB.PCBList[i] = null;
      } else if (p.status == PStatus.finish) {
        p.showStatus = p.status = PStatus.deleted;
        //   } else if (
        //     p.status == PStatus.ready &&
        //     PCB.PCBStatusList[i] == PStatus.blockToReady
        //   ) {
      } else {
        p.showStatus = p.status;
      }
    }
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
  static PCBStatusListHis: Array<Array<number>> = [];

  /**
   * 进程信息列表
   * 0:空位，1:就绪，2:执行，3:阻塞，4:已执行完毕，5:运作转阻塞，6:已删除
   */
  static PCBStatusList: Array<number> = [];

  /**
   * 打印进程信息
   * @param CPUtime CPU时间
   * @param ew 额外信息
   */
  static printStatus(CPUtime: number): void {
    // console.log(PCB.PCBStatusList);
    /**
     * 获取背景色
     * @param str 字符串
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
    let str = L + K() + getBgColor(o_t_t(CPUtime)) + K() + L;
    /**
     * 进程日志
     */
    for (let i = 0; i < PCB.PCBStatusList.length; i++) {
      /**
       * 记录器中的进程状态
       */
      let item = PCB.PCBStatusList[i];
      let t = K(5);
      // 如果上一位为非0，但上上一位为0，则打印进程ID
      // 打印进程状态
      if (item == PStatus.empty) {
        // 打印空格
      } else if (item == PStatus.deleted) {
        // 打印空格
        // 释放内存
        Memory.freeMemory((PCB.PCBList[i] as PCB).memory as MemoryBlock);
      } else if (
        PCB.PCBStatusListHis[0][i] == PStatus.empty ||
        PCB.PCBStatusListHis[0][i] == PStatus.deleted
      ) {
        // 如果上一位为0，则打印进程名
        t = getBgColor((PCB.PCBList[i] as PCB).pname);
      } else if (
        PCB.PCBStatusListHis[1][i] == PStatus.empty ||
        PCB.PCBStatusListHis[1][i] == PStatus.deleted
      ) {
        // 打印进程ID
        t = getBgColor((PCB.PCBList[i] as PCB).pid);
      } else if (item == PStatus.finish) {
        // 打印总共运行时间
        let cont = 1;
        for (let j = 0; PCB.PCBStatusListHis[j][i] != 0; j++) {
          cont++;
        }
        t = getBgColor("PT " + o_t_t(cont));
      }
      str += K() + t + K() + PCB.getColor(item) + K() + L;
    }

    // 打印额外信息
    if (PCB.ewif) str += PCB.ew;
    // 打印
    logger.info(str);
    // 记录进程状态
    PCB.PCBStatusListHis.unshift(new Array<number>(...PCB.PCBStatusList));
    // 更新进程状态
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
  return num < 10 ? type + num : num.toString();
}

/**
 * 进程状态
 * 0:空位，1:就绪，2:执行，3:阻塞，4:已执行完毕，5:运作转阻塞，6:已删除
 */
export enum PStatus {
  /**
   * 空位
   */
  empty = 0,
  /**
   * 就绪
   */
  ready = 1,
  /**
   * 执行
   */
  run = 2,
  /**
   * 阻塞
   */
  block = 3,
  /**
   * 执行->完毕
   */
  finish = 4,
  /**
   * 运作->阻塞
   */
  runToBlock = 5,
  /**
   * 已删除（用于渲染空行）
   */
  deleted = 6,
  /**
   * 阻塞->就绪
   */
  blockToReady = 7,
}

/**
 * 颜色
 *  0:空位，1:就绪，2:执行，3:阻塞，4:已执行完毕，5:运作转阻塞，6:已删除
 */
const STATUS_COLOR = {
  "0": {
    name_: "空位",
    color: chalk.bgGray.bold(" "),
  },
  "1": {
    name_: "就绪",
    // color: chalk.bgWhite.bold(" "),
    color: chalk.bgHex("#a8dce3").bold(" "),
    // color: chalk.bgCyanBright.bold(" "),
  },
  "2": {
    name_: "执行",
    color: chalk.bgGreen.bold(" "),
  },
  "3": {
    name_: "阻塞",
    color: chalk.bgYellow.bold(" "),
  },
  "4": {
    name_: "执行完毕",
    color: chalk.bgHex("#006638").bold(" "),
  },
  "5": {
    name_: "运作转阻塞",
    color: chalk.bgHex("#eb6600").bold(" "),
  },
  "6": {
    name_: "已删除",
    color: chalk.bgHex("#404040").bold(" "),
  },
  "7": {
    name_: "阻塞转就绪",
    color: chalk.bgHex("#ebbc00").bold(" "),
  },
};

let str = "";
for (let i in PStatus) {
  if (!isNaN(Number(i)))
    str += STATUS_COLOR[i].name_ + ":" + STATUS_COLOR[i].color + "   ";
}
console.log(str);
