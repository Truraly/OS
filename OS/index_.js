// 获取当前目录以及子目录下的所有ts文件

const fs = require("fs");
const path = require("path");

function getTSfile(psth_) {
  let arr = [];
  const root = path.resolve(__dirname, psth_);
  const files = fs.readdirSync(root);
  files.forEach((file) => {
    if (path.extname(file) === ".ts") {
      if (psth_ != "./") arr.push(psth_ + "/" + file);
      else arr.push(file);
    }
    // 如果为文件夹
    if (fs.statSync(path.join(root, file)).isDirectory()) {
      arr = arr.concat(getTSfile(path.join(psth_, file)));
    }
  });
  return arr;
}

const tsFiles = getTSfile("./");
let str = "";
let export_ = [];
tsFiles.forEach((file) => {
  // 打开文件
  // import { xxxx} from "./xxxx"
  // import { xxxx} from "./xxxx"
  // export { xxxx }

  // 打开文件
  let data = fs.readFileSync(file, "utf-8");
  // 获取文件名
  const fileName = path.basename(file, ".ts");
  // 获取文件内容
  const fileContent = data.toString();

  // 获取文件中的所有export
  const exports = fileContent.match(/export.*/g);
  // 处理
  let obj = [];
  if (exports) {
    exports.forEach((item) => {
      obj.push(
        item
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
      );
    });
  }

  str += `import { ${obj.join(",")} } from "./${file}";`;
  export_.push(...obj);
});
str += `export {\n${export_.join(",\n")}\n}`;
fs.writeFileSync("./index.ts", str);
