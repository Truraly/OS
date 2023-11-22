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
} from "./OS";

export class CPU {
  /**
   * 额外信息
   */
  static msgif: boolean = false;
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
  static async start(
    beforeDo: () => boolean | Promise<boolean>,
    afterDo: () => boolean | Promise<boolean>
  ) {
    /**
     * 程序运行
     */
    logger.info("CPU数量：", CPU.CPU_COUNT);
    logger.info("监控最大大小：", PCB.MAX_LENGTH);
    logger.info("CPU开始运行");
    logger.info("-----------------------------------------------------------");
    PCB.printTitle();
    // 计数器+1
    while (++CPU.CPUtime) {
      // 执行前
      if (!(await beforeDo())) {
        // 推出程序并打印进程状态
        PCB.printStatus(CPU.CPUtime);
        break;
      }
      // 定时跳出
      if (CPU.CPUtime > CPU.TIME_OUT && CPU.TIME_OUT != 0) {
        logger.warn("进程执行超时");
        logger.warn("ReadyList.readyList:", ReadyList.readyList);
        break;
      }
      /**
       * 额外信息
       */
      PCB.ew = "";
      // 输出就绪队列
      logger.debug("就绪队列：", ReadyList.Print());
      // 排序
      ReadyList.sort();
      // 执行进程
      let length_ = ReadyList.len();
      // 确保本时刻不能有进程同时被2个CPU执行
      let i = 0;
      for (; i < length_ && i < CPU.CPU_COUNT; i++) {
        // console.log(i);
        let p: PCB = ReadyList.run();
        logger.debug("进程" + p.pname + "开始执行");
        p.run();

        if (CPU.msgif)
          PCB.ew += "run:" + p.pname.trim() + " pri->" + p.priority + "|";
        logger.debug("进程" + p.pname + "执行完毕", p);
        switch (p.status as PStatus) {
          case PStatus.block:
            break;
          case PStatus.finish:
            break;
          case PStatus.ready:
            // 放回就绪队列
            ReadyList.rePush(p);
            break;
          default:
            logger.error(p);
            throw new Error("进程状态出错");
        }
      }
      let str = "";
      while (i-- > 0) str += "*";
      PCB.ew += "负载:" + str;
      //   console.log(PCB.PCBStatusList);
      // 打印进程状态
      PCB.printStatus(CPU.CPUtime);
      if (!(await afterDo())) {
        // 推出程序并打印进程状态
        PCB.printStatus(CPU.CPUtime);
        break;
      }
      Memory.print();
    }
  }
}

/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
