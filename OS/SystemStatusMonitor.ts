import {
  logger,
  debuggerLogger,
  PCB,
  ReadyList,
  Semasphore,
  Message_buffer,
  Primitives,
  CPU,
  PStatus,
  Memory,
  MemoryBlock,
  ProcessController,
  MemoryController,
} from "./OS";
import chalk from "chalk";

export class SystemStatusMonitor {
  /**
   * 最大进程数量
   */
  static MAX_LENGTH = 5;
  /**
   * 需要监控的属性
   */
  static Mon: Array<
    "PCB" | "MemoryDetail" | "MemoryBar" | "Load" | "MemoryRate"
  >;
  /**
   * 打印状态
   */
  static printSystemStatus() {
    debuggerLogger.debug("CPU.CPUtime", CPU.CPUtime);
    let str = `| ${SystemStatusMonitor.formatStr(
      Math.floor(CPU.CPUtime % 1000).toString(),
      3
    )} |`;
    SystemStatusMonitor.Mon.forEach((item) => {
      switch (item) {
        case "PCB":
          str += SystemStatusMonitor.getPCBStatus();
          break;
        case "MemoryBar":
          str += SystemStatusMonitor.getMemoryBar(true);
          break;
        case "MemoryDetail":
          str += SystemStatusMonitor.getMemoryDetail(true);
          break;
        case "Load":
          str += SystemStatusMonitor.getLoad();
          break;
        case "MemoryRate":
          str += SystemStatusMonitor.getMemoryRet();
          break;
      }
    });
    logger.info(str);

    // 删除需要删除的进程
    SystemStatusMonitor.delPCB.forEach((item) => {
      ProcessController.deletePCB(item);
    });
    SystemStatusMonitor.delPCB = new Array<PCB>();
  }
  /**
   * 打印表头
   */
  static printSystemStatusHead() {
    let str = `|时间 |`;
    SystemStatusMonitor.Mon.forEach((item) => {
      switch (item) {
        case "PCB":
          for (let i = 0; i < SystemStatusMonitor.MAX_LENGTH; i++) {
            str += "进程 状态|";
          }
          break;
        case "MemoryBar":
          str += "内存条";
          for (let i = 0; i < SystemStatusMonitor.MEMORY_BAR_LENGTH - 6; i++) {
            str += " ";
          }
          str += "|";
          break;
        case "MemoryDetail":
          str += "内存详情";
          break;
        case "Load":
          str += "负载";
          for (let i = 0; i < CPU.CPU_COUNT - 4; i++) {
            str += " ";
          }
          str += "|";
          break;
        case "MemoryRate":
          str += "MRate |";
          break;
      }
    });
    logger.info(str);
  }
  /////////////////////////////////////////////////////////
  /// PCB状态监控
  ////////////////////////
  /**
   * 获取进程状态对应的颜色
   * @param n Status 状态
   * @returns
   */
  static getColor = (n: PStatus) => {
    return STATUS_COLOR.find((item) => item.PStatus == n)?.color;
  };

  /**
   * 刷新监听的进程列表，删除已删除进程
   */
  static flushPCBList() {
    debuggerLogger.debug("刷新PCB列表");
    debuggerLogger.info(
      "SystemStatusMonitor.PCBStatusListHis",
      SystemStatusMonitor.PCBStatusListHis
    );
    SystemStatusMonitor.PCBStatusListHis.unshift(
      new Array<number>(...SystemStatusMonitor.PCBStatusListHis[0])
    );
    debuggerLogger.info(
      "SystemStatusMonitor.PCBStatusListHis",
      SystemStatusMonitor.PCBStatusListHis
    );
    let length_ = SystemStatusMonitor.MAX_LENGTH;
    for (let i = 0; i < length_; i++) {
      let p: PCB | null = ProcessController.PCBList[i];
      if (p == null) {
        SystemStatusMonitor.PCBStatusListHis[0][i] = PStatus.empty;
        continue;
      } else if (
        SystemStatusMonitor.PCBStatusListHis[0][i] == PStatus.runToBlock
      ) {
        SystemStatusMonitor.PCBStatusListHis[0][i] = PStatus.block;
      }
    }
    debuggerLogger.info(
      "SystemStatusMonitor.PCBStatusListHis",
      SystemStatusMonitor.PCBStatusListHis
    );

    // 删除已经没用的记录
    // 从现在开始往上翻，如果从某一条记录开始，没有任何一个进程是当前有的，那么从这里到之前都是无用的，全部删除
    // 创建相同长度的数组
    let pidarr = new Array<number>(ProcessController.PCBList.length).fill(1);
    for (let i = 4; i < SystemStatusMonitor.PCBStatusListHis.length; i++) {
      for (let j = 0; j < ProcessController.PCBList.length; j++) {
        if (
          SystemStatusMonitor.PCBStatusListHis[i][j] == 0 &&
          pidarr[j] == 1 &&
          SystemStatusMonitor.PCBStatusListHis[i - 1][j] == 0
        ) {
          pidarr[j] = 0;
        }
      }
      // 如果数组全是0，说明这一条记录是无用的
      if (pidarr.every((item) => item == 0)) {
        // 删除后面全部
        debuggerLogger.debug(
          "删除无用记录",
          SystemStatusMonitor.PCBStatusListHis.length - i,
          "条"
        );
        SystemStatusMonitor.PCBStatusListHis.splice(i);
        debuggerLogger.info(
          "PCB.PCBStatusListHis.length",
          SystemStatusMonitor.PCBStatusListHis.length
        );
        return;
      }
    }
  }
  /**
   * 获取是否有记录空位
   * @returns true 有空位
   * @returns false 没有空位
   */
  static getLogsEmpty(): boolean {
    return ProcessController.PCBList.some((item) => item == null);
  }

