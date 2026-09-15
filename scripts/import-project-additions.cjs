const sharp = require('sharp');
const fs = require('node:fs');
const path = require('node:path');
const jobs = [
 ['c4e61921-f91f-49c8-8440-b1de1af4107e','aqua-sync/photos-1'],
 ['636486f4-3c58-44e0-be5f-fcc3f79a94da','agribot/ui-1'],
 ['23e91498-ca6b-4093-82e9-5b694984460a','agribot/ui-2'],
 ['383a1a93-3a6e-41e1-887e-fdf58823b087','agribot/ui-3'],
 ['ca7f8527-6a22-4db4-8dbc-b51d9f1a96aa','agribot/ui-4'],
 ['df870a9e-0c3e-4210-979f-4d7a81aaa0a3','smart-mosque/photos-5'],
 ['74b62589-1eb3-4cd2-a6a1-aa4a182bf632','toolguard/photos-1'],
 ['c9be1904-9a46-463c-9570-8001aecd325b','toolguard/photos-2'],
 ['3f3a0d11-1064-464c-9f93-be567323710c','toolguard/ui-1'],
 ['12395b03-595a-4882-a2b4-c0bbc0521e8c','fall-detection/photos-1'],
 ['5ec32ab5-0052-4524-8d90-1a4cd1d5028c','fall-detection/photos-2'],
 ['94d53d01-dc90-436b-86f6-78438c30dd17','fall-detection/ui-1'],
 ['0f4dab0a-d307-4bca-8777-3fd1a914da80','muscle-monitoring/photos-1'],
 ['0b79e37e-9616-4dba-90f5-50c6192e06da','muscle-monitoring/photos-2'],
 ['458037ee-55b6-4974-8eb1-d92bd67b4de4','muscle-monitoring/ui-1']
];
(async () => {
 for (const [id, name] of jobs) {
  const out = path.join(__dirname, '../public/media/portfolio/showcase', name + '.webp');
  fs.mkdirSync(path.dirname(out), {recursive:true});
  const result = await sharp(`C:/Users/Asl/AppData/Local/Temp/codex-clipboard-${id}.png`).resize({width:2048,withoutEnlargement:true}).webp({quality:92}).toFile(out);
  console.log(name, result.width, result.height);
 }
})().catch(error => {console.error(error); process.exitCode=1;});
