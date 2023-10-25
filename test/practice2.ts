import {
  logger,
  PCB,
  ReadyList,
  Semasphore,
  Message_buffer,
  Primitives,
} from "../OS";
import chalk from "chalk";

// time priority
// 2 1
// 3 10
// 1 6
// 2 9
// 4 4

/**
 * 进程函数
 */
const pro: Array<(p: PCB) => number> = [
  (p) => {
    p.needTime--;
    p.priority = Math.ceil(p.priority / 2);
    if (p.needTime > 0) return 2;
    return 1;
  },
];

ReadyList.push(new PCB("p1   ", 2, pro, 1));
ReadyList.push(new PCB("p2   ", 3, pro, 10));
ReadyList.push(new PCB("p3   ", 1, pro, 6));
ReadyList.push(new PCB("p4   ", 2, pro, 9));
ReadyList.push(new PCB("p5   ", 4, pro, 4));

async function main(CPUtime: number): Promise<boolean> {
  // let ew: string = "";
  //   if (!PCB.getLogsEmpty()) return true;
  // 载入就绪的进程
  // test.forEach((item) => {
  //   // console.log(item);
  //   if (!((item[2] as number) <= CPUtime)) return;
  //   let type = item[1] as string;
  //   //
  //   let pname = type + CPUtime;
  //   let sleeptime = item[3] as number;
  //   // 删除超长的部分
  //   pname = pname.slice(0, 4);
  //   // 填充空格
  //   while (pname.length < 5) pname += " ";
  //   // 颜色
  //   if (type == "w") {
  //     pname = chalk.white.bgBlue.bold(pname);
  //   } else {
  //     pname = chalk.white.bgMagenta.bold(pname);
  //   }
  //   let pp: PCB = new PCB(pname, sleeptime, type == "w" ? writer : reader);

  //   ReadyList.push(pp);
  //   test.splice(test.indexOf(item), 1);
  // });
  // 结束
  if (ReadyList.len() == 0) return false;
  return true;
}
import { start, addruntimefun, setSema } from "../index";

addruntimefun(main as any);
start();

/**
 * sleep
 */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
