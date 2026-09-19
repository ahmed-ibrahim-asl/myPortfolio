import { publications, publicationSource, tutorials } from "@/data/portfolio";
import { PublicImage } from "@/components/PublicImage";

export function WorkResearchAndTeaching() {
  return <>
      <section id="publications" className="section section-ink research-record-section">
        <div className="shell research-feed">
          <div className="section-heading research-feed-heading">
            <div>
              <h2>Publications</h2>
              <p className="section-intro">
                Journal and conference papers from my Google Scholar profile,
                with publication type, ranking, year, and citation count.
              </p>
            </div>
            <a
              className="text-link"
              href={publicationSource.profileUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open Google Scholar
            </a>
          </div>
          <div className="publication-list">
            {publications.map((item, index) => (
              <article className="publication-record" key={item.id}>
                <div className="publication-record-index mono">
                  <span>PUBLICATION_{String(index + 1).padStart(2, "0")}</span>
                  <strong>{item.year}</strong>
                </div>
                <div className="publication-record-copy">
                  <div
                    className="publication-classification"
                    aria-label="Publication classification"
                  >
                    {item.ranking ? (
                      <span className="publication-ranking">{item.ranking}</span>
                    ) : null}
                    <span className="publication-type">
                      {item.publicationType || "Publication"}
                    </span>
                  </div>
                  <h3>
                    <a href={item.href} target="_blank" rel="noreferrer">
                      {item.title}
                    </a>
                  </h3>
                  <p className="publication-authors">{item.authors}</p>
                  <p className="publication-venue">{item.venue}</p>
                  <div className="tag-row dark">
                    {item.tags.map((tag) => (
                      <span className="tag" key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="publication-record-meta mono">
                  <span>
                    {item.citedBy} {item.citedBy === 1 ? "citation" : "citations"}
                  </span>
                  <a href={item.href} target="_blank" rel="noreferrer">
                    Open publication
                  </a>
                </div>
              </article>
            ))}
          </div>
          <p className="publication-sync-note">
            Each record links to the paper or its Google Scholar entry.
          </p>
        </div>
      </section>

      <section id="tutorials" className="section shell">
        <div className="section-heading">
          <div>
            <h2>Technical Tutorials &amp; Workshops</h2>
            <p className="section-intro">
              Recorded lessons and workshops on ROS, embedded systems, digital
              logic, Matlab, and networking.
            </p>
          </div>
        </div>
        <div className="tutorial-grid">
          {tutorials.map((tutorial) => (
            <a className="tutorial-card" href={tutorial.href} target="_blank" rel="noreferrer" key={tutorial.title}>
              <PublicImage src={tutorial.image} alt={`${tutorial.title} cover`} loading="lazy" sizes="(max-width: 760px) 100vw, 33vw" />
              <div>
                <div className="tag-row">
                  {tutorial.tags.map((tag) => (
                    <span className="tag" key={tag}>{tag}</span>
                  ))}
                </div>
                <h3>{tutorial.title}</h3>
                <p>{tutorial.description}</p>
                <span className="text-link">Watch session</span>
              </div>
            </a>
          ))}
        </div>
      </section>
  </>;
}
