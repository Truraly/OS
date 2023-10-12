import { PCB } from "./PCB";
/**
 * 就绪列表类
 */
export class ReadyList {
  /**
   * 就绪列表
   */
  _list: Array<PCB> = new Array<PCB>();
  /**
   * 排序
   */
  sort() {
    this._list.sort((a, b) => {
      return b.priority - a.priority;
    });
  }
  /**
   * 添加进程
   */
  push(p: PCB) {
    this._list.push(p);
    p.status = 0;
  }
  /**
   * 保持进程状态，进入就绪队列
   */
  rePush(p: PCB) {
    this._list.push(p);
  }
  /**
   * 取出进程
   */
  shift(): PCB {
    let p = this._list.shift();
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
  findByPid(pid: string): PCB | undefined {
    return this._list[this._list.findIndex((item) => item.pid == pid)];
  }
  /**
   * 进程数量
   */
  get length(): number {
    return this._list.length;
  }
  /**
   * 将就绪的进程输出进入运行状态
   */
  run() {
    let p = this.shift();
    p.status = 1;
    return p;
  }
  /**
   * 打印就绪队列
   */
  toString(): string {
    return this._list.map((item) => item.pname).join(",");
  }
}
