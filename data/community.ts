const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
const photo = (name: string) => `${base}/media/portfolio/${name}`;

export const recognitions = [
  {
    id: "ic-esi-2026",
    result: "10th place / 83 teams",
    title: "Low-Cost 3D Scanning with Kinect V2",
    event: "International Competition on Eco-Smart Innovations (IC-ESI 2026)",
    date: "May 2026",
    description: "Our Delta University team presented ‘IT-Driven Low-Cost 3D Scanning System Using Kinect V2 for Industrial Digital Modelling’, exploring how AI-driven technologies can make industrial 3D scanning more accessible and affordable. The team achieved 10th place among 83 competing teams, as reported in our student’s competition reflection.",
    credit: "I supported the project as a supervisor alongside Assoc. Prof. B. M. El-Den, with support from Delta University for Science and Technology. The certificate of achievement was issued in my name for IC-ESI 2026 by the IEEE Egypt AP-S / MTT-S Joint Chapter.",
    links: [],
    images: [
      { src: photo("ic-esi-2026-team.png"), alt: "Project team and supervisors at IC-ESI 2026" },
      { src: photo("ic-esi-2026-celebration.png"), alt: "Team celebrating with the Delta University flag and competition recognition" },
      { src: photo("ic-esi-2026-certificate.jpg"), alt: "Ahmed Ibrahim Asl’s IC-ESI certificate of achievement for the Kinect V2 3D scanning project, May 2026" }
    ]
  },
  {
    id: "agribot-award",
    result: "Joint first place",
    title: "AgriBot / Academia and Industry: Bridging the Gap",
    event: "First Environmental Forum of Delta Region Universities Alliance",
    date: "10 to 11 February 2026 / Tanta University",
    description: "Our graduation project combines IoT and deep learning for real-time crop, fertilizer, and pesticide recommendations. It received joint first place in the forum’s energy sustainability, recycling, and smart agriculture track.",
    credit: "Recommended for participation by Prof. Dr. Yehia El Mashad, with support from Prof. Dr. Magda Elsherbiny. Our team refined and presented the project under the supervision of Assoc. Prof. B. M. El-Den.",
    links: [{ label: "Read the project announcement", href: "https://www.linkedin.com/posts/ahmed-ibrahim-asl_innovation-academiatoindustry-sustainability-activity-7432145014056574976-FVx7" }],
    images: [
      { src: photo("agribot-award-stage.jpg"), alt: "AgriBot award ceremony at Tanta University" },
      { src: photo("agribot-first-place.jpg"), alt: "Joint first-place certificate, 10 to 11 February 2026" },
      { src: photo("agribot-prize.png"), alt: "First winner prize card from the forum" },
      { src: photo("agribot-participation.png"), alt: "Ahmed Ibrahim Asl’s AgriBot participation certificate" },
      { src: photo("agribot-university-post.png"), alt: "Delta University’s announcement of the AgriBot award" },
      { src: photo("agribot-tanta-appreciation.jpg"), alt: "Tanta University certificate of appreciation for contributions to the First Environmental Forum, 10 to 11 February 2026" }
    ]
  },
  {
    id: "dead-code-award",
    result: "Second in Egypt",
    title: "Dead Code / Sumo Mega (Adult)",
    event: "Robot Challenge Egypt 2022: National Finals",
    date: "14 October 2022 / 6th October City",
    description: "Our Dead Code team placed second nationwide in the Sumo Mega adult category, qualifying to represent Egypt at the international finals scheduled for Beijing in August 2023.",
    credit: "Team members: Ahmed Ibrahim Asl, Ahmed Mahmoud Abd Elhamid, and Abdallah Saad Howeidy. Team coach: Baher Abd El-Monaem El-Semsar. Thanks to instructors Rami Adel and Hesham Gamal for their support during the five-week ITI and SmartTechnology Academy embedded-systems training.",
    links: [],
    images: [
      { src: photo("dead-code-team.png"), alt: "Dead Code team with medals and trophy at Robot Challenge Egypt 2022" },
      { src: photo("dead-code-trophy.png"), alt: "Dead Code’s Robot Challenge trophy and medal" },
      { src: photo("dead-code-confirmation.png"), alt: "Official confirmation of second place and qualification for the international finals" }
    ]
  }
];

export const volunteering = [
  {
    role: "Founder / Leader", organization: "Dead Code", period: "May 2022 to Apr 2025",
    description: "Founded a student initiative to help underestimated talent develop technical skills, share knowledge, and find opportunities to contribute.",
    contributions: [
      "Organized ‘How to Fund Your Graduation Project’ with Eng. Abdelrhman Ibrahim and ‘How to Build a Fighting Robot’ with Eng. Ali Shoman.",
      "Created event graphics and edited video interviews, including promotional work for the DU Job Fair.",
      "Led Tech Talk, a series of computer-networking posts reviewed by industry experts.",
      "Built a collaboration with Techni Drifts to connect members with technical events."
    ],
    links: [{ label: "Dead Code community", href: "https://www.facebook.com/profile.php?id=61555154574308" }]
  },
  {
    role: "Technical Co-Lead", organization: "GDG on Campus Delta University", period: "Oct 2024 to Apr 2025",
    description: "Coordinated technical operations and reshaped workshops into accessible, edited YouTube tutorials for Dead Code and GDG Delta University.",
    contributions: ["Edited lesson videos and supported flexible learning schedules and more focused mentoring for students and instructors."],
    links: [{ label: "Watch recorded workshops", href: "https://www.youtube.com/channel/UCSa3oB_k286igqUUfpGo3Lg" }]
  },
  {
    role: "Head of Embedded Systems", organization: "GDG on Campus Delta University", period: "Jul 2023 to Feb 2024",
    description: "Delivered beginner embedded-systems workshops and mentored peers as they developed their hardware and programming skills.",
    contributions: [],
    links: [{ label: "Embedded systems workshop playlist", href: "https://www.youtube.com/playlist?list=PLzFyd8nPA2MyZav2MILCrSjpu92iy4PC4" }]
  },
  {
    role: "Graphic Design Team Member", organization: "GDG on Campus Delta University", period: "Jun 2023 to Feb 2024",
    description: "Designed promotional content for team sessions under the guidance of Head of Marketing Zainab Mohamoud.",
    contributions: [],
    links: [
      { label: "Session design 01", href: "https://img.youtube.com/vi/g791V_Wyvyc/maxresdefault.jpg" },
      { label: "Session design 02", href: "https://img.youtube.com/vi/HxI-9Z8o2lg/maxresdefault.jpg" },
      { label: "Session design 03", href: "https://img.youtube.com/vi/AkvZ2It6uaQ/maxresdefault.jpg" }
    ]
  }
];
