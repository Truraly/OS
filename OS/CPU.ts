import chalk from "chalk";
import {
  logger,
  debuggerLogger,
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
import { P } from "./Primitives";

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
    SystemStatusMonitor.resetLoad();
    for (
      ;
      SystemStatusMonitor.loadCount < length_ &&
      SystemStatusMonitor.loadCount < CPU.CPU_COUNT;
      SystemStatusMonitor.loadCount++
    ) {
      let p: PCB = ReadyList.shift();
      SystemStatusMonitor.setShowStatus(p, PStatus.run);
      p.status = PStatus.run;
      debuggerLogger.debug("进程" + p.pname + "开始执行");
      while (p.funs.length > 0) {
        let res: number = p.funs[0](p);
        logger.debug("执行函数，res:", res);
        if (res == 0) {
          debuggerLogger.debug("进程", p.pname, "阻塞");
          p.funs.shift();
          SystemStatusMonitor.setShowStatus(p, PStatus.runToBlock);
          p.status = PStatus.block;
          break;
        } else if (res == 1) {
          debuggerLogger.debug("进程", p.pname, "正常执行");
          p.funs.shift();
          continue;
        } else if (res == 2) {
          debuggerLogger.debug("进程", p.pname, "时间片用完，进入就绪队列");
          SystemStatusMonitor.setShowStatus(p, PStatus.run);
          p.status = PStatus.ready;
          ReadyList.rePush(p);
          break;
        } else {
          p.funs.shift();
          continue;
        }
      }
      if (p.funs.length == 0) {
        p.status = PStatus.finish;
        debuggerLogger.debug("进程", p.pname, "执行完毕");
        SystemStatusMonitor.setShowStatus(p, PStatus.finish);
        debuggerLogger.debug("释放进程", p.pname, "的内存");
        ProcessController.deletePCB(p);
      }
      logger.debug("进程" + p.pname + "执行完毕", p);
    }
  }
}
