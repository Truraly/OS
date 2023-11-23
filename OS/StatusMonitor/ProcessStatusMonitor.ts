import chalk from "chalk";
import {
  debuggerLogger,
  PCB,
  PStatus,
  ProcessController,
  util,
  OS,
  logger,
} from "../OS";
import { StatusMonitor } from "./StatusMonitor";

export class ProcessStatusMonitor extends StatusMonitor {
  /**
   * 初始化
   */
  init(): boolean {
    ProcessStatusMonitor.instance = this;
    this.PCBStatusListHis = [
      new Array<number>(OS.PROCESS_NUM_MAX).fill(PStatus.empty),
      new Array<number>(OS.PROCESS_NUM_MAX).fill(PStatus.empty),
      new Array<number>(OS.PROCESS_NUM_MAX).fill(PStatus.empty),
    ];
    // 打印状态对应的颜色
    let str = "";
    for (let i in PStatus) {
      if (!isNaN(Number(i)))
        str +=
          ProcessStatusMonitor.STATUS_COLOR[i].name_ +
          ":" +
          ProcessStatusMonitor.STATUS_COLOR[i].color +
          "   ";
    }
    logger.info(str);
    return true;
  }
  /**
   * 单例对象,用于外界访问
   */
  static instance: ProcessStatusMonitor;
  /**
   * 获取进程状态对应的颜色
   * @param n Status 状态
   * @returns
   */
  getColor = (n: PStatus) => {
    return ProcessStatusMonitor.STATUS_COLOR.find((item) => item.PStatus == n)
      ?.color;
  };
  /**
   * 刷新监听的进程列表
   */
  flushPCBList() {
    debuggerLogger.debug("刷新PCB列表");
    debuggerLogger.info("this.PCBStatusListHis", this.PCBStatusListHis);
    this.PCBStatusListHis.unshift(
      new Array<number>(...this.PCBStatusListHis[0])
    );
    debuggerLogger.info("this.PCBStatusListHis", this.PCBStatusListHis);
    let length_ = OS.PROCESS_NUM_MAX;
    for (let i = 0; i < length_; i++) {
      let p: PCB | null = ProcessController.PCBList[i];
      if (p == null) {
        this.PCBStatusListHis[0][i] = PStatus.empty;
        continue;
      } else if (this.PCBStatusListHis[0][i] == PStatus.runToBlock) {
        this.PCBStatusListHis[0][i] = PStatus.block;
      } else if (this.PCBStatusListHis[0][i] == PStatus.finish) {
        this.PCBStatusListHis[0][i] = PStatus.empty;
      } else if (this.PCBStatusListHis[0][i] == PStatus.blockToReady) {
        this.PCBStatusListHis[0][i] = PStatus.ready;
      } else if (this.PCBStatusListHis[0][i] == PStatus.deleted) {
        this.PCBStatusListHis[0][i] = PStatus.empty;
      } else if (this.PCBStatusListHis[0][i] == PStatus.run) {
        this.PCBStatusListHis[0][i] = PStatus.ready;
      }
    }
    debuggerLogger.info("this.PCBStatusListHis", this.PCBStatusListHis);
  }

  /**
   * 清理无用记录
   * @returns
   */
  clean(): void {
    // 删除已经没用的记录
    // 从现在开始往上翻，如果从某一条记录开始，没有任何一个进程是当前有的，那么从这里到之前都是无用的，全部删除
    // 创建相同长度的数组
    let pidarr = new Array<number>(ProcessController.PCBList.length).fill(1);
    for (let i = 4; i < this.PCBStatusListHis.length; i++) {
      for (let j = 0; j < ProcessController.PCBList.length; j++) {
        if (
          this.PCBStatusListHis[i][j] == 0 &&
          pidarr[j] == 1 &&
          this.PCBStatusListHis[i - 1][j] == 0
        ) {
          pidarr[j] = 0;
        }
      }
      // 如果数组全是0，说明这一条记录是无用的
      if (pidarr.every((item) => item == 0)) {
        // 删除后面全部
        debuggerLogger.debug(
          "删除无用记录",
          this.PCBStatusListHis.length - i,
          "条"
        );
        this.PCBStatusListHis.splice(i);
        debuggerLogger.info(
          "PCB.PCBStatusListHis.length",
          this.PCBStatusListHis.length
        );
        return;
      }
    }
  }
  /**
   * 进程信息列表his
   * 0:空位，1:就绪，2:执行，3:阻塞，4:已执行完毕，5:运作转阻塞，6:已删除
   */
  PCBStatusListHis: Array<Array<number>> = [];
  /**
   * 打印进程信息
   */
  getStatus(): string {
    debuggerLogger.debug("打印进程信息");
    debuggerLogger.debug("PCBStatusListHis", this.PCBStatusListHis);
    let str = "";
    /**
     * 进程日志
     */
    for (let i = 0; i < OS.PROCESS_NUM_MAX; i++) {
      /**
       * 进程信息
       */
      let msg = "";
      /**
       * 记录器中的进程状态
       */
      let PcStatus = this.PCBStatusListHis[0][i];
      // 如果上一位为非0，但上上一位为0，则打印进程ID
      // 打印进程状态
      if (PcStatus == PStatus.empty) {
        // 打印空格
      } else if (PcStatus == PStatus.deleted) {
      } else if (
        this.PCBStatusListHis[1][i] == PStatus.empty ||
        this.PCBStatusListHis[1][i] == PStatus.deleted ||
        this.PCBStatusListHis[1][i] == PStatus.finish
      ) {
        // 如果上一位为0，则打印进程名
        msg = (ProcessController.PCBList[i] as PCB)?.pname || "unknown";
      } else if (
        this.PCBStatusListHis[2][i] == PStatus.empty ||
        this.PCBStatusListHis[2][i] == PStatus.deleted ||
        this.PCBStatusListHis[1][i] == PStatus.finish
      ) {
        // 打印进程ID
        msg = (ProcessController.PCBList[i] as PCB)?.pid;
      } else if (PcStatus == PStatus.finish) {
        // 打印总共运行时间
        msg = "PT"; //  + (CPU.CPUtime - (ProcessController.PCBList[i] as PCB).joinTime);
      }
      str +=
        util.getBgColor(` ${util.formatStr(msg, 5)} `) +
        this.getColor(PcStatus) +
        util.getBgColor(" |");
    }
    this.flushPCBList();
    this.clean();
    return str;
  }
  /**
   * 获取表头
   */
  getHead(): string {
    let str = "";
    for (let i = 0; i < OS.PROCESS_NUM_MAX; i++) {
      str += util.getBgColor(`进程 状态|`);
    }
    return str;
  }
  /**
   * 本轮展示的状态
   *  @param status number
   *  0:空位，1:就绪，2:执行，3:阻塞，4:已执行完毕，5:运作转阻塞，6:已删除
   */
  setShowStatus(p: PCB, status: PStatus) {
    debuggerLogger.debug("设置进程", p.pname, "展示状态为", status);
    let index = ProcessController.PCBList.findIndex((item) => item == p);
    if (index == -1) {
      throw new Error("进程不存在");
    }
    this.PCBStatusListHis[0][index] = status;
  }

  /**
   * 颜色
   *  0:空位，1:就绪，2:执行，3:阻塞，4:已执行完毕，5:运作转阻塞，6:已删除
   */
  static STATUS_COLOR: Array<{
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
}
