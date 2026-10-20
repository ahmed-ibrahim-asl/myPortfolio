import {createServer} from "node:http";
import {createReadStream} from "node:fs";
import {stat} from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.argv[2] || "out");
const port = Number(process.argv[3] || 3112);
const types = {".html":"text/html; charset=utf-8",".txt":"text/plain; charset=utf-8",".css":"text/css",".js":"application/javascript",".mjs":"application/javascript",".json":"application/json",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".avif":"image/avif",".woff2":"font/woff2",".pdf":"application/pdf",".mp4":"video/mp4",".wasm":"application/wasm"};
createServer(async(req,res)=>{
  try {
    const url = new URL(req.url, "http://localhost");
    let file = path.resolve(root, "." + decodeURIComponent(url.pathname));
    if(file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    let info = await stat(file);
    if(info.isDirectory()) { file = path.join(file,"index.html"); info = await stat(file); }
    res.setHeader("Content-Type",types[path.extname(file)] || "application/octet-stream");
    res.setHeader("Cache-Control","no-store");
    res.setHeader("Content-Length",info.size);
    if(req.method === "HEAD") { res.end(); return; }
    createReadStream(file).on("error",()=>res.destroy()).pipe(res);
  } catch {res.writeHead(404).end("Not found");}
}).listen(port,"127.0.0.1",()=>console.log(`Preview: http://localhost:${port}/`));
