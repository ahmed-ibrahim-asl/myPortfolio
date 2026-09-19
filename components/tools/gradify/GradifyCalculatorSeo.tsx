import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/site";
import { personId } from "@/lib/seo";
import styles from "./GradifyWorkspace.module.css";

const url = absoluteUrl("/tools/gradify/calculator/");
const questions = [
  {
    question: "How is GPA calculated?",
    answer: "Multiply each course grade point by its credit hours, add those quality points, then divide by the total GPA credit hours.",
  },
  {
    question: "How is cumulative GPA calculated?",
    answer: "Combine the quality points and GPA credit hours from previous semesters with the current semester, then divide total quality points by total GPA credit hours.",
  },
  {
    question: "Can I use this calculator for every university?",
    answer: "Choose the closest listed grading scale and confirm it against your faculty regulations. Retakes, pass/fail courses, and exclusions can follow university-specific rules.",
  },
];

export function GradifyCalculatorSeo() {
  return <section className={styles.calculatorGuide} aria-labelledby="gpa-calculator-guide">
    <JsonLd data={{
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Engineering tools", item: absoluteUrl("/tools/") },
        { "@type": "ListItem", position: 3, name: "Gradify", item: absoluteUrl("/tools/gradify/") },
        { "@type": "ListItem", position: 4, name: "GPA & CGPA Calculator", item: url },
      ],
    }} />
    <JsonLd data={{
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "@id": `${url}#calculator`,
      url,
      name: "Free GPA & CGPA Calculator",
      description: "Calculate semester GPA and cumulative GPA from course grades and credit hours.",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Any modern web browser",
      isAccessibleForFree: true,
      author: { "@id": personId },
    }} />
    <JsonLd data={{
      "@context": "https://schema.org",
      "@type": "HowTo",
      "@id": `${url}#how-to-calculate-gpa`,
      name: "How to calculate GPA and CGPA",
      step: [
        { "@type": "HowToStep", position: 1, name: "Add courses", text: "Enter each course and its credit hours." },
        { "@type": "HowToStep", position: 2, name: "Select grades", text: "Choose the grade earned for every course." },
        { "@type": "HowToStep", position: 3, name: "Review GPA and CGPA", text: "Review semester GPA and add previous cumulative values when calculating CGPA." },
      ],
    }} />
    <JsonLd data={{
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: questions.map(item => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    }} />
    <p className={styles.eyebrow}>GPA calculation guide</p>
    <h2 id="gpa-calculator-guide">How to calculate GPA and cumulative GPA</h2>
    <p>GPA = total quality points ÷ total credit hours. Quality points are the grade-point value for a course multiplied by that course&apos;s credit hours.</p>
    <ol>
      <li>Add each course and its credit hours.</li>
      <li>Select the grade earned using your university&apos;s scale.</li>
      <li>For CGPA, add your previous GPA hours and cumulative GPA before reviewing the result.</li>
    </ol>
    <div className={styles.calculatorFaq}>
      {questions.map(item => <article key={item.question}><h3>{item.question}</h3><p>{item.answer}</p></article>)}
    </div>
    <p><strong>Important:</strong> Always confirm retake, pass/fail, withdrawal, and excluded-course rules with your university.</p>
  </section>;
}
