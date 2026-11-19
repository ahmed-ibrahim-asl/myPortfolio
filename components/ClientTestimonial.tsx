import type { Testimonial } from "@/types/portfolio";
import { PublicImage } from "./PublicImage";
import styles from "./ClientTestimonial.module.css";

export function ClientTestimonial({ testimonial }: { testimonial: Testimonial }) {
  const rtl = testimonial.quoteLang === "ar";
  return <figure className={styles.testimonial}>
    <p className={styles.label}>Client review</p>
    <blockquote lang={testimonial.quoteLang} dir={rtl ? "rtl" : undefined} className={rtl ? styles.arabic : undefined}>
      <p>{testimonial.quote}</p>
    </blockquote>
    {testimonial.translation && <p className={styles.translation} lang="en">{testimonial.translation}</p>}
    <figcaption><strong>{testimonial.author}</strong>{testimonial.context && <span>{testimonial.context}</span>}</figcaption>
    {testimonial.proof && <details className={styles.proof}><summary>View original message</summary>
      <a href={testimonial.proof.src} target="_blank" rel="noreferrer"><PublicImage src={testimonial.proof.src} alt={testimonial.proof.alt} sizesPreset="testimonial-proof" loading="lazy" /></a>
    </details>}
  </figure>;
}
