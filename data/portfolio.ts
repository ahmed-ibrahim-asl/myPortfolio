import publicationFeed from "./publications.json";
import {
  Course,
  Education,
  Experience,
  ExpertiseItem,
  Profile,
  Project,
  Publication,
  PublicationSource,
  TechnologyGroup,
  Tutorial,
  WorkingMethodItem
} from "@/types/portfolio";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const asset = (pathname: string): string => `${basePath}${pathname}`;

export const profile: Profile = {
  name: "Ahmed Ibrahim Asl",
  role: "Embedded Systems & IoT R&D Engineer",
  label: "LIFELONG LEARNER / PROBLEM SOLVER",
  headline:
    "I turn rough hardware and IoT ideas into working prototypes and usable products.",
  summary:
    "I work from problem to proof, using electronics, connectivity, software, robotics, and interface design wherever the system needs them.",
  location: "Egypt, based between Al Mahala Al Kobra and Alexandria; available for remote collaboration.",
  availability: "Open to selected embedded systems, IoT, and robotics collaborations",
  portrait: asset("/media/optimized/profile-ahmed.webp"),
  portraits: [
    { src: asset("/images/profilePicture/profile1.jpg"), alt: "Portrait of Ahmed Ibrahim Asl in a dark jacket" },
    { src: asset("/images/profilePicture/profile2.jpg"), alt: "Portrait of Ahmed Ibrahim Asl outdoors" },
    { src: asset("/images/profilePicture/profile3.png"), alt: "Professional portrait of Ahmed Ibrahim Asl" }
  ],
  cv: "https://drive.google.com/file/d/1G9lNDitCXg250JGz8vRperY6zMPoT9gs/view?usp=sharing",
  scholar: "https://scholar.google.com/citations?user=o72gFwkAAAAJ&hl=en",
  scholarId: "o72gFwkAAAAJ",
  email: "aassal950@gmail.com",
  phone: "+20 106 816 3322",
  whatsapp: "https://wa.me/201068163322",
  socials: [
    { label: "GitHub", href: "https://github.com/ahmed-ibrahim-asl" },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/ahmed-ibrahim-asl/"
    },
    {
      label: "Google Scholar",
      href: "https://scholar.google.com/citations?user=o72gFwkAAAAJ&hl=en"
    },
    { label: "TryHackMe", href: "https://tryhackme.com/p/MRH0N3Y" },
    { label: "Behance", href: "https://www.behance.net/ahmedassal3" },
    { label: "YouTube", href: "https://www.youtube.com/@ahmed-ibrahim-asl" }
  ]
};

export const education: Education[] = [
  {
    credential: "Master’s studies in Mechatronics — in progress; first qualifying semester completed",
    institution: "Mansoura University",
    period: "February 2026 – June 2028 (expected)"
  },
  {
    credential: "Bachelor of Applied Science in Communication and Telecom Engineering — GPA 3.661",
    institution: "",
    period: "October 2020 – June 2025"
  }
];

export const expertise: ExpertiseItem[] = [
  {
    index: "01",
    title: "IoT System Architecture",
    description:
      "Sensor networks and device-to-cloud data paths using ESP32, Python, and PlatformIO."
  },
  {
    index: "02",
    title: "Electronics & Hardware Design",
    description:
      "Schematics, PCB layout, component selection, hardware bring-up, and board-level debugging in KiCad."
  },
  {
    index: "03",
    title: "Embedded Firmware",
    description:
      "C and C++ firmware for Arduino, ESP32, ESP8266, and AVR-based devices."
  },
  {
    index: "04",
    title: "Image Processing, ML & AI",
    description:
      "Computer vision pipelines, leaf-disease detection, and sensor-fusion systems using Python and Jetson hardware."
  },
  {
    index: "05",
    title: "Security & Information Security",
    description:
      "Network and physical attack-surface analysis for hardware and software interfaces, and legal cybersecurity challenge labs."
  },
  {
    index: "06",
    title: "Cross-Platform Development",
    description:
      "Flutter applications that turn device state into clear controls and feedback."
  },
  {
    index: "07",
    title: "UI/UX & Graphic Design",
    description:
      "Interface and visual systems for engineering tools, mobile products, and technical content."
  },
  {
    index: "08",
    title: "Video Editing",
    description:
      "Technical lessons and event stories edited in Premiere Pro and DaVinci Resolve."
  }
];