  /**
   * 进程信息列表his
   * 0:空位，1:就绪，2:执行，3:阻塞，4:已执行完毕，5:运作转阻塞，6:已删除
   */
  static PCBStatusListHis: Array<Array<number>> = [];

  /**
   * 获取指定数量的空位
   */
  static getEmpty(n: number): string {
    let str = "";
    for (let i = 0; i < n; i++) {
      str += " ";
    }
    return str;
  }
  /**
   * 将字符出传转为指定背景的字符
   * @param str 字符串
   */
  static getBgColor(str: string) {
    return [chalk.bgHex("#262626"), chalk.white][CPU.CPUtime % 2](str);
  }
  /**
   * 截取字符串 不足补空格
   * @param str 字符串
   * @param n 截取长度
   */
  static formatStr(str: string, n: number) {
    if (str.length > n) {
      return str.slice(0, n - 1) + "…";
    }
    let str_ = str;
    for (let i = 0; i < n - str.length; i++) {
      str_ += " ";
    }
    return str_;
  }
  /**
   * 打印进程信息
   */
  static getPCBStatus(): string {
    debuggerLogger.debug("打印进程信息");
    debuggerLogger.debug(
      "PCBStatusListHis",
      SystemStatusMonitor.PCBStatusListHis
    );
    let str = "";
    /**
     * 进程日志
     */
    for (let i = 0; i < SystemStatusMonitor.MAX_LENGTH; i++) {
      /**
       * 进程信息
       */
      let msg = "";
      /**
       * 记录器中的进程状态
       */
      let PcStatus = SystemStatusMonitor.PCBStatusListHis[0][i];
      // 如果上一位为非0，但上上一位为0，则打印进程ID
      // 打印进程状态
      if (PcStatus == PStatus.empty) {
        // 打印空格
      } else if (PcStatus == PStatus.deleted) {
      } else if (
        SystemStatusMonitor.PCBStatusListHis[1][i] == PStatus.empty ||
        SystemStatusMonitor.PCBStatusListHis[1][i] == PStatus.deleted
      ) {
        // 如果上一位为0，则打印进程名
        msg = (ProcessController.PCBList[i] as PCB)?.pname || "unknown";
      } else if (
        SystemStatusMonitor.PCBStatusListHis[2][i] == PStatus.empty ||
        SystemStatusMonitor.PCBStatusListHis[2][i] == PStatus.deleted
      ) {
        // 打印进程ID
        msg = (ProcessController.PCBList[i] as PCB)?.pid;
      } else if (PcStatus == PStatus.finish) {
        // 打印总共运行时间
        msg = "PT"; //  + (CPU.CPUtime - (ProcessController.PCBList[i] as PCB).joinTime);
      }
      str +=
        SystemStatusMonitor.getBgColor(
          ` ${SystemStatusMonitor.formatStr(msg, 5)} `
        ) +
        SystemStatusMonitor.getColor(PcStatus) +
        SystemStatusMonitor.getBgColor(" |");
    }
    return str;
  }
  /**
   * 本轮展示的状态
   *  @param status number
   *  0:空位，1:就绪，2:执行，3:阻塞，4:已执行完毕，5:运作转阻塞，6:已删除
   */
  static setShowStatus(p: PCB, status: PStatus) {
    debuggerLogger.debug("设置进程", p.pname, "展示状态为", status);
    let index = ProcessController.PCBList.findIndex((item) => item == p);
    if (index == -1) {
      throw new Error("进程不存在");
    }
    SystemStatusMonitor.PCBStatusListHis[0][index] = status;
  }
  /////////////////////////////////////////////////////////
  /// 内存状态监控
  ////////////////////////
  /**
   * 需要删除的进程
   */
  static delPCB = new Array<PCB>();
  /**
   * 内存条长度
   */
  static MEMORY_BAR_LENGTH = 50;

