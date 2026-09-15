import { OLD_COURSES, OLD_COMMUNICATION_PROGRAM_GROUPS } from './curriculum_old';

export type BylawVersion = 'Bylaw_2013' | 'Bylaw_2021';

export interface Course {
  code: string;
  name: string;
  hours: number;
  level: string;
  semester: string;
  category: string;
  prereq: string[];
}

export function getCourses(bylawVersion?: BylawVersion): Course[] {
  return bylawVersion === 'Bylaw_2013' ? OLD_COURSES : COURSES;
}

export function getProgramGroups(bylawVersion?: BylawVersion, program: string = 'communications'): any {
  if (bylawVersion === 'Bylaw_2013' && program === 'communications') {
    return OLD_COMMUNICATION_PROGRAM_GROUPS.map(g => ({
      ...g,
      electiveGroupId: g.id.includes('elective') ? g.id as any : undefined
    }));
  }
  return [];
}

export function getElectiveGroups(bylawVersion?: BylawVersion, program: string = 'communications'): any[] {
  return getProgramGroups(bylawVersion, program).filter((g: any) => g.electiveGroupId);
}

export function getElectiveGroup(groupId: string, bylawVersion?: BylawVersion): { label: string; requiredHours: number; codes: readonly string[] } | undefined {
  if (bylawVersion === 'Bylaw_2013') {
    const oldGroup = OLD_COMMUNICATION_PROGRAM_GROUPS.find(g => g.id === groupId);
    if (oldGroup) return oldGroup as any;
  }
  return (ELECTIVE_GROUPS as any)[groupId];
}

