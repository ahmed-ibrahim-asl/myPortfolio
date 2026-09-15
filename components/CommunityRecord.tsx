import { recognitions, volunteering } from "@/data/community";
import styles from "./CommunityRecord.module.css";

export function RecognitionRecord() {
  return <section className={`shell section ${styles.record}`} id="recognition" aria-labelledby="recognition-title">
    <div className="section-heading"><div><p className="eyebrow">Competition record</p><h2 id="recognition-title">Recognition earned as a team.</h2></div></div>
    {recognitions.map(item => <article className={styles.award} key={item.id} id={item.id}>
      <div className={styles.copy}>
        <p className={styles.result}>{item.result}</p>
        <h3>{item.title}</h3><p className="mono muted">{item.date}</p>
        <p><strong>{item.event}</strong></p><p>{item.description}</p>
        <p className={styles.credit}>{item.credit}</p>
        {item.links.map(link => <a className="text-link" key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label}</a>)}
      </div>
      <div>
        <a href={item.images[0].src} target="_blank" rel="noreferrer" className={styles.heroLink}>
          <img className={styles.hero} src={item.images[0].src} alt={item.images[0].alt} loading="lazy" />
        </a>
        <details className={styles.evidence}>
          <summary>View certificates and event photos ({item.images.length - 1})</summary>
          <div className={styles.gallery}>{item.images.slice(1).map(image => <a key={image.src} href={image.src} target="_blank" rel="noreferrer"><img src={image.src} alt={image.alt} loading="lazy" /><span>{image.alt}</span></a>)}</div>
        </details>
      </div>
    </article>)}
  </section>;
}

export function VolunteerRecord() {
  return <section className={`shell section ${styles.record}`} id="volunteering" aria-labelledby="volunteering-title">
    <div className="section-heading"><div><p className="eyebrow">Community / education</p><h2 id="volunteering-title">Building skills, together.</h2></div></div>
    {volunteering.map(item => <article className={styles.volunteer} key={item.role}>
      <div><p className="mono muted">{item.period}</p><h3>{item.role}</h3><p className={styles.organization}>{item.organization}</p></div>
      <div><p>{item.description}</p>{item.contributions.length > 0 && <ul>{item.contributions.map(point => <li key={point}>{point}</li>)}</ul>}
        <div className={styles.links}>{item.links.map(link => <a className="text-link" href={link.href} key={link.href} target="_blank" rel="noreferrer">{link.label}</a>)}</div>
      </div>
    </article>)}
  </section>;
}
