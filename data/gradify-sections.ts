export const gradifySections = [
  { slug: "calculator", title: "GPA calculator", detail: "Calculate semester and cumulative GPA, then plan the grades you need next.", label: "Courses & grades" },
  { slug: "planner", title: "Graduation planning", detail: "Import a Delta Engineering transcript, check prerequisites, and plan your remaining semesters.", label: "Transcript & degree plan" },
  { slug: "guide", title: "Grading guide", detail: "Choose your university to explore its grading scale and understand how points are calculated.", label: "University grading rules" }
] as const;
export type GradifySection = typeof gradifySections[number]["slug"];
