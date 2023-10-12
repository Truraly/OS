import chalk from "chalk";
import Log4js from "log4js";

Log4js.configure({
  appenders: {
    OS: {
      type: "console",
      layout: {
        type: "pattern",
        pattern: "%m",
      },
    },
  },
  categories: {
    default: {
      appenders: ["OS"],
      //   level: "debug",
      level: "info",
    },
  },
});
const logger = Log4js.getLogger("OS");
/**
 * 获取颜色
 * @param n
 * @returns
 */
function getColor(n: number) {
  return [
    chalk.blue.bgGray.bold(" "),
    chalk.blue.bgGreen.bold(" "),
    chalk.blue.bgYellow.bold(" "),
    chalk.blue.bgGray.bold(" "),
  ][n];
}
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

/**
 * 信号量类
 */
class semasphore {
  /**
   *
   */
  name_: string;
  /**
   * 信号量值
   */
  value: number;
  /**
   * 阻塞队列
   */
  queue: Array<process_>;
  /**
   * 构造函数
   * @param value 信号量值
   */
  constructor(value: number, name: string) {
    this.value = value;
    this.name_ = name;
    this.queue = new Array<process_>();
  }
  /**
   * P操作，返回是否执行
   * @param p 进程
   * @returns true 执行
   * @returns false 阻塞
   */
  P(p: process_): boolean {
    logger.debug(p.pname, "P操作", this.name_);
    this.value--;
    if (this.value < 0) {
      this.queue.push(p);
      p.status = 2;
      logger.debug(p.pname, "P操作阻塞", this);
      return false;
    }
    logger.debug(p.pname, "P操作", this.name_, "成功");
    return true;
  }
  /**
   * V操作
   */
  V(p: process_): void {
    logger.debug(p.pname, "V操作", this.name_);
    this.value++;
    if (this.value <= 0) {
      let p = this.queue.shift();
      if (p) {
        logger.debug(p.pname, "被V操作唤醒");
        readyList_.push(p);
      } else {
        throw new Error("信号量出错");
      }
    }
  }
}
/**
 * 进程类
 */
class process_ {
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
  funs: Array<(p: process_) => number>;
  /**
   * 进程要求时间
   */
  needTime: number;
  /**
   * 进程状态
   * 0:就绪，1:执行，2:阻塞，3:执行完毕
   */
  status: number;
  /**
   * 优先级
   */
  priority: number;
  /**
   * 构造函数
   * @param name
   * @param time
   * @param fun
   * @param priority
   */
  constructor(
    name: string,
    time: number,
    fun: Array<(p: process_) => number>,
    priority: number = 0
  ) {
    this.funs = fun;
    this.pname = name;
    this.needTime = time;
    this.status = 0;
    this.priority = priority;
    this.pid = Math.floor(Math.random() * 100000).toString();
  }
}

/**
 * 就绪列表类
 */
class readyList {
  /**
   * 就绪列表
   */
  _list: Array<process_> = new Array<process_>();
  /**
   * 排序
   */
  sort() {
    this._list.sort((a, b) => {
      return b.priority - a.priority;
    });
  }
  /**
   * 添加进程
   */
  push(p: process_) {
    this._list.push(p);
    p.status = 0;
  }
  /**
   * 取出进程
   */
  shift(): process_ {
    let p = this._list.shift();
    if (!p) {
      throw new Error("就绪队列出错");
    }
    return p;
  }
  /**
   * findByPid
   * @param pid
   * @returns 进程指针
   */
  findByPid(pid: string): process_ | undefined {
    return this._list[this._list.findIndex((item) => item.pid == pid)];
  }
  /**
   * 进程数量
   */
  get length(): number {
    return this._list.length;
  }
  /**
   * 加入进程
   */
  join() {
    let p = this._list.shift();
    if (!p) {
      throw new Error("就绪队列出错");
    }
    log.some((item) => {
      if (item[0] == p?.pid) {
        item[1] = 1;
        return true;
      }
      return false;
    });
    p.status = 1;
    return p;
  }
}

/**
 * 写者进程函数
 */