export const COURSES: Course[] = [
  { code: 'ARC121', name: "Architectural Design (1)", hours: 3, level: 'L1', semester: 'Semester 1', category: 'Architectural Engineering', prereq: ['MEC051'] },
  { code: 'ARC122', name: "Architectural Design (2)", hours: 3, level: 'L1', semester: 'Semester 2', category: 'Architectural Engineering', prereq: ['ARC121'] },
  { code: 'ARC131', name: "Building Construction (1)", hours: 3, level: 'L1', semester: 'Semester 1', category: 'Architectural Engineering', prereq: ['MEC051'] },
  { code: 'ARC132', name: "Building Construction (2)", hours: 1, level: 'L1', semester: 'Semester 2', category: 'Architectural Engineering', prereq: ['ARC131'] },
  { code: 'ARC141', name: "Visual Studies (1)", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Architectural Engineering', prereq: [] },
  { code: 'ARC142', name: "Visual Studies (2)", hours: 1, level: 'L4', semester: 'Semester 2', category: 'Architectural Engineering', prereq: [] },
  { code: 'ARC151', name: "Theory of Architecture (1)", hours: 2, level: 'L1', semester: 'Semester 1', category: 'Architectural Engineering', prereq: [] },
  { code: 'ARC152', name: "Humanitarian Studies in Architecture", hours: 2, level: 'L1', semester: 'Semester 2', category: 'Architectural Engineering', prereq: [] },
  { code: 'ARC161', name: "History of Architecture (1)", hours: 2, level: 'L1', semester: 'Semester 2', category: 'Architectural Engineering', prereq: [] },
  { code: 'ARC200', name: "Practical Training-Architecture (1)", hours: 1, level: 'L2', semester: 'Summer', category: 'Architectural Engineering', prereq: [] },
  { code: 'ARC221', name: "Architectural Design (3)", hours: 3, level: 'L4', semester: 'Semester 2', category: 'Architectural Engineering', prereq: ['ARC122'] },
  { code: 'ARC222', name: "Architectural Design (4)", hours: 1, level: 'L4', semester: 'Semester 2', category: 'Architectural Engineering', prereq: ['ARC221'] },
  { code: 'ARC232', name: "Execution Design (1)", hours: 3, level: 'L4', semester: 'Semester 2', category: 'Architectural Engineering', prereq: ['ARC231'] },
  { code: 'ARC241', name: "Basics and Principles of Painting", hours: 2, level: 'L2', semester: 'Semester 1', category: 'Architectural Engineering', prereq: [] },
  { code: 'ARC242', name: "Architectural Sketching", hours: 2, level: 'L2', semester: 'Semester 1', category: 'Architectural Engineering', prereq: [] },
  { code: 'ARC243', name: "Perspective and Rendering", hours: 2, level: 'L2', semester: 'Semester 1', category: 'Architectural Engineering', prereq: [] },
  { code: 'ARC244', name: "Architectural Models Making", hours: 2, level: 'L2', semester: 'Semester 1', category: 'Architectural Engineering', prereq: [] },
  { code: 'ARC245', name: "Techniques of Architectural Representation", hours: 2, level: 'L2', semester: 'Semester 1', category: 'Architectural Engineering', prereq: [] },
  { code: 'ARC246', name: "Architectural Photography", hours: 2, level: 'L2', semester: 'Semester 1', category: 'Architectural Engineering', prereq: [] },
  { code: 'ARC247', name: "Graphics Design", hours: 2, level: 'L2', semester: 'Semester 1', category: 'Architectural Engineering', prereq: [] },
  { code: 'ARC251', name: "Theory of Architecture (2)", hours: 2, level: 'L2', semester: 'Semester 1', category: 'Architectural Engineering', prereq: ['ARC151'] },
  { code: 'ARC261', name: "History of Architecture (2)", hours: 1, level: 'L2', semester: 'Semester 2', category: 'Architectural Engineering', prereq: [] },
  { code: 'ARC271', name: "Introduction to town planning", hours: 3, level: 'L2', semester: 'Semester 2', category: 'Architectural Engineering', prereq: [] },
  { code: 'ARC281', name: "Environmental Studies in Architecture", hours: 1, level: 'L2', semester: 'Semester 1', category: 'Architectural Engineering', prereq: [] },
  { code: 'ARC291', name: "Computer Applications in Architecture", hours: 2, level: 'L2', semester: 'Semester 2', category: 'Architectural Engineering', prereq: [] },
  { code: 'ARC300', name: "Practical Training-Architecture (2)", hours: 1, level: 'L3', semester: 'Summer', category: 'Architectural Engineering', prereq: [] },
  { code: 'ARC321', name: "Architectural Design (5)", hours: 3, level: 'L3', semester: 'Semester 1', category: 'Architectural Engineering', prereq: ['ARC222'] },
  { code: 'ARC322', name: "Architectural Design (6)", hours: 3, level: 'L3', semester: 'Semester 2', category: 'Architectural Engineering', prereq: ['ARC321'] },
  { code: 'ARC323', name: "Design & Building Economics", hours: 2, level: 'L3', semester: 'Unknown', category: 'Architectural Engineering', prereq: [] },
  { code: 'ARC331', name: "Execution Design (2)", hours: 3, level: 'L3', semester: 'Semester 1', category: 'Architectural Engineering', prereq: ['ARC232'] },
  { code: 'ARC332', name: "Execution Design (3)", hours: 3, level: 'L3', semester: 'Semester 2', category: 'Architectural Engineering', prereq: ['ARC331'] },
  { code: 'ARC351', name: "Theory of Architecture (3)", hours: 2, level: 'L3', semester: 'Semester 1', category: 'Architectural Engineering', prereq: ['ARC251'] },
  { code: 'ARC352', name: "Social Studies in Architecture", hours: 2, level: 'L3', semester: 'Unknown', category: 'Architectural Engineering', prereq: [] },
  { code: 'ARC353', name: "Local & Contemporary Architecture", hours: 2, level: 'L3', semester: 'Unknown', category: 'Architectural Engineering', prereq: [] },
  { code: 'ARC361', name: "History of Architecture (3)", hours: 1, level: 'L3', semester: 'Semester 2', category: 'Architectural Engineering', prereq: [] },
  { code: 'ARC371', name: "Urban Design", hours: 3, level: 'L3', semester: 'Semester 1', category: 'Architectural Engineering', prereq: ['ARC271'] },
  { code: 'ARC421', name: "Interior Design", hours: 2, level: 'L2', semester: 'Semester 1', category: 'Architectural Engineering', prereq: [] },
  { code: 'ARC431', name: "Intelligent Buildings", hours: 2, level: 'L4', semester: 'Unknown', category: 'Architectural Engineering', prereq: [] },
  { code: 'ARC451', name: "Architecture Criticism", hours: 2, level: 'L2', semester: 'Semester 1', category: 'Architectural Engineering', prereq: [] },
  { code: 'ARC452', name: "Building Regulation and Professional Practice", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Architectural Engineering', prereq: [] },
  { code: 'ARC453', name: "Architectural Research Programs", hours: 2, level: 'L4', semester: 'Semester 1', category: 'Architectural Engineering', prereq: ['ARC322'] },
  { code: 'ARC455', name: "Building Rehabilitation and Protection", hours: 2, level: 'L4', semester: 'Unknown', category: 'Architectural Engineering', prereq: [] },
  { code: 'ARC471', name: "Housing", hours: 2, level: 'L4', semester: 'Semester 1', category: 'Architectural Engineering', prereq: [] },
  { code: 'ARC481', name: "Buildings Physics", hours: 3, level: 'L4', semester: 'Semester 2', category: 'Architectural Engineering', prereq: ['ARC281'] },
  { code: 'ARC482', name: "Codes of Green Buildings", hours: 2, level: 'L2', semester: 'Semester 1', category: 'Architectural Engineering', prereq: [] },
  { code: 'ARC483', name: "Integrated Architecture.", hours: 2, level: 'L2', semester: 'Semester 1', category: 'Architectural Engineering', prereq: [] },
  { code: 'ARC484', name: "Environmental Impact Assessment (EIA)", hours: 2, level: 'L2', semester: 'Semester 1', category: 'Architectural Engineering', prereq: [] },
  { code: 'ARC485', name: "Sustainability in Architecture", hours: 2, level: 'L4', semester: 'Unknown', category: 'Architectural Engineering', prereq: [] },
  { code: 'ARC491', name: "Virtual & Augmented Reality in Architecture", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Architectural Engineering', prereq: [] },
  { code: 'ARC492', name: "Geographical Information Systems", hours: 2, level: 'L4', semester: 'Unknown', category: 'Architectural Engineering', prereq: [] },
  { code: 'BAS00E', name: "Basics of English", hours: 0, level: 'L0', semester: 'Semester 1', category: 'Basic Sciences', prereq: [] },
  { code: 'BAS00M', name: "Basics of Mathematics", hours: 0, level: 'L0', semester: 'Semester 1', category: 'Basic Sciences', prereq: [] },
  { code: 'BAS00P', name: "Basics of Physics", hours: 0, level: 'L0', semester: 'Semester 1', category: 'Basic Sciences', prereq: [] },
  { code: 'BAS011', name: "Engineering Mathematics (1)", hours: 3, level: 'L0', semester: 'Semester 1', category: 'Basic Sciences', prereq: [] },
  { code: 'BAS012', name: "Engineering Mathematics (2)", hours: 3, level: 'L0', semester: 'Semester 2', category: 'Basic Sciences', prereq: [] },
  { code: 'BAS021', name: "Engineering Physics (1)", hours: 3, level: 'L0', semester: 'Semester 1', category: 'Basic Sciences', prereq: [] },
  { code: 'BAS022', name: "Engineering Physics (2)", hours: 3, level: 'L0', semester: 'Semester 2', category: 'Basic Sciences', prereq: ['BAS021'] },
  { code: 'BAS031', name: "Engineering Chemistry", hours: 3, level: 'L0', semester: 'Semester 2', category: 'Basic Sciences', prereq: [] },
  { code: 'BAS111', name: "Engineering Mathematics (3)", hours: 3, level: 'L1', semester: 'Semester 1', category: 'Basic Sciences', prereq: [] },
  { code: 'BAS112', name: "Engineering Mathematics (4)", hours: 3, level: 'L1', semester: 'Semester 2', category: 'Basic Sciences', prereq: ['BAS111'] },
  { code: 'BAS113', name: "Statistics and Operation research", hours: 3, level: 'L1', semester: 'Semester 2', category: 'Basic Sciences', prereq: [] },
  { code: 'BAS211', name: "Applied Topics in Engineering Mathematics", hours: 3, level: 'L2', semester: 'Semester 2', category: 'Basic Sciences', prereq: [] },
  { code: 'CIV111', name: "Structural Analysis (1)", hours: 3, level: 'L1', semester: 'Semester 1', category: 'Civil Engineering', prereq: ['MEC021'] },
  { code: 'CIV112', name: "Structural Analysis (2)", hours: 3, level: 'L1', semester: 'Semester 2', category: 'Civil Engineering', prereq: ['CIV111'] },
  { code: 'CIV120', name: "Building Materials & Testing for Architects", hours: 2, level: 'L1', semester: 'Semester 2', category: 'Civil Engineering', prereq: [] },
  { code: 'CIV121', name: "Properties and strength of material", hours: 3, level: 'L1', semester: 'Semester 1', category: 'Civil Engineering', prereq: ['BAS041'] },
  { code: 'CIV122', name: "Building Construction Materials", hours: 3, level: 'L4', semester: 'Semester 2', category: 'Civil Engineering', prereq: ['CIV121'] },
  { code: 'CIV131', name: "Engineering Surveying (1)", hours: 3, level: 'L1', semester: 'Semester 1', category: 'Civil Engineering', prereq: [] },
  { code: 'CIV141', name: "Civil Engineering Drawing", hours: 2, level: 'L1', semester: 'Semester 2', category: 'Civil Engineering', prereq: ['MEC051'] },
  { code: 'CIV142', name: "Engineering of Fluid Mechanics", hours: 3, level: 'L1', semester: 'Semester 2', category: 'Civil Engineering', prereq: [] },
  { code: 'CIV200', name: "Practical Training-Civil Eng. (1)", hours: 1, level: 'L2', semester: 'Summer', category: 'Civil Engineering', prereq: [] },
  { code: 'CIV210', name: "Theory of Structures for Architects", hours: 2, level: 'L2', semester: 'Semester 1', category: 'Civil Engineering', prereq: [] },
  { code: 'CIV211', name: "Stress Analysis in Structures", hours: 3, level: 'L2', semester: 'Semester 1', category: 'Civil Engineering', prereq: ['CIV111'] },
  { code: 'CIV221', name: "Concrete Technology and Quality Control", hours: 3, level: 'L2', semester: 'Semester 1', category: 'Civil Engineering', prereq: ['CIV122'] },
  { code: 'CIV230', name: "Surveying & Measurements for Architects", hours: 2, level: 'L2', semester: 'Semester 2', category: 'Civil Engineering', prereq: [] },
  { code: 'CIV231', name: "Engineering Surveying (2)", hours: 3, level: 'L2', semester: 'Semester 1', category: 'Civil Engineering', prereq: ['CIV131'] },
  { code: 'CIV241', name: "Open Channels Hydraulics", hours: 2, level: 'L2', semester: 'Semester 1', category: 'Civil Engineering', prereq: ['CIV142'] },
  { code: 'CIV251', name: "Design of RC Structures (1)", hours: 1, level: 'L2', semester: 'Semester 1', category: 'Civil Engineering', prereq: ['CIV111'] },
  { code: 'CIV252', name: "Design of RC Structures (2)", hours: 3, level: 'L2', semester: 'Semester 2', category: 'Civil Engineering', prereq: ['CIV251'] },
  { code: 'CIV261', name: "Geotechnical Engineering (1)", hours: 3, level: 'L2', semester: 'Semester 2', category: 'Civil Engineering', prereq: [] },
  { code: 'CIV280', name: "Fundamentals of Projects Management", hours: 2, level: 'L2', semester: 'Semester 1', category: 'Civil Engineering', prereq: [] },
  { code: 'CIV281', name: "Construction Contracts.", hours: 3, level: 'L2', semester: 'Semester 2', category: 'Civil Engineering', prereq: [] },
  { code: 'CIV291', name: "Transportation Planning & Traffic Engineering", hours: 3, level: 'L4', semester: 'Semester 2', category: 'Civil Engineering', prereq: [] },
  { code: 'CIV300', name: "Practical Training-Civil Engineering (2)", hours: 1, level: 'L3', semester: 'Semester 3', category: 'Civil Engineering', prereq: ['CIV200'] },
  { code: 'CIV331', name: "Geodetic Surveying", hours: 3, level: 'L4', semester: 'Semester 2', category: 'Civil Engineering', prereq: ['CIV231'] },
  { code: 'CIV341', name: "Design of Water Structures(1)", hours: 3, level: 'L3', semester: 'Semester 1', category: 'Civil Engineering', prereq: ['CIV242'] },
  { code: 'CIV342', name: "Sanitary Engineering", hours: 3, level: 'L3', semester: 'Semester 2', category: 'Civil Engineering', prereq: ['CIV142'] },
  { code: 'CIV343', name: "Design of Water Structures(2)", hours: 3, level: 'L3', semester: 'Semester 2', category: 'Civil Engineering', prereq: ['CIV341'] },
  { code: 'CIV350', name: "Reinforced Concrete and Steel Construction for Architects", hours: 3, level: 'L3', semester: 'Semester 1', category: 'Civil Engineering', prereq: ['CIV210'] },
  { code: 'CIV360', name: "Soil Mechanics and Foundation for Architects", hours: 2, level: 'L3', semester: 'Semester 2', category: 'Civil Engineering', prereq: [] },
  { code: 'CIV361', name: "Geotechnical Engineering (2)", hours: 3, level: 'L3', semester: 'Semester 1', category: 'Civil Engineering', prereq: ['CIV261'] },
  { code: 'CIV362', name: "Geotechnical Engineering (3)", hours: 3, level: 'L3', semester: 'Semester 2', category: 'Civil Engineering', prereq: ['CIV361'] },
  { code: 'CIV371', name: "Design of Steel Structures (1)", hours: 1, level: 'L3', semester: 'Semester 1', category: 'Civil Engineering', prereq: [] },
  { code: 'CIV391', name: "Highway Engineering (1)", hours: 3, level: 'L3', semester: 'Semester 2', category: 'Civil Engineering', prereq: [] },
  { code: 'CIV400A', name: "Graduation Project-Civil Engineering (1)", hours: 3, level: 'L4', semester: 'Semester 1', category: 'Civil Engineering', prereq: ['CIV300'] },
  { code: 'CIV400B', name: "Graduation Project-Civil Engineering (2)", hours: 4, level: 'L4', semester: 'Semester 2', category: 'Civil Engineering', prereq: [] },
  { code: 'CIV411', name: "Advanced Structural Analysis", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Civil Engineering', prereq: ['CIV211'] },
  { code: 'CIV421', name: "Inspection and Maintenance of Structures", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Civil Engineering', prereq: ['CIV221'] },
  { code: 'CIV431', name: "GIS and Remote Sensing Applications", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Civil Engineering', prereq: ['CIV231'] },
  { code: 'CIV442', name: "Water Resources Engineering", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Civil Engineering', prereq: ['CIV242'] },
  { code: 'CIV443', name: "Environmental Hydrology", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Civil Engineering', prereq: ['CIV242'] },
  { code: 'CIV444', name: "Water Quality and Environment", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Civil Engineering', prereq: ['CIV242'] },
  { code: 'CIV445', name: "Water and Wastewater Treatments", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Civil Engineering', prereq: ['CIV142'] },
  { code: 'CIV446', name: "River Engineering", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Civil Engineering', prereq: ['CIV241'] },
  { code: 'CIV447', name: "Dams Engineering", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Civil Engineering', prereq: ['CIV241'] },
  { code: 'CIV448', name: "Water Supply Engineering", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Civil Engineering', prereq: ['CIV342'] },
  { code: 'CIV449', name: "Pump Station Engineering", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Civil Engineering', prereq: ['CIV142'] },
  { code: 'CIV451', name: "Special Topics in Design of RC Structures", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Civil Engineering', prereq: ['CIV252'] },
  { code: 'CIV461', name: "Ground Improvement", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Civil Engineering', prereq: ['CIV261'] },
  { code: 'CIV471', name: "Structural Steel Design (2)", hours: 3, level: 'L4', semester: 'Semester 1', category: 'Civil Engineering', prereq: ['CIV371'] },
  { code: 'CIV472', name: "Introduction to Composite Structures", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Civil Engineering', prereq: ['CIV471'] },
  { code: 'CIV481', name: "Building Information Modeling (BIM).", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Civil Engineering', prereq: ['CIV280'] },
  { code: 'CIV491', name: "Highway Engineering (2)", hours: 3, level: 'L4', semester: 'Semester 1', category: 'Civil Engineering', prereq: [] },
  { code: 'CIV492', name: "Railway Engineering", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Civil Engineering', prereq: ['CIV231'] },
  { code: 'CIV493', name: "Advanced Topics in Transportation Engineering", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Civil Engineering', prereq: ['CIV291'] },
  { code: 'CIV494', name: "Airport Planning and Design", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Civil Engineering', prereq: ['CIV391'] },
  { code: 'CIV495', name: "Maintenance of Highways and Airports", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Civil Engineering', prereq: ['CIV391'] },
  { code: 'ECE001', name: "Introduction to Computer Programming", hours: 2, level: 'L0', semester: 'Semester 2', category: 'Communications Engineering', prereq: [] },
  { code: 'ECE111', name: "Electrical Circuits Analysis", hours: 3, level: 'L1', semester: 'Semester 1', category: 'Communications Engineering', prereq: ['BAS022'] },
  { code: 'ECE112', name: "Fundamentals of Electronics", hours: 3, level: 'L1', semester: 'Semester 1', category: 'Communications Engineering', prereq: ['BAS022'] },
  { code: 'ECE113', name: "Advanced Electronics", hours: 3, level: 'L4', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE112'] },
  { code: 'ECE114', name: "Advanced Electrical Circuits Analysis", hours: 3, level: 'L1', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE111'] },
  { code: 'ECE115', name: "Measurements and Sensors", hours: 3, level: 'L1', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE111'] },
  { code: 'ECE171', name: "Advanced Computer Programming", hours: 3, level: 'L1', semester: 'Semester 1', category: 'Communications Engineering', prereq: ['ECE001'] },
  { code: 'ECE200', name: "Practical Training for Electronic and Communications Eng. (1)", hours: 1, level: 'L2', semester: 'Summer', category: 'Communications Engineering', prereq: [] },
  { code: 'ECE201', name: "Practical Training-Computer Eng. (1)", hours: 1, level: 'L2', semester: 'Unknown', category: 'Communications Engineering', prereq: [] },
  { code: 'ECE211', name: "Digital and Logic Circuits", hours: 3, level: 'L2', semester: 'Semester 1', category: 'Communications Engineering', prereq: ['GEN001'] },
  { code: 'ECE212', name: "Power Electronics", hours: 3, level: 'L4', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE113'] },
  { code: 'ECE221', name: "Signals and Systems", hours: 3, level: 'L4', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['BAS111'] },
  { code: 'ECE222', name: "Digital Signal Processing", hours: 3, level: 'L2', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE221'] },
  { code: 'ECE231', name: "Electromagnetic Theory", hours: 3, level: 'L2', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['BAS111'] },
  { code: 'ECE241', name: "Analog Communications", hours: 3, level: 'L2', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE221'] },
  { code: 'ECE251', name: "Computer Architecture", hours: 3, level: 'L2', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE211'] },
  { code: 'ECE252', name: "Automatic Control Systems", hours: 3, level: 'L2', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['BAS111', 'ECE114'] },
  { code: 'ECE300', name: "Practical Training for Electronic and Communications Eng. (2)", hours: 1, level: 'L3', semester: 'Summer', category: 'Communications Engineering', prereq: ['ECE200'] },
  { code: 'ECE311', name: "VLSI Design", hours: 3, level: 'L3', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE211', 'ECE113'] },
  { code: 'ECE312', name: "Principles of Nanoelectronics", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE113'] },
  { code: 'ECE313', name: "Analog Integrated Circuit Design", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE113'] },
  { code: 'ECE314', name: "Computer Aided Design for Digital Circuits", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE211'] },
  { code: 'ECE315', name: "Filter Design and Synthesis", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE113'] },
  { code: 'ECE316', name: "RF Circuits Design", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE331'] },
  { code: 'ECE317', name: "Electronic Design Automation", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE113'] },
  { code: 'ECE331', name: "Waves and Transmission Lines", hours: 4, level: 'L3', semester: 'Semester 1', category: 'Communications Engineering', prereq: ['ECE231'] },
  { code: 'ECE332', name: "Acoustics", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE231'] },
  { code: 'ECE333', name: "Under Water Acoustics", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE231'] },
  { code: 'ECE334', name: "Radar Engineering", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE331'] },
  { code: 'ECE341', name: "Digital Communications", hours: 3, level: 'L3', semester: 'Semester 1', category: 'Communications Engineering', prereq: ['ECE241'] },
  { code: 'ECE342', name: "Optical Communications Systems", hours: 4, level: 'L3', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['BAS022', 'ECE241'] },
  { code: 'ECE343', name: "Communications Networks", hours: 3, level: 'L3', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE241'] },
  { code: 'ECE351', name: "Microprocessors (1)", hours: 3, level: 'L4', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE112'] },
  { code: 'ECE361', name: "Computer Networks", hours: 3, level: 'L3', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE241'] },
  { code: 'ECE372', name: "Data Base Systems", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE001'] },
  { code: 'ECE400A', name: "Graduation Project for Electronic and Communications Eng. (1)", hours: 3, level: 'L4', semester: 'Semester 1', category: 'Communications Engineering', prereq: ['ECE300'] },
  { code: 'ECE400B', name: "Graduation Project for Electronic and Communications Eng. (2)", hours: 4, level: 'L4', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE400A'] },
  { code: 'ECE411', name: "Optoelectronic Devices", hours: 3, level: 'L4', semester: 'Semester 1', category: 'Communications Engineering', prereq: ['ECE113'] },
  { code: 'ECE431', name: "Antennas and Wave Propagation", hours: 4, level: 'L4', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE331'] },
  { code: 'ECE441', name: "Wireless and Mobile Communications", hours: 4, level: 'L4', semester: 'Semester 1', category: 'Communications Engineering', prereq: ['ECE341'] },
  { code: 'ECE442', name: "Satellite Communications", hours: 3, level: 'L4', semester: 'Semester 1', category: 'Communications Engineering', prereq: ['ECE341'] },
  { code: 'ECE443', name: "Communications Electronics", hours: 3, level: 'L4', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE113', 'ECE241'] },
  { code: 'ECE444', name: "Data Communications", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE361'] },
  { code: 'ECE445', name: "Network Security", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE361'] },
  { code: 'ECE446', name: "Audio And Video Encoding", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE221'] },
  { code: 'ECE447', name: "Advanced Communications Systems", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE341'] },
  { code: 'ECE448', name: "Radio Navigation and GPS Systems", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE341'] },
  { code: 'ECE449', name: "Space Communications Technology", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE341'] },
  { code: 'ECE451', name: "Microprocessors (2)", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE351'] },
  { code: 'ECE452', name: "Networks Administration", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE361'] },
  { code: 'ECE454', name: "Programmable Logic Controllers", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE252'] },
  { code: 'ECE455', name: "Digital Image Processing", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE222'] },
  { code: 'ECE481', name: "Modern trends in Control Systems", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE252'] },
  { code: 'ECE482', name: "Nonlinear Control Systems", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE252'] },
  { code: 'ECE483', name: "Digital Control Systems", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE252'] },
  { code: 'ECE484', name: "Adaptive Control Systems", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE252'] },
  { code: 'ECE485', name: "Optimum Control Systems", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Communications Engineering', prereq: ['ECE252'] },
  { code: 'MEC021', name: "Engineering Mechanics (1)", hours: 3, level: 'L0', semester: 'Semester 1', category: 'Mechatronics Engineering', prereq: [] },
  { code: 'MEC022', name: "Engineering Mechanics (2)", hours: 3, level: 'L0', semester: 'Semester 2', category: 'Mechatronics Engineering', prereq: ['MEC021'] },
  { code: 'MEC051', name: "Engineering Drawing and Projection", hours: 3, level: 'L0', semester: 'Semester 1', category: 'Mechatronics Engineering', prereq: [] },
  { code: 'MEC052', name: "Fundamentals of Manufacturing Engineering", hours: 3, level: 'L0', semester: 'Semester 2', category: 'Mechatronics Engineering', prereq: [] },
  { code: 'MEC111', name: "Material Science", hours: 3, level: 'L1', semester: 'Semester 1', category: 'Mechatronics Engineering', prereq: ['MEC021'] },
  { code: 'MEC131', name: "Thermodynamics", hours: 2, level: 'L1', semester: 'Semester 2', category: 'Mechatronics Engineering', prereq: [] },
  { code: 'MEC141', name: "Introduction to Mechatronics", hours: 3, level: 'L1', semester: 'Semester 2', category: 'Mechatronics Engineering', prereq: [] },
  { code: 'MEC151', name: "Computer Aided Drawing", hours: 2, level: 'L1', semester: 'Semester 1', category: 'Mechatronics Engineering', prereq: ['MEC051'] },
  { code: 'MEC200', name: "Practical Training-Mechatronics Eng. (1)", hours: 1, level: 'L2', semester: 'Summer', category: 'Mechatronics Engineering', prereq: [] },
  { code: 'MEC211', name: "Fluid Mechanics", hours: 3, level: 'L2', semester: 'Semester 1', category: 'Mechatronics Engineering', prereq: ['BAS021'] },
  { code: 'MEC213', name: "Electrical Power Machines", hours: 2, level: 'L2', semester: 'Semester 1', category: 'Mechatronics Engineering', prereq: ['ECE114'] },
  { code: 'MEC221', name: "Kinematics of Machines", hours: 3, level: 'L2', semester: 'Semester 1', category: 'Mechatronics Engineering', prereq: ['MEC022'] },
  { code: 'MEC222', name: "Digital Signal Processing", hours: 3, level: 'L2', semester: 'Semester 2', category: 'Mechatronics Engineering', prereq: ['BAS111'] },
  { code: 'MEC231', name: "Heat and Mass Transfer", hours: 3, level: 'L2', semester: 'Semester 1', category: 'Mechatronics Engineering', prereq: ['MEC131'] },
  { code: 'MEC261', name: "Dynamics of Machines", hours: 3, level: 'L2', semester: 'Semester 2', category: 'Mechatronics Engineering', prereq: ['MEC221'] },
  { code: 'MEC300', name: "Practical Training-Mechatronics Eng. (2)", hours: 1, level: 'L3', semester: 'Summer', category: 'Mechatronics Engineering', prereq: ['MEC200'] },
  { code: 'MEC321', name: "Stress Analysis", hours: 3, level: 'L3', semester: 'Semester 1', category: 'Mechatronics Engineering', prereq: ['MEC111'] },
  { code: 'MEC354', name: "Microcontroller Applications", hours: 3, level: 'L3', semester: 'Semester 2', category: 'Mechatronics Engineering', prereq: ['ECE252'] },
  { code: 'MEC355', name: "Embedded Systems Design", hours: 3, level: 'L3', semester: 'Semester 2', category: 'Mechatronics Engineering', prereq: ['ECE252'] },
  { code: 'MEC361', name: "Mechatronics Measurements and Devices", hours: 3, level: 'L3', semester: 'Semester 1', category: 'Mechatronics Engineering', prereq: ['MEC141'] },
  { code: 'MEC362', name: "Machine Design", hours: 3, level: 'L3', semester: 'Semester 1', category: 'Mechatronics Engineering', prereq: ['MEC261'] },
  { code: 'MEC363', name: "Hydraulic and Pneumatic Systems", hours: 2, level: 'L3', semester: 'Semester 2', category: 'Mechatronics Engineering', prereq: ['MEC361'] },
  { code: 'MEC364', name: "Combustion Engines", hours: 2, level: 'L3', semester: 'Semester 2', category: 'Mechatronics Engineering', prereq: ['MEC231'] },
  { code: 'MEC365', name: "Data Networking", hours: 3, level: 'L3', semester: 'Semester 2', category: 'Mechatronics Engineering', prereq: ['ECE001'] },
  { code: 'MEC369', name: "Combustion Engines", hours: 2, level: 'L3', semester: 'Semester 2', category: 'Mechatronics Engineering', prereq: ['MEC231'] },
  { code: 'MEC371', name: "Computer Aided Design & Manufacturing CAD/CAM", hours: 2, level: 'L3', semester: 'Semester 2', category: 'Mechatronics Engineering', prereq: ['MEC151'] },
  { code: 'MEC372', name: "Autotronics", hours: 2, level: 'L3', semester: 'Semester 2', category: 'Mechatronics Engineering', prereq: ['ECE252', 'MEC363'] },
  { code: 'MEC373', name: "Automotive Theory", hours: 2, level: 'L3', semester: 'Semester 2', category: 'Mechatronics Engineering', prereq: ['ECE252', 'MEC363'] },
  { code: 'MEC374', name: "Automotive Design", hours: 2, level: 'L3', semester: 'Semester 2', category: 'Mechatronics Engineering', prereq: ['ECE252', 'MEC363'] },
  { code: 'MEC375', name: "Automotive Embedded Networking", hours: 2, level: 'L3', semester: 'Semester 2', category: 'Mechatronics Engineering', prereq: ['ECE252', 'MEC363'] },
  { code: 'MEC376', name: "Hybrid Automatic Control Systems", hours: 2, level: 'L3', semester: 'Semester 2', category: 'Mechatronics Engineering', prereq: ['ECE252', 'MEC363'] },
  { code: 'MEC381', name: "Robotics Systems and Control", hours: 3, level: 'L3', semester: 'Semester 2', category: 'Mechatronics Engineering', prereq: ['MEC361', 'ECE252'] },
  { code: 'MEC391', name: "Premium Project in Mechatronics", hours: 2, level: 'L3', semester: 'Semester 2', category: 'Mechatronics Engineering', prereq: ['MEC200'] },
  { code: 'MEC400A', name: "Graduation Project-Mechatronics Eng. (1)", hours: 3, level: 'L4', semester: 'Semester 1', category: 'Mechatronics Engineering', prereq: ['MEC300'] },
  { code: 'MEC400B', name: "Graduation Project-Mechatronics Eng. (2)", hours: 4, level: 'L4', semester: 'Semester 2', category: 'Mechatronics Engineering', prereq: ['MEC400A'] },
  { code: 'MEC453', name: "PLC and SCADA Systems", hours: 4, level: 'L4', semester: 'Semester 1', category: 'Mechatronics Engineering', prereq: ['ECE252'] },
  { code: 'MEC456', name: "Concurrent Systems", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Mechatronics Engineering', prereq: ['MEC354'] },
  { code: 'MEC463', name: "Engine Management Systems", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Mechatronics Engineering', prereq: ['MEC364'] },
  { code: 'MEC464', name: "Locomotion and Gait Analysis", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Mechatronics Engineering', prereq: ['MEC381'] },
  { code: 'MEC465', name: "Smart Actuators and Sensors", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Mechatronics Engineering', prereq: ['ECE212'] },
  { code: 'MEC466', name: "Automation of Mechanical Systems", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Mechatronics Engineering', prereq: ['MEC361'] },
  { code: 'MEC472', name: "Computational Intelligence", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Mechatronics Engineering', prereq: ['MEC381'] },
  { code: 'MEC481', name: "Advanced Robotics", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Mechatronics Engineering', prereq: ['MEC381'] },
  { code: 'MEC482', name: "Mobile Robots and Autonomous Systems", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Mechatronics Engineering', prereq: ['MEC381'] },
  { code: 'MEC483', name: "Industrial Mechanisms and Robotics", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Mechatronics Engineering', prereq: ['MEC381'] },
  { code: 'MEC484', name: "Rehabilitation Robots", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Mechatronics Engineering', prereq: ['MEC381'] },
  { code: 'MEC485', name: "Modern Manufacturing Processes", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Mechatronics Engineering', prereq: ['MEC381'] },
  { code: 'MEC491', name: "Special Topics in Mechatronics", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Mechatronics Engineering', prereq: ['MEC300'] },
  { code: 'MEC492', name: "Advanced Mechatronic Systems", hours: 2, level: 'L4', semester: 'Semester 1', category: 'Mechatronics Engineering', prereq: ['MEC361'] },
  { code: 'MEC493', name: "Industrial Automation", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Mechatronics Engineering', prereq: ['MEC381'] },
  { code: 'MEC494', name: "Autonomous Systems", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Mechatronics Engineering', prereq: ['MEC381'] },
  { code: 'MEC495', name: "MMS/NMS Design", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Mechatronics Engineering', prereq: ['MEC381'] },
  { code: 'MEC496', name: "Mechatronics for Biomedical Engineering", hours: 2, level: 'L4', semester: 'Semester 2', category: 'Mechatronics Engineering', prereq: ['MEC381'] },
  { code: 'GEN001', name: "Introduction to Information and Communication Technology", hours: 2, level: 'L0', semester: 'Semester 1', category: 'University', prereq: [] },
  { code: 'GEN002', name: "English language (1)", hours: 2, level: 'L0', semester: 'Semester 1', category: 'University', prereq: [] },
  { code: 'GEN003', name: "Psychology and Organization Behavior", hours: 2, level: 'L0', semester: 'Unknown', category: 'University', prereq: [] },
  { code: 'GEN004', name: "Egyptian civilization", hours: 2, level: 'L0', semester: 'Unknown', category: 'University', prereq: [] },
  { code: 'GEN005', name: "Introduction to Music", hours: 2, level: 'L0', semester: 'Unknown', category: 'University', prereq: [] },
  { code: 'GEN005E', name: "Introduction to Law and Human Rights", hours: 2, level: 'L0', semester: 'Unknown', category: 'University', prereq: [] },
  { code: 'GEN006', name: "History of The Theatre", hours: 2, level: 'L0', semester: 'Unknown', category: 'University', prereq: [] },
  { code: 'GEN101', name: "English language (2)", hours: 2, level: 'L1', semester: 'Semester 1', category: 'University', prereq: ['GEN002'] },
  { code: 'GEN102', name: "Leadership, Team Approach and Communication Skills", hours: 2, level: 'L1', semester: 'Unknown', category: 'University', prereq: [] },
  { code: 'GEN103', name: "Professional Ethics", hours: 2, level: 'L1', semester: 'Unknown', category: 'University', prereq: [] },
  { code: 'GEN201', name: "Technical Report Writing I", hours: 2, level: 'L2', semester: 'Semester 1', category: 'University', prereq: ['GEN002'] },
  { code: 'GEN202', name: "Legislations, Contract and Procurement Management", hours: 2, level: 'L2', semester: 'Unknown', category: 'University', prereq: [] },
  { code: 'GEN203', name: "Human Resources Management", hours: 2, level: 'L2', semester: 'Unknown', category: 'University', prereq: [] },
  { code: 'GEN302', name: "General Risk Management", hours: 2, level: 'L3', semester: 'Unknown', category: 'University', prereq: [] },
  { code: 'GEN303', name: "History and Contemporary Issues of Arab Media", hours: 2, level: 'L3', semester: 'Unknown', category: 'University', prereq: [] },
  { code: 'GEN304', name: "An Introduction to Athletic Psychology", hours: 2, level: 'L3', semester: 'Unknown', category: 'University', prereq: [] },
  { code: 'GEN310', name: "Industrial safety and environmental management", hours: 2, level: 'L3', semester: 'Unknown', category: 'University', prereq: [] },
  { code: 'GEN401', name: "Marketing Skills", hours: 2, level: 'L4', semester: 'Unknown', category: 'University', prereq: [] },
  { code: 'GEN402', name: "Creativity and Critical Thinking", hours: 2, level: 'L4', semester: 'Unknown', category: 'University', prereq: [] },
  { code: 'GEN403', name: "Introduction to Economics", hours: 2, level: 'L4', semester: 'Unknown', category: 'University', prereq: [] },
  { code: 'GEN404', name: "Public Administration", hours: 2, level: 'L4', semester: 'Unknown', category: 'University', prereq: [] },
  { code: 'GEN505', name: "Quality Assurance", hours: 2, level: 'L4', semester: 'Unknown', category: 'University', prereq: [] },
];

export const GPA_CATEGORIES: Record<string, number> = {
  'Architectural Engineering': 4,
  'Basic Sciences': 3,
  'Civil Engineering': 4,
  'Communications Engineering': 4,
  'Mechatronics Engineering': 4,
  'University': 2,
};

export function normCode(code: string): string {
  return code.trim().replace(/\s+/g, '').toUpperCase();
}

export function getCourseByCode(code: string, bylawVersion?: BylawVersion): Course | undefined {
  const n = normCode(code);
  return getCourses(bylawVersion).find(c => normCode(c.code) === n);
}

export const ELECTIVE_PLACEHOLDERS: Record<string, string> = {
  'ARC2XX': 'ARC_Elective_1_3',
  'ARC3XX': 'ARC_Elective_2_3',
  'ARC4XX': 'ARC_Elective_3_4',
  'ARC400A': 'ARC_Graduation_Project_1',
  'ARC400B': 'ARC_Graduation_Project_2',
};

export const ELECTIVE_GROUPS = {
  UNIVERSITY_A: {
    label: 'University Elective - List A',
    requiredHours: 2,
    codes: ['GEN003', 'GEN004', 'GEN005', 'GEN005E', 'GEN006', 'GEN303', 'GEN304', 'GEN401', 'GEN402', 'GEN404', 'GEN505'],
  },
  UNIVERSITY_B: {
    label: 'University Elective - List B',
    requiredHours: 4,
    codes: ['GEN102', 'GEN103', 'GEN202', 'GEN203', 'GEN302', 'GEN310', 'GEN403'],
  },
  ECE_1: {
    label: 'ECE Elective - List 1',
    requiredHours: 2,
    codes: ['ECE312', 'ECE313', 'ECE314', 'ECE315'],
  },
  ECE_2: {
    label: 'ECE Elective - List 2',
    requiredHours: 2,
    codes: ['ECE316', 'ECE332', 'ECE333', 'ECE334'],
  },
  ECE_3: {
    label: 'ECE Elective - List 3',
    requiredHours: 2,
    codes: ['ECE444', 'ECE445', 'ECE446'],
  },
  ECE_4: {
    label: 'ECE Elective - List 4',
    requiredHours: 2,
    codes: ['ECE451', 'ECE452', 'ECE455'],
  },
  ECE_5: {
    label: 'ECE Elective - List 5',
    requiredHours: 2,
    codes: ['ECE447', 'ECE448', 'ECE449'],
  },
  MEC_1: {
    label: 'Mechatronics Elective - List 1',
    requiredHours: 2,
    codes: ['ECE312', 'ECE313', 'ECE314', 'ECE315', 'ECE317', 'ECE372'],
  },
  MEC_2: {
    label: 'Mechatronics Elective - List 2',
    requiredHours: 2,
    // The 2021 curriculum lists MEC369 while the prerequisite table also
    // references MEC364. Both official codes are retained as alternatives.
    codes: ['MEC364', 'MEC369', 'MEC372', 'MEC373', 'MEC374', 'MEC375', 'MEC376', 'MEC391'],
  },
  MEC_3: {
    label: 'Mechatronics Elective - List 3',
    requiredHours: 2,
    codes: ['MEC463', 'MEC464', 'MEC465', 'MEC466', 'MEC491'],
  },
  MEC_4: {
    label: 'Mechatronics Elective - List 4',
    requiredHours: 2,
    codes: ['ECE451', 'ECE481', 'ECE482', 'ECE483', 'ECE484', 'ECE485'],
  },
  MEC_5: {
    label: 'Mechatronics Elective - List 5',
    requiredHours: 2,
    codes: ['MEC466', 'MEC472', 'MEC482', 'MEC483', 'MEC484', 'MEC493', 'MEC494', 'MEC495', 'MEC496'],
  },
} as const;

export type ElectiveGroupId = keyof typeof ELECTIVE_GROUPS;

export interface ElectiveQuotaStatus {
  requiredHours: number;
  passedHours: number;
  plannedHours: number;
  remainingHours: number;
  allowed: boolean;
}

export function electiveQuotaStatus(
  groupId: ElectiveGroupId,
  passedHours: number,
  plannedHours: number,
  candidateHours = 0,
): ElectiveQuotaStatus {
  const requiredHours = ELECTIVE_GROUPS[groupId].requiredHours;
  const safePassedHours = Math.max(0, passedHours);
  const safePlannedHours = Math.max(0, plannedHours);
  const remainingHours = Math.max(
    0,
    requiredHours - safePassedHours - safePlannedHours,
  );

  return {
    requiredHours,
    passedHours: safePassedHours,
    plannedHours: safePlannedHours,
    remainingHours,
    allowed: candidateHours <= remainingHours,
  };
}

export interface ProgramRequirementGroup {
  id: string;
  label: string;
  requiredHours: number;
  codes: readonly string[];
  electiveGroupId?: ElectiveGroupId;
}

export type ProgramId = 'communications' | 'mechatronics' | 'civil' | 'architecture';

export const PROGRAM_LABELS: Record<ProgramId, string> = {
  communications: 'Electronics and Communications Engineering',
  mechatronics: 'Mechatronics Engineering',
  civil: 'Civil Engineering',
  architecture: 'Architectural Engineering',
};

export const PROGRAM_OPTIONS = (Object.keys(PROGRAM_LABELS) as ProgramId[]).map(
  value => ({ value, label: PROGRAM_LABELS[value] }),
);

export function programIdFromName(program?: string): ProgramId {
  const p = program?.toLowerCase() || '';
  if (p.includes('mechatronic')) return 'mechatronics';
  if (p.includes('civil')) return 'civil';
  if (p.includes('architect')) return 'architecture';
  return 'communications';
}

/**
 * Authoritative Electronics and Communications program-chart order.
 * Extracted from Delta University's ProgramChart_2607201157.pdf (20 July 2026).
 */
export const COMMUNICATIONS_PROGRAM_GROUPS = [
  {
    id: 'PREPARATORY',
    label: 'Preparatory Courses',
    requiredHours: 0,
    codes: ['BAS00E', 'BAS00M', 'BAS00P'],
  },
  {
    id: 'UNIVERSITY_COMPULSORY',
    label: 'University Requirements Compulsory',
    requiredHours: 8,
    codes: ['GEN001', 'GEN002', 'GEN101', 'GEN201'],
  },
  {
    id: 'UNIVERSITY_A',
    label: 'University Requirements-Elective (List A)',
    requiredHours: 2,
    codes: ['GEN003', 'GEN004', 'GEN005', 'GEN005E', 'GEN006', 'GEN303', 'GEN304', 'GEN401', 'GEN402', 'GEN404', 'GEN505'],
    electiveGroupId: 'UNIVERSITY_A',
  },
  {
    id: 'UNIVERSITY_B',
    label: 'University Requirements-Elective (List B)',
    requiredHours: 4,
    codes: ['GEN102', 'GEN103', 'GEN202', 'GEN203', 'GEN302', 'GEN310', 'GEN403'],
    electiveGroupId: 'UNIVERSITY_B',
  },
  {
    id: 'FACULTY',
    label: 'Faculty Requirements',
    requiredHours: 39,
    codes: ['BAS011', 'BAS012', 'BAS021', 'BAS022', 'BAS031', 'BAS111', 'BAS113', 'CIV280', 'ECE001', 'MEC021', 'MEC022', 'MEC051', 'MEC052', 'MEC151'],
  },
  {
    id: 'PROGRAM_GENERAL',
    label: "Program's General Requirements",
    requiredHours: 97,
    codes: [
      'BAS112', 'BAS211', 'ECE111', 'ECE112',
      'ECE113', 'ECE114', 'ECE115', 'ECE171',
      'ECE200', 'ECE211', 'ECE212', 'ECE221',
      'ECE222', 'ECE231', 'ECE241', 'ECE251',
      'ECE252', 'ECE300', 'ECE311', 'ECE331',
      'ECE341', 'ECE342', 'ECE343', 'ECE351',
      'ECE361', 'ECE400A', 'ECE400B', 'ECE411',
      'ECE431', 'ECE441', 'ECE442', 'ECE443',
    ],
  },
  {
    id: 'ECE_1',
    label: 'Elective Courses - List 1',
    requiredHours: 2,
    codes: ['ECE312', 'ECE313', 'ECE314', 'ECE315'],
    electiveGroupId: 'ECE_1',
  },
  {
    id: 'ECE_2',
    label: 'Elective Courses - List 2',
    requiredHours: 2,
    codes: ['ECE316', 'ECE332', 'ECE333', 'ECE334'],
    electiveGroupId: 'ECE_2',
  },
  {
    id: 'ECE_3',
    label: 'Elective Courses - List 3',
    requiredHours: 2,
    codes: ['ECE444', 'ECE445', 'ECE446'],
    electiveGroupId: 'ECE_3',
  },
  {
    id: 'ECE_4',
    label: 'Elective Courses - List 4',
    requiredHours: 2,
    codes: ['ECE451', 'ECE452', 'ECE455'],
    electiveGroupId: 'ECE_4',
  },
  {
    id: 'ECE_5',
    label: 'Elective Courses - List 5',
    requiredHours: 2,
    codes: ['ECE447', 'ECE448', 'ECE449'],
    electiveGroupId: 'ECE_5',
  },
] as const satisfies readonly ProgramRequirementGroup[];

/**
 * Authoritative Mechatronics program grouping from Part VII, pages 151-157
 * of Delta University's August 2021 Engineering Curricula.
 */
export const MECHATRONICS_PROGRAM_GROUPS = [
  {
    id: 'PREPARATORY',
    label: 'Preparatory Courses',
    requiredHours: 0,
    codes: ['BAS00E', 'BAS00M', 'BAS00P'],
  },
  {
    id: 'UNIVERSITY_COMPULSORY',
    label: 'University Requirements Compulsory',
    requiredHours: 8,
    codes: ['GEN001', 'GEN002', 'GEN101', 'GEN201'],
  },
  {
    id: 'UNIVERSITY_A',
    label: 'University Requirements-Elective (List A)',
    requiredHours: 2,
    codes: ['GEN003', 'GEN004', 'GEN005', 'GEN005E', 'GEN006', 'GEN303', 'GEN304', 'GEN401', 'GEN402', 'GEN404', 'GEN505'],
    electiveGroupId: 'UNIVERSITY_A',
  },
  {
    id: 'UNIVERSITY_B',
    label: 'University Requirements-Elective (List B)',
    requiredHours: 4,
    codes: ['GEN102', 'GEN103', 'GEN202', 'GEN203', 'GEN302', 'GEN310', 'GEN403'],
    electiveGroupId: 'UNIVERSITY_B',
  },
  {
    id: 'FACULTY',
    label: 'Faculty Requirements',
    requiredHours: 39,
    codes: ['BAS011', 'BAS012', 'BAS021', 'BAS022', 'BAS031', 'BAS111', 'BAS113', 'MEC021', 'MEC022', 'MEC051', 'MEC052', 'MEC151', 'CIV280', 'ECE001'],
  },
  {
    id: 'PROGRAM_GENERAL',
    label: "Program's General Requirements",
    requiredHours: 60,
    codes: [
      'ECE111', 'ECE112', 'MEC111', 'ECE113', 'MEC131', 'MEC141',
      'ECE114', 'ECE212', 'MEC213', 'MEC211', 'MEC221', 'MEC231',
      'ECE211', 'MEC222', 'ECE231', 'ECE252', 'MEC261', 'ECE351',
      'MEC365', 'MEC361', 'MEC321',
    ],
  },
  {
    id: 'PROGRAM_SPECIALIZED',
    label: "Program's Specialized Requirements",
    requiredHours: 37,
    codes: [
      'MEC355', 'MEC362', 'MEC354', 'MEC363', 'MEC371', 'MEC381',
      'MEC456', 'MEC453', 'MEC481', 'MEC485', 'MEC492',
      'MEC200', 'MEC300', 'MEC400A', 'MEC400B',
    ],
  },
  {
    id: 'MEC_1',
    label: 'Elective Courses - List 1',
    requiredHours: 2,
    codes: ELECTIVE_GROUPS.MEC_1.codes,
    electiveGroupId: 'MEC_1',
  },
  {
    id: 'MEC_2',
    label: 'Elective Courses - List 2',
    requiredHours: 2,
    codes: ELECTIVE_GROUPS.MEC_2.codes,
    electiveGroupId: 'MEC_2',
  },
  {
    id: 'MEC_3',
    label: 'Elective Courses - List 3',
    requiredHours: 2,
    codes: ELECTIVE_GROUPS.MEC_3.codes,
    electiveGroupId: 'MEC_3',
  },
  {
    id: 'MEC_4',
    label: 'Elective Courses - List 4',
    requiredHours: 2,
    codes: ELECTIVE_GROUPS.MEC_4.codes,
    electiveGroupId: 'MEC_4',
  },
  {
    id: 'MEC_5',
    label: 'Elective Courses - List 5',
    requiredHours: 2,
    codes: ELECTIVE_GROUPS.MEC_5.codes,
    electiveGroupId: 'MEC_5',
  },
] as const satisfies readonly ProgramRequirementGroup[];

export const CIVIL_PROGRAM_GROUPS = [
  { id: 'PREPARATORY', label: 'Preparatory Courses', requiredHours: 0, codes: ['BAS00E', 'BAS00M', 'BAS00P'] },
  { id: 'UNIVERSITY_COMPULSORY', label: 'University Requirements Compulsory', requiredHours: 8, codes: ['GEN001', 'GEN002', 'GEN101', 'GEN201'] },
  { id: 'UNIVERSITY_A', label: 'University Requirements-Elective (List A)', requiredHours: 2, codes: ['GEN003', 'GEN004', 'GEN005', 'GEN005E', 'GEN006', 'GEN303', 'GEN304', 'GEN401', 'GEN402', 'GEN404', 'GEN505'], electiveGroupId: 'UNIVERSITY_A' },
  { id: 'UNIVERSITY_B', label: 'University Requirements-Elective (List B)', requiredHours: 4, codes: ['GEN102', 'GEN103', 'GEN202', 'GEN203', 'GEN302', 'GEN310', 'GEN403'], electiveGroupId: 'UNIVERSITY_B' },
  { id: 'FACULTY', label: 'Faculty Requirements', requiredHours: 39, codes: ['BAS011', 'BAS012', 'BAS021', 'BAS022', 'BAS031', 'BAS111', 'BAS113', 'CIV280', 'ECE001', 'MEC021', 'MEC022', 'MEC051', 'MEC052', 'MEC151'] },
  {
    id: 'PROGRAM_GENERAL',
    label: 'Program Requirements Compulsory',
    requiredHours: 107,
    codes: [
      'CIV111', 'CIV112', 'CIV120', 'CIV121', 'CIV122', 'CIV131', 'CIV141', 'CIV142', 'CIV200', 'CIV210', 'CIV211', 'CIV221', 'CIV230', 'CIV231', 'CIV241', 'CIV251', 'CIV252', 'CIV261', 'CIV281', 'CIV291', 'CIV300', 'CIV331', 'CIV341', 'CIV342', 'CIV343', 'CIV350', 'CIV360', 'CIV361', 'CIV362', 'CIV371', 'CIV391', 'CIV400A', 'CIV400B', 'CIV411', 'CIV421', 'CIV431', 'CIV442', 'CIV443', 'CIV444', 'CIV445', 'CIV446', 'CIV447', 'CIV448', 'CIV449', 'CIV451', 'CIV461', 'CIV471', 'CIV472', 'CIV481', 'CIV491', 'CIV492', 'CIV493', 'CIV494', 'CIV495'
    ],
  },
] as const satisfies readonly ProgramRequirementGroup[];

export const ARCHITECTURE_PROGRAM_GROUPS = [
  { id: 'PREPARATORY', label: 'Preparatory Courses', requiredHours: 0, codes: ['BAS00E', 'BAS00M', 'BAS00P'] },
  { id: 'UNIVERSITY_COMPULSORY', label: 'University Requirements Compulsory', requiredHours: 8, codes: ['GEN001', 'GEN002', 'GEN101', 'GEN201'] },
  { id: 'UNIVERSITY_A', label: 'University Requirements-Elective (List A)', requiredHours: 2, codes: ['GEN003', 'GEN004', 'GEN005', 'GEN005E', 'GEN006', 'GEN303', 'GEN304', 'GEN401', 'GEN402', 'GEN404', 'GEN505'], electiveGroupId: 'UNIVERSITY_A' },
  { id: 'UNIVERSITY_B', label: 'University Requirements-Elective (List B)', requiredHours: 4, codes: ['GEN102', 'GEN103', 'GEN202', 'GEN203', 'GEN302', 'GEN310', 'GEN403'], electiveGroupId: 'UNIVERSITY_B' },
  { id: 'FACULTY', label: 'Faculty Requirements', requiredHours: 39, codes: ['BAS011', 'BAS012', 'BAS021', 'BAS022', 'BAS031', 'BAS111', 'BAS113', 'CIV280', 'ECE001', 'MEC021', 'MEC022', 'MEC051', 'MEC052', 'MEC151'] },
  {
    id: 'PROGRAM_GENERAL',
    label: 'Program Requirements Compulsory',
    requiredHours: 107,
    codes: [
      'ARC121', 'ARC122', 'ARC131', 'ARC132', 'ARC141', 'ARC142', 'ARC151', 'ARC152', 'ARC161', 'ARC200', 'ARC221', 'ARC222', 'ARC232', 'ARC241', 'ARC242', 'ARC243', 'ARC244', 'ARC245', 'ARC246', 'ARC247', 'ARC251', 'ARC261', 'ARC271', 'ARC281', 'ARC291', 'ARC300', 'ARC321', 'ARC322', 'ARC323', 'ARC331', 'ARC332', 'ARC351', 'ARC352', 'ARC353', 'ARC361', 'ARC371', 'ARC421', 'ARC431', 'ARC451', 'ARC452', 'ARC453', 'ARC455', 'ARC471', 'ARC481', 'ARC482', 'ARC483', 'ARC484', 'ARC485', 'ARC491', 'ARC492'
    ],
  },
] as const satisfies readonly ProgramRequirementGroup[];

export function programRequirementGroupsFor(
  program: ProgramId | string | undefined,
  bylawVersion?: BylawVersion
): readonly ProgramRequirementGroup[] {
  const p = programIdFromName(program);
  if (p === 'communications' && bylawVersion === 'Bylaw_2013') {
    return getProgramGroups('Bylaw_2013');
  }
  if (p === 'civil') return CIVIL_PROGRAM_GROUPS;
  if (p === 'architecture') return ARCHITECTURE_PROGRAM_GROUPS;
  return p === 'mechatronics'
    ? MECHATRONICS_PROGRAM_GROUPS
    : COMMUNICATIONS_PROGRAM_GROUPS;
}

export function electiveGroupIdsForProgram(
  program: ProgramId | string | undefined,
  bylawVersion?: BylawVersion
): ElectiveGroupId[] {
  return programRequirementGroupsFor(program, bylawVersion)
    .map(group => group.electiveGroupId)
    .filter((groupId): groupId is ElectiveGroupId => Boolean(groupId));
}

export function programRequirementGroupForCode(
  code: string,
  program?: ProgramId | string,
): ProgramRequirementGroup | null {
  const normalized = normCode(code);
  return programRequirementGroupsFor(program).find(group =>
    group.codes.some(candidate => normCode(candidate) === normalized)
  ) ?? null;
}

export function electiveGroupForCode(
  code: string,
  program?: ProgramId | string,
  bylawVersion?: BylawVersion
): ElectiveGroupId | null {
  const normalized = normCode(code);
  const allowedGroupIds = program
    ? new Set(electiveGroupIdsForProgram(program, bylawVersion))
    : null;
  for (const [groupId, group] of Object.entries(ELECTIVE_GROUPS)) {
    if (allowedGroupIds && !allowedGroupIds.has(groupId as ElectiveGroupId)) {
      continue;
    }
    if (group.codes.some(candidate => normCode(candidate) === normalized)) {
      return groupId as ElectiveGroupId;
    }
  }
  return null;
}

export function electiveListForCode(code: string): string | null {
  const n = normCode(code);
  for (const [placeholder, list] of Object.entries(ELECTIVE_PLACEHOLDERS)) {
    if (n === placeholder) return list;
  }
  return null;
}

export function satisfiedElectiveLists(
  passedCodes: Set<string>,
  program?: ProgramId | string,
  bylawVersion?: BylawVersion
): Set<string> {
  const satisfied = new Set<string>();
  const nPassed = new Set(Array.from(passedCodes).map(normCode));
  const electiveLists: Record<string, string[]> = {
    'ARC_Elective_1_3': ['ARC241', 'ARC242', 'ARC243', 'ARC244', 'ARC245', 'ARC246', 'ARC247'],
    'ARC_Elective_2_3': ['ARC311', 'ARC352', 'ARC353'],
    'ARC_Elective_3_4': ['ARC421', 'ARC431', 'ARC451', 'ARC455', 'ARC472', 'ARC482', 'ARC483', 'ARC484', 'ARC485', 'ARC491', 'ARC492'],
  };

  for (const [listName, courses] of Object.entries(electiveLists)) {
    if (courses.some(c => nPassed.has(normCode(c)))) {
      satisfied.add(listName);
    }
  }

  const groupEntries = program
    ? electiveGroupIdsForProgram(program, bylawVersion)
        .map(groupId => ({ groupId, group: getElectiveGroup(groupId, bylawVersion) }))
        .filter(entry => Boolean(entry.group)) as { groupId: string, group: { label: string, requiredHours: number, codes: readonly string[] } }[]
    : Object.entries(ELECTIVE_GROUPS).map(([groupId, group]) => ({ groupId, group }));
  const allocatedCodes = new Set<string>();

  for (const { groupId, group } of groupEntries) {
    let completedHours = 0;
    const usedCodes: string[] = [];
    for (const code of group.codes) {
      const normalized = normCode(code);
      if (!nPassed.has(normalized) || allocatedCodes.has(normalized)) continue;
      completedHours += getCourseByCode(code)?.hours ?? 0;
      usedCodes.push(normalized);
      if (completedHours >= group.requiredHours) break;
    }
    if (completedHours >= group.requiredHours) {
      satisfied.add(groupId);
      if (program) usedCodes.forEach(code => allocatedCodes.add(code));
    }
  }
  return satisfied;
}

export function missingPrereqs(course: Course, passedCodes: Set<string>): string[] {
  const nPassed = new Set(Array.from(passedCodes).map(normCode));
  return course.prereq.filter(p => !nPassed.has(normCode(p)));
}

export function coursesUnlockedBy(code: string, bylawVersion?: BylawVersion): string[] {
  const n = normCode(code);
  return getCourses(bylawVersion).filter(c => c.prereq.some(p => normCode(p) === n)).map(c => c.code);
}