export const technologies: string[] = [
  "IoT",
  "Flutter",
  "ESP32 & ESP8266",
  "C / C++",
  "KiCad",
  "Python",
  "HTML & CSS",
  "Arduino",
  "Square Line Studio",
  "PlatformIO",
  "Linux",
  "Networking"
];

export const toolkitHeading: string = "Tools collected along the way";
export const toolkitIntro: string =
  "I did not learn these tools to complete a checklist. Each one entered my toolkit because a project, failure, or unanswered question required it.";

export const technologyGroups: TechnologyGroup[] = [
  {
    index: "01",
    title: "Embedded & Hardware",
    description:
      "Firmware, board-level development, hardware bring-up, and PCB workflows.",
    tools: ["ESP32 & ESP8266", "C / C++", "Arduino", "PlatformIO", "KiCad"]
  },
  {
    index: "02",
    title: "Connected Systems",
    description:
      "Device connectivity, networked infrastructure, automation, and technical computing.",
    tools: ["IoT", "Networking", "Linux", "Python"]
  },
  {
    index: "03",
    title: "Interfaces & Applications",
    description:
      "Cross-platform control surfaces and interfaces for connected engineering systems.",
    tools: ["Flutter", "HTML & CSS", "Square Line Studio"]
  },
  {
    index: "04",
    title: "Vision, ML & Security",
    description:
      "Image processing, machine learning experiments, and hardware and software security analysis.",
    tools: ["Python", "OpenCV", "Jetson Nano", "TryHackMe", "Kali Linux"]
  }
];

export const workingMethod: WorkingMethodItem[] = [
  {
    step: "01",
    label: "Question",
    description:
      "I start by asking what the system needs to do, what already exists, and where the constraint actually lives."
  },
  {
    step: "02",
    label: "Learn",
    description:
      "I find the gap between what I know and what the problem needs, then close it through documentation, experimentation, or teaching myself the missing piece."
  },
  {
    step: "03",
    label: "Build",
    description:
      "I build the smallest version that proves the idea works, keep notes on what breaks, and iterate until the system behaves consistently."
  },
  {
    step: "04",
    label: "Test",
    description:
      "I verify the result against the original goal, document failure modes, and check whether someone else can understand and use what I made."
  }
];

export const coursesTaught: Course[] = [
  {
    title: "Satellite Communication",
    institution: "Delta University",
    description: "Undergraduate lectures and laboratory instruction."
  },
  {
    title: "Acoustics",
    institution: "Delta University",
    description: "Undergraduate lectures and laboratory instruction."
  },
  {
    title: "Digital and Logic Circuits",
    institution: "Delta University",
    description: "Undergraduate lectures and laboratory instruction."
  },
  {
    title: "Measurement and Sensors",
    institution: "Delta University",
    description: "Undergraduate lectures and laboratory instruction."
  },
  {
    title: "Analog Communication",
    institution: "Delta University",
    description: "Practical MATLAB laboratory work for analog communication concepts and signal analysis."
  },
  {
    title: "MATLAB Onramp",
    institution: "Recorded online course",
    description: "A guided introduction to MATLAB fundamentals for engineering calculations and visualization.",
    href: "https://www.youtube.com/playlist?list=PLYt83m8l2mixe_1k4BWNVCg0HXdYx6BPw",
    actionLabel: "Watch the course"
  }
];

