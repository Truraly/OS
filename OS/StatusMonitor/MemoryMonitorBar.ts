import chalk from "chalk";
import {
  debuggerLogger,
  PCB,
  PStatus,
  ProcessController,
  util,
  OS,
  MemoryController,
  CPU,
} from "../OS";
import { StatusMonitor } from "./StatusMonitor";
export class MemoryMonitorBar extends StatusMonitor {
  /**
   * 内存条长度
   */
  memoryBarLength: number;
  /**
   * 单例对象
   */
  static instance: MemoryMonitorBar;
  /**
   * 初始化
   * @param BarLength 内存条长度
   */
  init(BarLength: number = 50): boolean {
    MemoryMonitorBar.instance = this;
    this.memoryBarLength = BarLength;
    return true;
  }
  /**
   * getHead
   */
  getHead(): string {
    return util.formatStr("内存条", this.memoryBarLength - 3) + "|";
  }
  /**
   * * 打印内存 进度条形式
   */
  getStatus(): string {
    let str = "";
    let p = MemoryController.MEMORY.MEMORY_SIZE / this.memoryBarLength;
    // 统计每一段内存被占用的数量
    let arr = new Array(this.memoryBarLength).fill(0);
    // console.log("arr.length", arr.length);
    MemoryController.memoryAlgorithm.forEach((block, index) => {
      // logger.warn(block.status);
      if (block.status == 0) return;
      let start = block.start;
      let end = block.start + block.size - 1;
      for (let i = start; i <= end; i++) {
        if (Math.floor(i / p) > 50) {
          console.log("block", block);
          console.log("P", p);
          console.log("i", i);
          console.log(
            "MemoryController.MEMORY.MEMORY_SIZE",
            MemoryController.MEMORY.MEMORY_SIZE
          );
          console.log("this.memoryBarLength", this.memoryBarLength);
          process.exit(0);
        }
        arr[Math.floor(i / p)]++;
      }
    });
    // console.log("arr.length", arr.length);
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
    // console.log(str.split("").filter((v) => v == " ").length);
    return str + "|";
  }
}