const writer: Array<(p: process_) => number> = [
  (p) => (Wmutex.P(p) ? 0 : 1),
  (p) => {
    p.needTime--;
    if (p.needTime > 0) return 2;
    return 0;
  },
  (p) => {
    Wmutex.V(p);
    return 0;
  },
];

/**
 * 读者进程函数
 */
const reader: Array<(p: process_) => number> = [
  (p) => (Rmutex.P(p) ? 0 : 1),
  (p) => {
    if (readcount == 0) {
      logger.debug("第一个读者");
      return Wmutex.P(p) ? 0 : 1;
    }
    return 0;
  },
  (p) => {
    readcount++;
    Rmutex.V(p);
    return 0;
  },
  (p) => {
    p.needTime--;
    if (p.needTime > 0) return 2;
    return 0;
  },
  (p) => {
    return Rmutex.P(p) ? 0 : 1;
  },
  (p) => {
    readcount--;
    Rmutex.V(p);
    if (readcount == 0) {
      logger.debug("最后一个读者");
      Wmutex.V(p);
    }
    return 0;
  },
];

/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

/**
 * 程序运行时间
 */
let CPUtime = 0;
/**
 * 写信号量
 */
let Wmutex = new semasphore(1, "Wmutex");
/**
 * 读写“读者数量”信号量
 */
let Rmutex = new semasphore(1, "Rmutex");
/**
 * 读者数量
 */
let readcount = 0;

/**
 * 执行记录
 * [pid, status, log, pname]
 */
let log = new Array<[string, number, number, string]>();
/**
 * 程序运行
 */
const readyList_ = new readyList();
function main() {
  logger.info("开始运行\n");
  logger.info("|时间| 进程...");
  while (true) {
    // 计数器+1
    ++CPUtime;
    // 载入就绪的进程
    test.forEach((item) => {
      if (!(item[2] == CPUtime)) return;
      let pp: process_ = new process_(
        (item[1].toString() + item[0].toString()) as string,
        item[3] as number,
        item[1] == "w" ? new Array(...writer) : new Array(...reader)
      );
      readyList_.push(pp);
      logger.debug("进程" + pp.pname + "已载入");
      log.push([pp.pid, pp.status, 0, pp.pname]);
    });
    // 输出就绪队列
    logger.debug(
      "就绪队列：",
      readyList_._list.map((item) => item.pname)
    );
    // 定时跳出
    if (CPUtime > 30) {
      logger.debug("时间到");
      break;
    }
    // 选择优先级最高的进程
    readyList_.sort();
    // 重置log
    log.forEach((item) => {
      if (item[1] == 1) {
        item[1] = 3;
      }
    });
    // 执行进程
    let length_ = readyList_.length;
    for (let i = 0; i < length_; i++) {
      let p: process_ = readyList_.join();
      logger.debug("进程" + p.pname + "开始执行");
      p.run();
      logger.debug("进程" + p.pname + "执行完毕", p);
      if (p.status == 3) {
      } else if (p.status == 2) {
        log[log.findIndex((item) => item[0] == (p as process_).pid)][1] =
          p.status;
      } else if (p.status == 1) {
        readyList_.push(p);
      } else {
        throw new Error("进程状态出错");
      }
    }
    printStatus();
  }
}
main();
/**
 * 输出状态
 */
function printStatus() {
  let str = "| " + o_t_t(CPUtime) + " | ";
  for (let i = 0; i < log.length; i++) {
    let t = "";
    if (log[i][2] == 0) {
      t = log[i][0];
      log[i][2] = 1;
    } else if (log[i][2] == 1) {
      // 删除超长的部分
      let pn = log[i][3].slice(0, log[i][0].length - 1);
      // 填充空格
      let n = log[i][0].length - pn.length;
      let p = "";
      for (let i = 0; i < n; i++) {
        p += " ";
      }
      t = pn + p;
      log[i][2] = 2;
    } else {
      t = log[i][0].replace(/[^ ]/g, " ");
    }
    str += t + " " + getColor(log[i][1]) + " | ";
  }
  logger.info(str);
}

function o_t_t(num: number, type: string = " ") {
  return num < 10 ? type + num : num;
}
