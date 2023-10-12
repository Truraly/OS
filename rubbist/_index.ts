// 读者写者问题
import chalk from "chalk";
/**
 * 模拟一秒的时间
 */
const s_1: number = 300;
/**
 * 获取状态对应的颜色
 * @param n
 * @returns
 */
function getColor(n: number) {
  return [
    chalk.blue.bgGray.bold(" "),
    chalk.blue.bgYellow.bold(" "),
    chalk.blue.bgGreen.bold(" "),
    chalk.blue.bgGray.bold(" "),
  ][n];
}

/**
 * 读者写者进入时间
 * [id, type, time, sleeptime, status]
 * status 0:未执行，1:启动，2:执行中，3:执行完毕
 */
let test = [
  [1, "w", 3, 5, 0],
  [2, "w", 16, 5, 0],
  [3, "r", 5, 2, 0],
  [4, "w", 6, 5, 0],
  [5, "r", 4, 3, 0],
  [6, "r", 11, 4, 0],
];
console.log(test);
/**
 * 信号量类
 */
class semasphore {
  /**
   * 信号量值
   */
  value: number;
  /**
   * 等待队列
   */
  queue: Array<Function>;
  constructor(value: number) {
    this.value = value;
    this.queue = new Array<Function>();
  }
  /**
   * P操作
   * @returns 返回一个Promise函数，当信号量大于0时，执行resolve
   */
  async P(): Promise<void> {
    return new Promise((resolve) => {
      this.value--;
      if (this.value < 0) {
        this.queue.push(resolve);
      } else {
        resolve();
      }
    });
  }
  /**
   * 优先P操作
   * @returns 返回一个Promise函数，当信号量大于0时，执行resolve
   */
  async PY(): Promise<void> {
    return new Promise((resolve) => {
      this.value--;
      if (this.value < 0) {
        this.queue.unshift(resolve);
      } else {
        resolve();
      }
    });
  }
  /**
   * V操作
   * @returns 返回一个Promise函数，当信号量小于等于0时，执行resolve
   */
  V(): void {
    this.value++;
    if (this.value <= 0) {
      (this.queue.shift() as Function)();
    }
  }
}

/**
 * 获得一个需要执行 time 秒的Proimse函数
 * @param time 读写时间
 * @returns
 */
async function sleep(time: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, time * s_1);
  });
}

/**
 * 写信号量
 */
let Wmutex = new semasphore(1);
/**
 * 读写“读者数量”信号量
 */
let Rmutex = new semasphore(1);
/**
 * 读者数量
 */
let readcount = 0;

/**
 * 写者进程
 * @param data
 */
async function writer(data: any[]): Promise<void> {
  let [id, type, time, sleeptime] = data;
  data[4] = 1;
  //   await Wmutex.PY();
  await Wmutex.P();
  data[4] = 2;
  //   let d = new Date();
  await sleep(sleeptime);
  //   console.log("实际运行:", (new Date().valueOf() - d.valueOf()) * (1000 / s_1));
  data[4] = 3;
  Wmutex.V();
}

/**
 * 读者
 * @param data
 */
async function reader(data: any[]): Promise<void> {
  while (true) {
    let [id, type, time, sleeptime] = data;
    data[4] = 1;
    await Rmutex.P();
    if (readcount == 0) {
      await Wmutex.P();
    }
    readcount++;
    Rmutex.V();
    data[4] = 2;
    await sleep(sleeptime);
    data[4] = 3;
    await Rmutex.P();
    readcount--;
    Rmutex.V();
    if (readcount == 0) {
      Wmutex.V();
    }
    return;
  }
}

/**
 * 输出表头
 * @returns
 */
function printbt() {
  let str = `|  时间  |`;
  for (let i = 0; i < test.length; i++) {
    if (test[i][1] == "r") {
      str +=
        chalk.blue.bgBlue.bold(
          "r" + o_t_t(test[i][0] as number) + o_t_t(test[i][3] as number)
        ) + "|";
    } else {
      str +=
        chalk.blue.bgMagenta.bold(
          "w" + o_t_t(test[i][0] as number) + o_t_t(test[i][3] as number)
        ) + "|";
    }
  }
  console.log(str);
  return;
}

function o_t_t(num: number, type: string = " ") {
  return num < 10 ? type + num : num;
}

/**
 * 输出内容
 */
async function printStatus() {
  //   let t_1: number | string = time - 1;
  let t_1: number | string = time;
  t_1 = t_1 < 10 && t_1 > -1 ? "0" + t_1 : t_1.toString();
  let str = `| 第${t_1}秒 |`;
  for (let i = 0; i < test.length; i++) {
    str += `  ${getColor(test[i][4] as number)}  |`;
  }
  console.log(
    str,
    "wmutex:",
    Wmutex.value,
    "rmutex:",
    Rmutex.value,
    "readcount:",
    readcount
  );
}

/////////////////////////////////////////////////////////
// 执行
console.log(`开始执行，共${test.length}个进程`);
printbt();
let time = 0;
// 输出表格
let ddd = new Date();
let Interval = setInterval(() => {
  let dn = new Date();
  console.log("循环器计时：", ((dn.valueOf() - ddd.valueOf()) * 1000) / s_1);
  ddd = dn;

  time++;
  // 判断是否执行完毕
  if (test.every((item) => item[4] == 3)) {
    clearInterval(Interval);
  } else {
    for (let i = 0; i < test.length; i++) {
      if (test[i][2] == time) {
        if (test[i][1] == "r") {
          reader(test[i]);
        } else {
          writer(test[i]);
        }
      }
    }
  }
}, s_1);

let da = time;
let Interval_2 = setInterval(() => {
  if (da != time) {
    da = time;
  }
  printStatus();
  if (test.every((item) => item[4] == 3)) {
    clearInterval(Interval_2);
  }
}, s_1 / 4);
