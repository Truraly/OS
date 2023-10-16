import { logger, PCB, Semasphore, Message_buffer, Primitives } from "./OS";
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
    p.status = 0;
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
   * 将就绪的进程输出进入运行状态
   * @returns 进程
   */
  static run() {
    let p = this.shift();
    p.status = 1;
    return p;
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
  static readyList: Array<PCB> = new Array<PCB>();
}
