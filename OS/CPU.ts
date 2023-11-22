import chalk from "chalk";
import {
  logger,
  PCB,
  ReadyList,
  Semasphore,
  Message_buffer,
  Primitives,
  PStatus,
  Memory,
  MemoryBlock,
  SystemStatusMonitor,
  ProcessController,
} from "./OS";

export class CPU {
  /**
   * 程序运行时间
   */
  static CPUtime = 0;
  /**
   * 超时时间
   */
  static TIME_OUT = 100;
  /**
   * CPU数量
   */
  static CPU_COUNT = 1;
  /**
   * 主函数
   */
  static main() {
    // 计数器
    ++CPU.CPUtime;
    // 排序
    ReadyList.sort();
    // 执行进程
    let length_ = ReadyList.len();
    // 确保本时刻不能有进程同时被2个CPU执行
    let i = 0;
    for (; i < length_ && i < CPU.CPU_COUNT; i++) {
      let p: PCB = ReadyList.run();
      logger.debug("进程" + p.pname + "开始执行");
      while (p.funs.length > 0) {
        let res: number = p.funs[0](p);
        logger.debug("执行函数，res:", res);
        switch (res) {
          case 0:
            logger.debug("进程", p.pname, "阻塞");
            p.funs.shift();
            SystemStatusMonitor.showStatus(p, PStatus.runToBlock);
            break;
          case 1:
            p.funs.shift();
            continue;
          case 2:
            logger.debug("进程", p.pname, "时间片用完，进入就绪队列");
            SystemStatusMonitor.showStatus(p, PStatus.run);
            p.status = PStatus.ready;
            ReadyList.rePush(p);
            break;
          default:
            p.funs.shift();
            continue;
        }
      }
      if (p.funs.length == 0) {
        p.status = PStatus.finish;
        SystemStatusMonitor.showStatus(p, PStatus.finish);
      }
      logger.debug("进程" + p.pname + "执行完毕", p);
    }
    // 负载
    SystemStatusMonitor.loadCount = i;
  }
}