export const projects: Project[] = [
  {
    slug: "aqua-sync", title: "Aqua Sync 2.0.0", category: "Engineering & IoT", year: "",
    role: "Embedded Systems Engineer | ESP32 Firmware Developer | CrowPanel HMI & OTA Integration",
    description: "Upgraded an existing ESP32-based Aqua Sync system by programming a 7-inch CrowPanel HMI to interface with 10 one-wire temperature sensors and a DHT sensor, connecting two embedded boards, and implementing OTA updates. Designed the interface in Figma before building the final UI in SquareLine Studio.",
    outcome: "Sensor monitoring, board-to-board integration, and OTA firmware updates",
    tags: ["ESP32", "CrowPanel HMI", "One-wire sensors", "DHT", "OTA", "Figma", "SquareLine Studio"],
    image: asset("/media/portfolio/showcase/aqua-sync/cover-asl-v1.webp"),
    imageNote: "AI-styled cover based on the prototype. Original hardware and screen photos below; not a wiring reference.",
    gallery: [{src: asset("/media/portfolio/showcase/aqua-sync/photos-1.webp"), alt: "Aqua Sync sensor boards connected to the 7-inch CrowPanel HMI"}],
    links: [{label: "View interface design in Figma", href: "https://www.figma.com/design/uSNevyW1fgwfgnIF2y8q0T/AquaSynq_Project?node-id=0-1&p=f"}],
    featured: false
  },
  {
    slug: "toolguard", title: "ToolGuard", category: "Engineering & IoT", year: "",
    role: "Hardware Programming | Mobile UI/UX Design | Flutter Development | Firebase Integration",
    description: "Designed and developed a prototype system to manage borrowing and returning shared tools. I handled hardware programming, mobile UI/UX design, full Flutter application development, and Firebase integration for real-time data storage and tracking. The system monitors tool availability, tracks borrowed items and overdue returns, and provides notifications through a clean mobile interface.",
    outcome: "Shared-tool availability, borrowing records, and overdue notifications",
    tags: ["Hardware prototype", "Flutter", "Firebase", "UI/UX"],
    image: asset("/media/portfolio/showcase/toolguard/cover-asl-v1.webp"),
    imageNote: "AI-styled cover based on the prototype. Original build photos below.",
    gallery: [
      {src: asset("/media/portfolio/showcase/toolguard/photos-1.webp"), alt: "ToolGuard tool rack with front LCD"},
      {src: asset("/media/portfolio/showcase/toolguard/photos-2.webp"), alt: "ToolGuard prototype with side-mounted card reader"}
    ],
    uiGallery: [{src: asset("/media/portfolio/showcase/toolguard/ui-1.webp"), alt: "ToolGuard availability dashboard, borrowing records, and notifications"}],
    featured: false
  },
  {
    slug: "fall-detection-system", title: "Fall Detection System", category: "Engineering & IoT", year: "",
    description: "A fall-detection prototype documented through a Raspberry Pi and relay setup, a computer-vision development demo, and a companion smart-home control interface with normal and alarm-locked device states.",
    outcome: "Prototype hardware, vision development, and device-control interface",
    tags: ["Raspberry Pi", "Computer vision", "Relay control", "Mobile UI"],
    image: asset("/media/portfolio/showcase/fall-detection/cover-asl-v1.webp"),
    imageNote: "AI-styled view of the prototype hardware. Original photos below; not a wiring reference or evidence of clinical performance.",
    gallery: [
      {src: asset("/media/portfolio/showcase/fall-detection/photos-1.webp"), alt: "Raspberry Pi connected to a four-channel relay module"},
      {src: asset("/media/portfolio/showcase/fall-detection/photos-2.webp"), alt: "Computer-vision development demo with object detection boxes"}
    ],
    uiGallery: [{src: asset("/media/portfolio/showcase/fall-detection/ui-1.webp"), alt: "Smart-home controls in normal and alarm-locked states"}],
    featured: false
  },
  {
    slug: "muscle-activity-monitoring", title: "Real-Time Muscle Activity Monitoring", category: "Engineering & IoT", year: "",
    description: "Developed a wearable muscle activity monitoring system using the MyoWare 2.0 EMG sensor and a custom Flutter mobile application for real-time visualization and analysis. Surface electrodes capture muscle signals, which stream to the app as live graphs and metrics including peak values, mean amplitude, and signal variability. Firebase provides real-time data synchronization and cloud storage.",
    outcome: "Wearable EMG sensing with live mobile graphs and signal metrics",
    tags: ["MyoWare 2.0", "EMG", "Flutter", "Firebase", "Wearable"],
    image: asset("/media/portfolio/showcase/muscle-monitoring/cover-asl-v1.webp"),
    imageNote: "AI-styled cover based on the wearable prototype. Original build photos below; not a medical certification or performance claim.",
    gallery: [
      {src: asset("/media/portfolio/showcase/muscle-monitoring/photos-1.webp"), alt: "Wearable muscle monitoring prototype with strap and enclosure"},
      {src: asset("/media/portfolio/showcase/muscle-monitoring/photos-2.webp"), alt: "Wearable EMG prototype showing surface electrodes"}
    ],
    uiGallery: [{src: asset("/media/portfolio/showcase/muscle-monitoring/ui-1.webp"), alt: "MyoMeter live signal graph and sensor metrics"}],
    featured: false
  },
  {
    slug: "mediamate",
    title: "MediaMate",
    category: "Engineering & IoT",
    year: "",
    description: "A medication dispenser prototype with a companion mobile interface for patient and doctor access, medication schedules, and adherence tracking.",
    outcome: "Connected dispenser and medication-management interface",
    tags: ["Hardware prototype", "Mobile UI", "Medication scheduling"],
    image: asset("/media/portfolio/showcase/mediamate/cover.webp"),
    imageNote: "AI-styled cover. Original build photos below.",
    gallery: [
      { src: asset("/media/portfolio/showcase/mediamate/photos-1.webp"), alt: "MediaMate original hardware photo 1" }
    ],
    uiGallery: [
      { src: asset("/media/portfolio/showcase/mediamate/ui-1.webp"), alt: "MediaMate original mobile interface 1" },
      { src: asset("/media/portfolio/showcase/mediamate/ui-2.webp"), alt: "MediaMate original mobile interface 2" },
      { src: asset("/media/portfolio/showcase/mediamate/ui-3.webp"), alt: "MediaMate original mobile interface 3" }
    ],
    featured: false
  },
  {
    slug: "smart-mosque-model",
    title: "Smart Mosque Model",
    category: "Engineering & IoT",
    year: "",
    description: "Applied IoT model for automatically managing mosque energy and ventilation.",
    outcome: "Physical IoT model with an Arabic companion app",
    tags: ["IoT", "Energy management", "Ventilation"],
    image: asset("/media/portfolio/showcase/smart-mosque/cover.webp"),
    imageNote: "AI-styled cover. Original build photos below.",
    gallery: [
      { src: asset("/media/portfolio/showcase/smart-mosque/photos-1.webp"), alt: "Smart Mosque Model original hardware photo 1" },
      { src: asset("/media/portfolio/showcase/smart-mosque/photos-2.webp"), alt: "Smart Mosque Model original hardware photo 2" },
      { src: asset("/media/portfolio/showcase/smart-mosque/photos-3.webp"), alt: "Smart Mosque Model original hardware photo 3" },
      { src: asset("/media/portfolio/showcase/smart-mosque/photos-4.webp"), alt: "Smart Mosque Model original hardware photo 4" },
      { src: asset("/media/portfolio/showcase/smart-mosque/photos-5.webp"), alt: "Smart Mosque Model front view with two displays" }
    ],
    uiGallery: [
      { src: asset("/media/portfolio/showcase/smart-mosque/ui-1.webp"), alt: "Smart Mosque Model original mobile interface 1" },
      { src: asset("/media/portfolio/showcase/smart-mosque/ui-2.webp"), alt: "Smart Mosque Model original mobile interface 2" },
      { src: asset("/media/portfolio/showcase/smart-mosque/ui-3.webp"), alt: "Smart Mosque Model original mobile interface 3" },
      { src: asset("/media/portfolio/showcase/smart-mosque/ui-4.webp"), alt: "Smart Mosque Model original mobile interface 4" }
    ],
    featured: false
  },
  {
    slug: "biovety-website",
    title: "Biovety International",
    category: "Web Development",
    year: "Client work",
    description: "Website design for a veterinary-health business, bringing its company presentation, product catalogue, and partner contact information into one clear browsing experience.",
    outcome: "Company website and product discovery",
    tags: ["Web design", "Product catalogue", "Business website"],
    image: "",
    website: "biovety.com",
    links: [{ label: "Visit Biovety", href: "https://biovety.com/" }],
    featured: false
  },
  {
    slug: "miraj-academy-website",
    title: "Miraj Academy",
    category: "Web Development",
    year: "Client work",
    description: "Website design for technical training and engineering R&D, connecting visitors with services, engineering projects, courses, and learning resources.",
    outcome: "Engineering services and learning resources",
    tags: ["Web design", "Education", "Engineering"],
    image: "",
    website: "miraj.academy",
    links: [{ label: "Visit Miraj Academy", href: "https://miraj.academy/" }],
    featured: false
  },
  {
    slug: "amit-avr-autonomous-car",
    title: "AVR32 Autonomous Car",
    category: "Robotics / AMIT Graduation Project",
    year: "Nov 2024",
    description: "Graduation project for the AMIT Embedded Systems Diploma: an AVR-based autonomous car that detects and avoids obstacles using an ultrasonic sensor and servo motor.",
    outcome: "Obstacle detection and avoidance",
    tags: ["Embedded systems", "Ultrasonic", "Servo control"],
    image: asset("/media/portfolio/showcase/autonomous-car/cover.webp"),
    imageNote: "AI-styled cover. Original build photos below.",
    gallery: [
      { src: asset("/media/portfolio/showcase/autonomous-car/photos-1.webp"), alt: "AVR32 autonomous car original hardware photo 1" }
    ],
    featured: false
  },
  {
    slug: "agribot-architecture",
    title: "AgriBot Architecture",
    category: "Engineering & IoT",
    year: "2024",
    description:
      "An agricultural robot that combines crop selection, fertilizer recommendations, leaf-disease diagnosis, and remote device management through Firewire OTA.",
    outcome: "Joint first place / Delta Region Environmental Forum 2026",
    tags: ["Jetson Nano", "AI/ML", "IoT"],
    image: asset("/media/portfolio/showcase/agribot/cover.webp"),
    links: [{ label: "View award and certificates", href: "#agribot-award" }],
    uiGallery: [1, 2, 3, 4].map(index => ({src: asset(`/media/portfolio/showcase/agribot/ui-${index}.webp`), alt: `AgriBot original mobile interface collection ${index}`})),
    featured: true
  },
  {
    slug: "wireless-rov-control",
    title: "Wireless ROV Control System",
    category: "Engineering & IoT",
    year: "2024",
    description:
      "An ESP32 control system with NRF24L01+ radios for bidirectional telemetry and commands between an operator and a remotely operated vehicle.",
    outcome: "Bidirectional telemetry and control",
    tags: ["ESP32", "NRF24L01+", "ROV"],
    image: asset("/media/portfolio/showcase/wireless-rov/cover-asl-v1.png"),
    imageNote: "AI-styled project visualization based on the real ROV prototype. Original prototype and SolidWorks mechanical design are available below.",
    galleryLabel: "View original prototype and SolidWorks design",
    gallery: [
      {
        src: asset("/media/portfolio/showcase/wireless-rov/prototype.webp"),
        alt: "Original physical prototype of the wireless remotely operated vehicle"
      },
      {
        src: asset("/media/portfolio/showcase/wireless-rov/solidworks-design.webp"),
        alt: "SolidWorks mechanical design of the wireless remotely operated vehicle"
      }
    ],
    links: [
      {
        label: "Read the related Q1 Scientific Reports paper",
        href: "https://www.nature.com/articles/s41598-025-23281-8"
      }
    ],
    featured: true
  },
  {
    slug: "multi-mcu-security-lock",
    title: "Multi-MCU Security Lock",
    category: "Engineering & IoT",
    year: "2023",
    description:
      "An access-control prototype that separates the human-machine interface from the electronic control unit to limit the effect of physical tampering.",
    outcome: "Separated control and interface logic",
    tags: ["AVR", "Security", "Embedded C"],
    image: asset("/media/portfolio/multi-mcu-security-lock-architecture.svg"),
    gallery: [
      { src: asset("/media/portfolio/lock-running.png"), alt: "Original Proteus simulation: door control with two ATmega32 microcontrollers" },
      { src: asset("/media/portfolio/lock-password.png"), alt: "Original Proteus simulation: setting a new password" }
    ],
    featured: true
  },
  {
    slug: "megasumo-autonomous-robot",
    title: "MegaSumo Autonomous Robot",
    category: "Robotics",
    year: "2022",
    description:
      "Competition firmware and sensor logic for an autonomous sumo robot, built around fast control loops and arena-tuned behavior.",
    outcome: "2nd in Egypt / Sumo Mega (Adult), Robot Challenge 2022",
    tags: ["Arduino", "Robotics", "Control"],
    image: asset("/media/portfolio/showcase/robotics-covers/megasumo-asl-v1.png"),
    imageNote: "AI-styled cover based on the original build photo. Original image below.",
    gallery: [{ src: asset("/media/optimized/project-megasumo.webp"), alt: "Original MegaSumo robot with metal wedge, ultrasonic sensors and battery holders" }],
    links: [
      { label: "Watch project video 1", href: asset("/media/portfolio/showcase/megasumo/megasumo-demo.mp4") },
      { label: "Watch project video 2", href: asset("/media/portfolio/showcase/megasumo/megasumo-demo-2.mp4") },
      { label: "View competition result", href: "#dead-code-award" }
    ],
    featured: true
  },
  {
    slug: "firewire-enterprise-ota",
    title: "Firewire Enterprise OTA",
    category: "Engineering & IoT",
    year: "2024",
    description:
      "A remote firmware and hardware management platform for edge devices, with version tracking, device assignment, and health telemetry.",
    outcome: "Remote fleet management",
    tags: ["OTA", "Raspberry Pi", "IoT"],
    image: asset("/media/portfolio/showcase/firewire/cover-asl-v1.webp"),
    imageNote: "AI-styled monitor mockup based on the original dashboard. Original screenshot below; displayed device states are demo data.",
    gallery: [
      { src: asset("/media/portfolio/showcase/firewire/original-dashboard.png"), alt: "Original FireWire OTA dashboard showing three registered devices and zero online devices" }
    ],
    featured: false
  },
  {
    slug: "plant-care-ai",
    title: "Plant Care AI",
    category: "AI & Mobile",
    year: "2024",
    description:
      "A plant-monitoring system that combines soil and temperature sensing, leaf-disease detection, and a Flutter app.",
    outcome: "Sensor and vision data in one app",
    tags: ["Flutter", "AI Vision", "Sensors"],
    image: asset("/media/portfolio/showcase/plant-care/cover.webp"),
    imageNote: "AI-styled cover. Original build photos below.",
    gallery: [
      { src: asset("/media/portfolio/showcase/plant-care/photos-1.webp"), alt: "Plant Care AI original hardware photo 1" },
      { src: asset("/media/portfolio/showcase/plant-care/photos-2.webp"), alt: "Plant Care AI original hardware photo 2" },
      { src: asset("/media/portfolio/showcase/plant-care/photos-3.webp"), alt: "Plant Care AI original hardware photo 3" },
      { src: asset("/media/portfolio/showcase/plant-care/photos-4.webp"), alt: "Plant Care AI original hardware photo 4" },
      { src: asset("/media/portfolio/showcase/plant-care/photos-5.webp"), alt: "Plant Care AI original hardware photo 5" }
    ],
    uiGallery: [
      { src: asset("/media/portfolio/showcase/plant-care/ui-1.webp"), alt: "Plant Care AI original mobile interface 1" },
      { src: asset("/media/portfolio/showcase/plant-care/ui-2.webp"), alt: "Plant Care AI original mobile interface 2" }
    ],
    featured: false
  },
  {
    slug: "rocket-league-esp32",
    title: "Rocket League ESP32 Car",
    category: "Robotics",
    year: "2023",
    description:
      "A wireless ESP32 vehicle controlled with synchronized PS4 controller input over Bluetooth.",
    outcome: "Bluetooth vehicle control",
    tags: ["ESP32", "Bluetooth", "PS4"],
    image: asset("/media/portfolio/showcase/robotics-covers/rocket-league-asl-v1.png"),
    imageNote: "AI-styled cover showing the selected car from the original photo. Original image below.",
    gallery: [{ src: asset("/media/portfolio/showcase/robotics-covers/rocket-league-original-left.png"), alt: "Original Rocket League car with yellow camouflage controller, black chassis and foam bumpers" }],
    featured: false
  },
  {
    slug: "human-follower-car",
    title: "Human Follower Car",
    category: "Robotics",
    year: "2023",
    description:
      "A mobile robot that combines ultrasonic and vision sensing to detect and follow a moving person.",
    outcome: "Person-following control",
    tags: ["Vision", "Ultrasonic", "Motor control"],
    image: asset("/media/portfolio/showcase/robotics-covers/human-follower-asl-v5.png"),
    imageNote: "AI-generated visualization using the confirmed Arduino Uno, with illustrative cable management. Not a wiring reference or an exact build photograph; original frame below.",
    gallery: [{ src: asset("/media/optimized/project-human-follower.webp"), alt: "Original video frame of the Human Follower Car with black chassis, yellow wheels and exposed wiring" }],
    featured: false
  },
  {
    slug: "agribot-mobile-ui",
    title: "AgriBot Mobile App UI",
    category: "UI/UX & Design",
    year: "2024",
    description:
      "A mobile interface for monitoring AgriBot sensor data and controlling the graduation-project robot.",
    outcome: "Remote hardware control",
    tags: ["Figma", "Mobile UI", "IoT"],
    image: asset("/media/portfolio/showcase/agribot/ui-1.webp"),
    uiGallery: [1, 2, 3, 4].map(index => ({src: asset(`/media/portfolio/showcase/agribot/ui-${index}.webp`), alt: `AgriBot original mobile interface collection ${index}`})),
    featured: false
  },
  {
    slug: "dad4hire-mobile-ui",
    title: "Dad4Hire Mobile App UI",
    category: "UI/UX & Design",
    year: "2023",
    description:
      "Task flows and mobile interface design for the Dad4Hire concept developed with Google DSC at EELU.",
    outcome: "Mobile task flows",
    tags: ["Figma", "UX", "Mobile"],
    image: asset("/media/generated/placeholders/dad4hire-mobile-ui.svg"),
    featured: false
  },
  {
    slug: "dragons-battle-promo",
    title: "Dragons Battle Final Call",
    category: "Video",
    year: "2024",
    description:
      "A short competition-registration video edited with rapid cuts and typographic overlays.",
    outcome: "Event campaign asset",
    tags: ["Premiere Pro", "Motion", "Campaign"],
    image: asset("/media/generated/placeholders/dragons-battle-promo.svg"),
    featured: false
  }
];

