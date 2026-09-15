export const engineeringTools = [
  {
    id: "gradify",
    title: "Gradify: GPA & Graduation Planner",
    description:
      "Calculate university GPA, plan a target, and explore grading scales. Includes Delta engineering transcript import, prerequisite checks, semester planning, and PDF reports.",
    href: "/tools/gradify",
    icon: "GRADIFY",
    category: "Academic planning",
    highlight: "Delta tested",
    coverImage: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/media/tools/tool-gradify.svg`
  },
  {
    id: "ai-script-generator",
    title: "AI Script Generator",
    description:
      "A guided, step-by-step builder that generates a complete, runnable Python training project - not a snippet - for YOLO detection, sensor time-series, and edge image classification.",
    href: "/tools/ai-script-generator",
    icon: "AI_GEN",
    highlight: "Most substantial",
    coverImage: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/media/tools/tool-ai-script-generator-v4.png`
  },
  {
    id: "security-command-builder",
    title: "Security Mission",
    description:
      "Build, validate, and learn security-tool commands for authorized labs - 22/22 eCPPT objectives covered, with safe shell quoting and secret redaction built in.",
    href: "/tools/security-command-builder",
    icon: "SECURITY_CLI",
    highlight: "Most substantial",
    coverImage: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/media/tools/tool-security-mission-v4.png`
  },
  {
    id: "pid-simulator",
    title: "Interactive PID Simulator",
    description:
      "Tune proportional, integral, and derivative gains with a live physics loop to visualize system response.",
    href: "/tools/pid-simulator",
    icon: "CONTROL_SYS",
    coverImage: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/media/tools/tool-pid-simulator-v4.png`
  },
  {
    id: "sensor-code-generator",
    title: "Sensor Code Generator",
    description:
      "Generate Arduino, ESP-IDF, and PlatformIO boilerplate for common sensors to jumpstart hardware bring-up.",
    href: "/tools/sensor-code-generator",
    icon: "CODE_GEN",
    coverImage: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/media/tools/tool-sensor-code-generator-v4.png`
  },
  {
    id: "battery-estimator",
    title: "ESP32 Battery Life & Power Estimator",
    description:
      "Calculate ESP32 battery life from sleep and active duty cycles. Estimates total runtime and average current draw.",
    href: "/tools/battery-estimator",
    icon: "BATTERY_SYS",
    coverImage: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/media/tools/tool-battery-estimator-v2.png`
  }
];
