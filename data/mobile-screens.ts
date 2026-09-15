export interface MobileScreen {
  title: string;
  src: string;
  sourceWidth: number;
  sourceHeight: number;
  crop: { x: number; y: number; width: number; height: number };
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const source = (project: string, index: number) => `${basePath}/media/portfolio/showcase/${project}/ui-${index}.webp`;

// Display windows into the supplied collages; the original files stay intact.
const media = (index: number, titles: string[], xs: number[], y = 194, width = 260, height = 548): MobileScreen[] =>
  titles.map((title, i) => ({ title, src: source("mediamate", index), sourceWidth: 1600, sourceHeight: 900, crop: { x: xs[i], y, width, height } }));

const collage = (project: string, index: number, title: string, x: number, y: number, width: number, height: number): MobileScreen => ({
  title, src: source(project, index), sourceWidth: 2048, sourceHeight: 1152, crop: {x, y, width, height}
});
const agribotScreens = [
  collage("agribot", 1, "Landscape robot control", 116, 147, 798, 357),
  collage("agribot", 1, "Choose analysis options", 1188, 150, 380, 850),
  ...["Welcome", "Location permission", "Robot disconnected"].map((title, i) => collage("agribot", 2, title, [172,779,1408][i],126,370,844)),
  ...["Wi-Fi configuration", "Available networks"].map((title, i) => collage("agribot", 3, title, [236,1069][i],214,350,788)),
  ...["Crop and fertilizer recommendations", "Environmental readings", "Soil nutrients", "No stored data"].map((title, i) => collage("agribot", 4, title, [139,607,1073,1540][i],103,363,840))
];

export const mobileScreens: Record<string, MobileScreen[]> = {
  "agribot-architecture": agribotScreens,
  "agribot-mobile-ui": agribotScreens,
  "toolguard": ["Tool availability", "Borrowing records", "Overdue notifications"].map((title, i) => collage("toolguard",1,title,[116,700,1310][i],67,453,1020)),
  "fall-detection-system": ["Device controls", "Alarm-locked devices"].map((title, i) => collage("fall-detection",1,title,[443,1116][i],100,428,950)),
  "muscle-activity-monitoring": ["Live muscle activity", "Sensor metrics"].map((title, i) => collage("muscle-monitoring",1,title,[257,1018][i],[123,119][i],400,895)),
  "mediamate": [
    ...media(1, ["Choose your role", "Patient sign in", "Daily medication schedule", "My medications"], [121, 490, 860, 1230]),
    ...media(2, ["Emergency medication", "Doctor access", "Doctor sign in", "Patient directory"], [93, 490, 860, 1240], 198, 260, 548),
    ...media(3, ["Patient medications", "Edit medicine", "Medication tracker", "Add medicine"], [126, 491, 860, 1240], 195, 256, 542)
  ],
  "plant-care-ai": ["Welcome", "Get started", "Sign in", "Create account"].map((title, i) => ({
    title, src: source("plant-care", 1), sourceWidth: 1035, sourceHeight: 583,
    crop: { x: [59, 283, 508, 732][i], y: 70, width: 191, height: 425 }
  })),
  "smart-mosque-model": ["Home & daily overview", "Quranic supplications", "Evening adhkar", "After-prayer adhkar"].map((title, i) => ({
    title, src: source("smart-mosque", i + 1), sourceWidth: 720, sourceHeight: 1600,
    crop: { x: 0, y: 0, width: 720, height: 1600 }
  }))
};