export const tutorials: Tutorial[] = [
  {
    title: "ROS Requirements Crash Course",
    description:
      "A sequence of short lessons covering the Python, Linux, and tooling foundations used with Robot Operating System.",
    tags: ["Python", "Linux", "ROS"],
    image: asset("/media/optimized/tutorial-ros.webp"),
    href: "https://www.youtube.com/playlist?list=PLMSkmiBu0cz6m-LOsum_j4yto_h9PMG70"
  },
  {
    title: "Intro to Embedded Systems World",
    description:
      "A recorded introduction to embedded software architecture, microcontrollers, and IoT design.",
    tags: ["Arduino", "AVR", "IoT"],
    image: asset("/media/optimized/tutorial-intro-embedded.webp"),
    href: "https://web.facebook.com/watch/live/?ref=watch_permalink&v=1456207331975013"
  },
  {
    title: "Embedded System Workshop L1",
    description:
      "A workshop on embedded hardware, digital logic, and C/C++ fundamentals.",
    tags: ["C/C++", "Digital Logic", "Architecture"],
    image: asset("/media/optimized/tutorial-embedded-workshop.webp"),
    href: "https://youtube.com/playlist?list=PLzFyd8nPA2MyZav2MILCrSjpu92iy4PC4&si=twUFB8WvJpBhWeN2"
  },
  {
    title: "Digital and Logic Laboratory",
    description:
      "Laboratory sessions on digital electronics, logic gates, and circuit implementation.",
    tags: ["Electronics", "Digital Logic"],
    image: "https://img.youtube.com/vi/B80aGV47fhw/maxresdefault.jpg",
    href: "https://www.youtube.com/playlist?list=PLYt83m8l2mixN3QzpHG2rQrzKVBPwN4i4"
  },
  {
    title: "Matlab Basics",
    description:
      "Lessons on Matlab programming for engineering calculations, data visualization, and algorithms.",
    tags: ["Matlab", "Engineering"],
    image: "https://img.youtube.com/vi/hD-5lLwu4TM/maxresdefault.jpg",
    href: "https://www.youtube.com/playlist?list=PLYt83m8l2mixe_1k4BWNVCg0HXdYx6BPw"
  },
  {
    title: "Learn Cisco Packet Tracer",
    description:
      "Network design, configuration, and troubleshooting exercises in Cisco Packet Tracer.",
    tags: ["Networking", "Cisco Packet Tracer"],
    image: "https://i.ytimg.com/vi/3AnSQQCfKXU/maxresdefault.jpg",
    href: "https://www.youtube.com/playlist?list=PLYt83m8l2miz9kJS0g82ghh3ffdRYjfZ1"
  }
];

