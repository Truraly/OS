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
  ReadyList,
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
 * 信号量类
 */
export class Semasphore {
  /**
   * 信号量名
   *
   * 不要重名
   */
  name_: string;
  /**
   * 信号量值
   */
  value: number;
  /**
   * 阻塞队列
   */
  queue: Array<PCB>;
  /**
   * 构造函数
   * @param value 信号量值
   * @param name 信号量名
   */
  constructor(value: number, name: string) {
    this.value = value;
    this.name_ = name;
    this.queue = new Array<PCB>();
    Semasphore.semasphoreList.push(this);
  }
  /**
   * 信号量列表
   */
  static semasphoreList: Array<Semasphore> = new Array<Semasphore>();
  /**
   * 通过信号量名查找信号量
   * @param name 信号量名
   * @returns 信号量指针
   */
  static findByName(name: string): Semasphore {
    let r =
      this.semasphoreList[
        this.semasphoreList.findIndex((item) => item.name_ == name)
      ];
    if (r) {
      return r;
    }
    throw new Error("信号量出错");
  }
}

//   /**
//    * P操作，返回是否执行
//    * @param p 进程
//    * @returns true 执行
//    * @returns false 阻塞
//    */
//   P(p: PCB): boolean {
//     logger.debug(p.pname, "P操作", this.name_);
//     this.value--;
//     if (this.value < 0) {
//       this.queue.push(p);
//       p.status = PStatus.block;
//       logger.debug(p.pname, "P操作阻塞", this);
//       return false;
//     }
//     logger.debug(p.pname, "P操作", this.name_, "成功");
//     return true;
//   }
//   /**
//    * V操作
//    */
//   V(p: PCB): void {
//     logger.debug(p.pname, "V操作", this.name_);
//     this.value++;
//     if (this.value <= 0) {
//       let p = this.queue.shift();
//       if (p) {
//         logger.debug(p.pname, "被V操作唤醒");
//         ReadyList.push(p);
//       } else {
//         throw new Error("信号量出错");
//       }
//     }
