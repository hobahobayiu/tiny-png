const tinify = require("tinify");
const fs = require("fs");
const path = require("path")
const crypto = require("crypto");

tinify.key = "jKP1WPhxyxNxXyxcVZ1Fw62JcjjWfB7q";//"jicplUDyuUtAYPrUSI2S9EwperDuvN7h";
const ignorePath = ["node_modules", "tiny-png"];
const configPath = "config.json";
let configOld = {};
let configNew = {};
let num = 0;
let globalOldSize = 0;
let globalNewSize = 0;
tinify.validate(function (err) {
    if (err) {
        console.error(err);
        return;
    }
    if (!fs.existsSync(configPath)) {
        configOld = {};
        fs.mk
    } else {
        configOld = JSON.parse(fs.readFileSync(configPath))
    }
    const textures = walkTexture("../assets/");
    const length = textures.length;
    let index = 0;
    console.log(length);
    textures.forEach((texture) => {
        const sizeOld = fs.statSync(texture).size;
        tinify.fromFile(texture).toFile(texture).then(() => {
            globalOldSize += sizeOld;
            const sizeNew = fs.statSync(texture).size;
            globalNewSize += sizeNew;
            const data = fs.readFileSync(texture);
            const md5 = crypto.createHash("md5").update(data, "utf-8").digest("hex");
            configNew[md5] = ++num;
            fs.writeFileSync(configPath, JSON.stringify(configNew, undefined, 4));
            console.log(`${++index}/${length} ${texture} ${formatBytes(sizeOld)} -> ${formatBytes(sizeNew)} ${((sizeOld - sizeNew) / sizeOld).toFixed(2)}`)
            console.log(`${globalOldSize} -> ${globalNewSize}  ${((globalOldSize - globalNewSize) / globalOldSize).toFixed(2)}`)
        });
    })
})
function walkTexture(dir) {
    const list = []
    const files = fs.readdirSync(dir);
    files.forEach((name) => {
        const filePath = path.join(dir, name);
        if ([".png", ".jgp"].indexOf(path.extname(name)) != -1) {
            const data = fs.readFileSync(filePath);
            const md5 = crypto.createHash("md5").update(data, "utf-8").digest("hex");
            if (configOld[md5]) {
                configNew[md5] = ++num;
                return;
            }
            list.push(filePath);
        } else if (fs.statSync(filePath).isDirectory() && ignorePath.indexOf(name) == -1) {
            list.push(...walkTexture(filePath));
        }
    })
    return list;
}
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) {
        return "0 Bytes"
    }
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))).toFixed(decimals) + " " + sizes[i];
}