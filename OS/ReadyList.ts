import {
  CPU,
  logger,
  debuggerLogger,
  MemoryAlgorithm,
  MemoryBlock,
  MemoryAlgorithmFF,
  MemoryBlockFF,
  checkMemory,
  MemoryAlgorithmNF,
  MemoryBlockNF,
  MemoryController,
  Memory,
  Message_buffer,
  OS,
  PCB,
  PStatus,
  RunFunctions,
  send,
  P,
  V,
  ProcessController,
  Semasphore,
  AdditionalMonitor,
  CPuLoadMonitor,
  MemoryMonitorBar,
  MemoryMonitorDetail,
  MemoryMonitorRate,
  ProcessStatusMonitor,
  StatusMonitor,
  SystemStatusMonitor,
  util,
} from "./index";
/**
 * 就绪列表类
 */
export class ReadyList {
  /**
   * 排序
   */
  static sort() {
    this.readyList.sort((a, b) => {
      return b.priority - a.priority;
    });
  }
  /**
   * 添加进程
   */
  static push(p: PCB) {
    this.readyList.push(p);
   ProcessStatusMonitor.instance?.setShowStatus(p, PStatus.ready);
    p.status = PStatus.ready;
  }
  /**
   * 保持进程状态，进入就绪队列
   */
  static rePush(p: PCB) {
    this.readyList.push(p);
  }
  /**
   * 取出进程
   */
  static shift(): PCB {
    let p = this.readyList.shift();
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
  static findByPid(pid: string): PCB | undefined {
    return this.readyList[this.readyList.findIndex((item) => item.pid == pid)];
  }
  /**
   * 进程数量
   */
  static len(): number {
    return this.readyList.length;
  }
  /**
   * 打印就绪队列
   */
  static Print(): string {
    return ReadyList.readyList.map((item) => item.pname).join(",");
  }
  /**
   * 就绪队列
   */
  static readyList: Array<PCB>;
  /**
   * 初始化
   */
  static init() {
    this.readyList = new Array<PCB>();
  }
}