export const experience: Experience[] = [
  {
    role: "Coding Instructor",
    organization: "iSchool",
    type: "Part-time",
    period: "Apr 2026 - Jun 2026",
    location: "Remote",
    description: "Taught coding in a remote, part-time instructor role, combining programming instruction with student support.",
    tags: ["Teaching", "Programming"]
  },
  {
    role: "Teaching Assistant",
    organization: "Delta University for Science and Technology",
    type: "Full-time",
    period: "Sep 2025 - Present",
    location: "Gamasa, Ad Daqahliyah, Egypt / On-site",
    description:
      "Teach undergraduate lectures and labs in Satellite Communication, Acoustics, Digital and Logic Circuits, and Measurement and Sensors.",
    tags: ["Satellite Communication", "Acoustics", "Digital & Logic", "Sensors"]
  },
  {
    role: "Video Editor",
    organization: "Dragons",
    type: "Part-time",
    period: "Sep 2023 - Mar 2024",
    location: "Egypt / Remote",
    description:
      "Edited short videos covering team sessions and hackathons in Adobe Premiere Pro and DaVinci Resolve.",
    tags: ["Adobe Premiere Pro", "DaVinci Resolve", "Motion"]
  }
];

export const publicationSource: PublicationSource = {
  profileId: publicationFeed.profileId,
  profileUrl: publicationFeed.profileUrl,
  source: publicationFeed.source,
  lastSyncedAt: publicationFeed.lastSyncedAt
};

export const publications: Publication[] = publicationFeed.publications as Publication[];

export const publication: Publication & { description: string } = {
  ...publications[0],
  description: publications[0].venue
};
