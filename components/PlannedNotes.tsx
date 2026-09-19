import { plannedNotes } from "@/data/planned-notes";

export function PlannedNotes() {
  return (
    <section className="shell page-section planned-notes" aria-labelledby="planned-notes-title">
      <div className="section-heading writing-library-heading">
        <div>
          <p className="eyebrow">Editorial queue / evidence first</p>
          <h2 id="planned-notes-title">Planned field notes</h2>
          <p className="section-intro">Questions worth answering with calculations, project evidence, and reproducible tests. Cards become articles only after the answer is complete.</p>
        </div>
        <span className="series-count mono">{String(plannedNotes.length).padStart(2, "0")} PLANNED</span>
      </div>
      <div className="planned-notes-grid">
        {plannedNotes.map((note) => (
          <article className="planned-note-card" key={note.title}>
            <div className="planned-note-meta mono"><span>{note.topic}</span><span>Planned</span></div>
            <h3>{note.title}</h3>
            <p>{note.summary}</p>
            <dl>
              <div><dt>For</dt><dd>{note.audience}</dd></div>
              <div><dt>Evidence</dt><dd>{note.evidence}</dd></div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
