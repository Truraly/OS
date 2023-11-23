import {
  logger,
  PCB,
  ReadyList,
  Semasphore,
  Message_buffer,
  Primitives,
  CPU,
  PStatus,
  Memory,
  MemoryBlock,
  SystemStatusMonitor,
  debuggerLogger,
  MemoryController,
  util,
  ProcessStatusMonitor,
  OS,
  AdditionalMonitor,
} from "./OS";

export class ProcessController {
  /**
   * 监听的进程列表
   */
  static PCBList: Array<PCB | null> = [];
  /**
   * 进程计数
   */
  static processCount = 1;
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
    if (ProcessController.PCBList.length == 0) {
      logger.error("PCB未初始化");
      process.exit();
    }
    //
    let newPCB: PCB = {
      runFunctions: new Array<(p: PCB) => number>(...fun),
      pname: name,
      needTime: time,
      status: PStatus.ready,
      priority: priority,
      pid: util.formatStr((ProcessController.processCount++).toString(), 5),
      front: null,
      mutex: new Semasphore(1, "mutex-" + name),
      sm: new Semasphore(0, "sm-" + name),
      memory: null,
      joinTime: CPU.CPUtime,
    };
    // 检查是否有空位
    if (!ProcessController.getLogsEmpty()) {
      //   logger.error("PCB已满,创建进程失败");
      AdditionalMonitor.instance?.setMessage("PCB已满,创建进程失败");
      return null;
    }
    // 检查是否有空位
    let MemoryBlock = MemoryController.memoryAlgorithm.distributeMemory(
      memory,
      new Number(newPCB.pid).valueOf()
    );
    if (MemoryBlock == null) {
      //   logger.error("内存不足");
      AdditionalMonitor.instance?.setMessage("内存不足,创建进程失败");
      return null;
    }
    newPCB.memory = MemoryBlock as MemoryBlock;
    // 插入就绪队列
    for (let i = 0; i < ProcessController.PCBList.length; i++) {
      if (!ProcessController.PCBList[i]) {
        ProcessController.PCBList[i] = newPCB;
        if (ProcessStatusMonitor.instance) {
          ProcessStatusMonitor.instance.PCBStatusListHis[0][i] = 1;
        }
        // logger.debug("创建进程", newPCB.pname, "成功");
        ProcessStatusMonitor.instance?.setShowStatus(newPCB, PStatus.ready);
        newPCB.status = PStatus.ready;
        ReadyList.push(newPCB);
        return newPCB;
      }
    }
    logger.error("PCB已满");
    return null;
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
   * 删除进程
   */
  static deletePCB(pcb: PCB) {
    debuggerLogger.debug("删除进程", pcb.pname);
    let index = ProcessController.PCBList.indexOf(pcb);
    if (index == -1) {
      debuggerLogger.error("进程不存在");
      return;
    }

    ProcessController.PCBList[index] = null;
    pcb.status = PStatus.deleted;
    ReadyList.readyList = ReadyList.readyList.filter((item) => item != pcb);
    if (pcb.memory) MemoryController.memoryAlgorithm.freeMemory(pcb.memory);
    debuggerLogger.debug("删除进程", pcb.pname, "成功");
  }

  /**
   * 初始化
   */
  static init() {
    ProcessController.PCBList = new Array(OS.PROCESS_NUM_MAX).fill(null);
  }

  /**
   * 根据pid查找进程
   * @param pid
   */
  static findByPid(pid: string): PCB | null {
    let length_ = ProcessController.PCBList.length;
    for (let i = 0; i < length_; i++) {
      if (
        ProcessController.PCBList[i] &&
        (ProcessController.PCBList[i] as PCB).pid == pid
      ) {
        return ProcessController.PCBList[i];
      }
    }
    return null;
  }
}
