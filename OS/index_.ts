// 为所有工程文件import 合适的 变量
import fs from "fs";
import path from "path";

const ban: string[] = ["index_", "index"];
let objs: string[] = [];
// 获取所有文件

function getTSfile(Path_: string) {
  const files = fs.readdirSync(path.resolve(__dirname, Path_));
  let arr: {
    filePath: string;
    export_: string[];
  }[] = [];
  files.forEach((file) => {
    const filePath = path.resolve(__dirname, Path_, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      arr = arr.concat(getTSfile(filePath));
    } else {
      if (file.endsWith(".ts") && !ban.includes(file.replace(".ts", ""))) {
        // 打开文件
        const data = fs.readFileSync(filePath, "utf-8");

        // 获取文件中的所有export
        const exports = data.match(/export.*/g) || [];
        let export_: string[] = [];
        exports.forEach((item) => {
          let obj = item
            .replace(/export /g, "  ")
            .replace(/;/g, " ")
            .replace(/\n/g, " ")
            .replace(/\r/g, " ")
            .replace(/ function /g, "  ")
            .replace(/ class /g, "  ")
            .replace(/ interface /g, "  ")
            .replace(/ enum /g, "  ")
            .replace(/ type /g, "  ")
            .replace(/ const /g, "  ")
            .replace(/ let /g, "  ")
            .replace(/{/g, "  ")
            .replace(/=.*/g, "  ")
            .replace(/\(.*/g, "  ")
            .replace(/extends.*/g, "  ")
            .replace(/ abstract /g, "  ")
            .trim();
          export_.push(obj);
        });

        objs = objs.concat(export_);
        arr.push({
          filePath,
          export_,
        });
      }
    }
  });
  return arr;
}

const files = getTSfile("./");
console.log(files);
// console.log(objs);

// 获取文件内导出的对象

// 获取文件内需要的对象，并插入开头
files.forEach((item, index) => {
  // 打开文件
  const data = fs.readFileSync(item.filePath, "utf-8").replace(/[\r\n]/g, " ");
  // 查询文件内需要的对象
  let import_ = "";
  files.forEach((item_, index_) => {
    if (index_ !== index) {
      item_.export_.forEach((item__) => {
        // 周围不能有字母
        let reg = new RegExp(`[^a-zA-Z]${item__.trim()}[^a-zA-Z]`);
        if (reg.test(data)) {
          import_ += `import ${item__.trim()} from '${item_.filePath.replace(
            path.resolve(__dirname, "./"),
            ""
          )}';\n`;
        }
      });
    }
  });
  // console.log(import_);
  fs.writeFileSync(item.filePath, import_ + data.replace(/export /g, " "));
});