  /**
   * 打印内存
   */
  static getMemoryDetail(ret: boolean = false) {
    let str = "";
    MemoryController.memoryAlgorithm.forEach((block, index) => {
      debuggerLogger.debug("block", block);
      let add = `${block.start} ${block.start + block.size - 1}`;
      str +=
        `|` +
        (block.status == 1
          ? chalk.bgHex("#66bc7e").bold(add)
          : chalk.bgGray.bold(add));
    });
    str += `|`;
    if (!ret) logger.info("内存:", str);
    else return str;
  }

  /**
   * 打印内存 进度条形式
   * @param len 进度条长度
   * @param ret 是否返回
   */
  static getMemoryBar(ret: boolean = false) {
    let str = "";
    let p =
      MemoryController.MEMORY.MEMORY_SIZE /
      SystemStatusMonitor.MEMORY_BAR_LENGTH;
    // 统计每一段内存被占用的数量
    let arr = new Array(SystemStatusMonitor.MEMORY_BAR_LENGTH).fill(0);
    MemoryController.memoryAlgorithm.forEach((block, index) => {
      // logger.warn(block.status);
      if (block.status == 0) return;
      let start = block.start;
      let end = block.start + block.size - 1;
      for (let i = start; i <= end; i++) {
        arr[Math.floor(i / p)]++;
      }
    });
    // 绘制进度条
    // 小于33% 灰色 33%-66% 浅绿 66%-100% 绿
    arr.forEach((v) => {
      v = (v / p) * 100;
      if (v < 33) {
        str += chalk.bgGray(" ");
      } else if (v < 66) {
        str += chalk.bgHex("#66bc7e")(" ");
      } else {
        str += chalk.bgHex("#2a9d8f")(" ");
      }
    });
    if (!ret) logger.info("内存:", str);
    else return str + "|";
  }
  /**
   * 获取内存使用率,返回百分比,保留1位小数
   */
  static getMemoryRet() {
    let UseCount = 0;
    MemoryController.memoryAlgorithm.forEach((block, index) => {
      if (block.status == 1) UseCount += block.size;
    });
    return SystemStatusMonitor.formatStr(
      (
        Math.round((UseCount / MemoryController.MEMORY.MEMORY_SIZE) * 1000) / 10
      ).toString() + "%",
      6
    );
  }
  ///////////////////////////////////////////////
  // 负载监控

  /**
   * 负载计数
   */
  static loadCount: number = 0;
  /**
   * 获取负载
   */
  static getLoad() {
    let str = "";
    for (let i = 0; i < SystemStatusMonitor.loadCount; i++) {
      str += "*";
    }
    return SystemStatusMonitor.formatStr(str, Math.max(CPU.CPU_COUNT, 4)) + "|";
  }
  /**
   * 重置负载
   */
  static resetLoad() {
    SystemStatusMonitor.loadCount = 0;
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
 * 颜色
 *  0:空位，1:就绪，2:执行，3:阻塞，4:已执行完毕，5:运作转阻塞，6:已删除
 */
const STATUS_COLOR: Array<{
  PStatus: PStatus;
  name_: string;
  color: string;
}> = [
  {
    PStatus: PStatus.empty,
    name_: "空位",
    color: chalk.bgGray.bold(" "),
  },
  {
    PStatus: PStatus.ready,
    name_: "就绪",
    // color: chalk.bgWhite.bold(" "),
    color: chalk.bgHex("#a8dce3").bold(" "),
    // color: chalk.bgCyanBright.bold(" "),
  },
  {
    PStatus: PStatus.run,
    name_: "执行",
    color: chalk.bgGreen.bold(" "),
  },
  {
    PStatus: PStatus.block,
    name_: "阻塞",
    color: chalk.bgYellow.bold(" "),
  },
  {
    PStatus: PStatus.finish,
    name_: "执行完毕",
    color: chalk.bgHex("#006638").bold(" "),
  },
  {
    PStatus: PStatus.runToBlock,
    name_: "运作转阻塞",
    color: chalk.bgHex("#eb6600").bold(" "),
  },
  {
    PStatus: PStatus.deleted,
    name_: "已删除",
    color: chalk.bgHex("#404040").bold(" "),
  },
  {
    PStatus: PStatus.blockToReady,
    name_: "阻塞转就绪",
    color: chalk.bgHex("#ebbc00").bold(" "),
  },
];

let str = "";
for (let i in PStatus) {
  if (!isNaN(Number(i)))
    str += STATUS_COLOR[i].name_ + ":" + STATUS_COLOR[i].color + "   ";
}
logger.info(str);
