const sharp = require("sharp");
const fs = require("node:fs");
const path = require("node:path");
const jobs = [
  {
    "src": "C:/Users/Asl/.codex/generated_images/01a047cd-2ecb-72d2-9950-dec9ca7238c3/exec-9f15931f-8334-4569-a39a-db066af27a4d.png",
    "out": "agribot/cover.webp"
  },
  {
    "src": "C:/Users/Asl/AppData/Local/Temp/codex-clipboard-55893074-3fae-4335-97f2-cd02cd2f969c.png",
    "out": "agribot/photos-1.webp"
  },
  {
    "src": "C:/Users/Asl/.codex/generated_images/01a047cd-2ecb-72d2-9950-dec9ca7238c3/exec-f855e09e-a2ca-4c49-bee4-4dfc0b861065.png",
    "out": "plant-care/cover.webp"
  },
  {
    "src": "C:/Users/Asl/AppData/Local/Temp/codex-clipboard-723b6fef-af6d-47b3-accf-d2026949da4b.png",
    "out": "plant-care/photos-1.webp"
  },
  {
    "src": "C:/Users/Asl/AppData/Local/Temp/codex-clipboard-08aff640-d5e4-4225-b05e-144fde8acbba.png",
    "out": "plant-care/photos-2.webp"
  },
  {
    "src": "C:/Users/Asl/AppData/Local/Temp/codex-clipboard-73be5b94-0a46-4aee-bb5c-d913de042b7c.png",
    "out": "plant-care/photos-3.webp"
  },
  {
    "src": "C:/Users/Asl/AppData/Local/Temp/codex-clipboard-f2d4b26f-3505-4498-8f80-348254cc8ae2.png",
    "out": "plant-care/photos-4.webp"
  },
  {
    "src": "C:/Users/Asl/AppData/Local/Temp/codex-clipboard-be07b664-3ea5-44d6-8224-fb4303e8dbc1.png",
    "out": "plant-care/photos-5.webp"
  },
  {
    "src": "C:/Users/Asl/AppData/Local/Temp/codex-clipboard-d3e0d8df-09b5-4e54-ab9a-ffebe548e76e.png",
    "out": "plant-care/ui-1.webp"
  },
  {
    "src": "C:/Users/Asl/AppData/Local/Temp/codex-clipboard-6547b1d7-8425-4012-859f-a827b9624472.png",
    "out": "plant-care/ui-2.webp"
  },
  {
    "src": "C:/Users/Asl/.codex/generated_images/01a047cd-2ecb-72d2-9950-dec9ca7238c3/exec-2798c846-0890-4298-912f-1a236b7aff96.png",
    "out": "mediamate/cover.webp"
  },
  {
    "src": "C:/Users/Asl/AppData/Local/Temp/codex-clipboard-0175ae9a-2732-49d5-bed8-991981fae636.png",
    "out": "mediamate/photos-1.webp"
  },
  {
    "src": "C:/Users/Asl/AppData/Local/Temp/codex-clipboard-edc1cd13-e9c0-40d7-914a-074448848d86.png",
    "out": "mediamate/ui-1.webp"
  },
  {
    "src": "C:/Users/Asl/AppData/Local/Temp/codex-clipboard-a2762f36-9965-411a-a387-e6059c37f994.png",
    "out": "mediamate/ui-2.webp"
  },
  {
    "src": "C:/Users/Asl/AppData/Local/Temp/codex-clipboard-a116ec23-b07c-4042-83a4-a9d55933b2ef.png",
    "out": "mediamate/ui-3.webp"
  },
  {
    "src": "C:/Users/Asl/.codex/generated_images/01a047cd-2ecb-72d2-9950-dec9ca7238c3/exec-91875719-4e5a-4c48-b05d-cbbcf999fc17.png",
    "out": "smart-mosque/cover.webp"
  },
  {
    "src": "C:/Users/Asl/AppData/Local/Temp/codex-clipboard-1ce9a162-8351-40da-889c-30a292674c51.png",
    "out": "smart-mosque/photos-1.webp"
  },
  {
    "src": "C:/Users/Asl/AppData/Local/Temp/codex-clipboard-77182b18-b17e-4afb-8a6f-fcb860fe19e5.png",
    "out": "smart-mosque/photos-2.webp"
  },
  {
    "src": "C:/Users/Asl/AppData/Local/Temp/codex-clipboard-0a41b638-12bd-4515-8509-635b0f9b5a73.png",
    "out": "smart-mosque/photos-3.webp"
  },
  {
    "src": "C:/Users/Asl/AppData/Local/Temp/codex-clipboard-051c5ffb-84be-404b-b1f2-b22fee1d8b6d.png",
    "out": "smart-mosque/photos-4.webp"
  },
  {
    "src": "C:/Users/Asl/AppData/Local/Temp/codex-clipboard-57a8cb9a-2577-4d81-8d9b-32840a5c8c46.png",
    "out": "smart-mosque/ui-1.webp"
  },
  {
    "src": "C:/Users/Asl/AppData/Local/Temp/codex-clipboard-f9378dc3-61fe-4961-8429-4c1e71d3a997.png",
    "out": "smart-mosque/ui-2.webp"
  },
  {
    "src": "C:/Users/Asl/AppData/Local/Temp/codex-clipboard-3fc00816-b86a-4265-afda-898c9b0c1af4.png",
    "out": "smart-mosque/ui-3.webp"
  },
  {
    "src": "C:/Users/Asl/AppData/Local/Temp/codex-clipboard-ba106514-0aef-4e35-95fc-afada7dfd27b.png",
    "out": "smart-mosque/ui-4.webp"
  },
  {
    "src": "C:/Users/Asl/.codex/generated_images/01a047cd-2ecb-72d2-9950-dec9ca7238c3/exec-5efd3052-7ac3-4e65-87e6-ad800300552c.png",
    "out": "autonomous-car/cover.webp"
  },
  {
    "src": "C:/Users/Asl/AppData/Local/Temp/codex-clipboard-16f6901b-ab49-423a-ad66-6da1343d8b6a.png",
    "out": "autonomous-car/photos-1.webp"
  }
];
(async () => {for(const job of jobs){ const out=path.join("public/media/portfolio/showcase",job.out);fs.mkdirSync(path.dirname(out),{recursive:true});await sharp(job.src).webp({quality:92}).toFile(out);console.log(out);} })().catch(e=>{console.error(e);process.exit(1)});

