export const workCategories = [
  { id: "web-development", title: "Web Development", intro: "Company websites built around the people using them.", style: "web", categories: ["Web Development", "Website Design"] },
  { id: "embedded-iot", title: "Embedded Systems & IoT", intro: "Firmware, electronics, and connected systems, from interface to device.", style: "embedded", categories: ["Engineering & IoT"] },
  { id: "robotics", title: "Robotics", intro: "Physical builds that sense, move, and respond.", style: "robotics", categories: ["Robotics", "Robotics / AMIT Graduation Project"] },
  { id: "apps-ui", title: "Apps & UI Design", intro: "Control surfaces and applications that make complex systems usable.", style: "apps", categories: ["AI & Mobile", "UI/UX & Design"] },
  { id: "video-media", title: "Video & Media", intro: "Editing, motion, and visual storytelling for technical communities.", style: "media", categories: ["Video"] }
];

export function groupWork(projects) {
  return workCategories.map(group => ({ ...group, projects: projects.filter(project => group.categories.includes(project.category)) }));
}
