import test from 'node:test';
import assert from 'node:assert/strict';
import katex from 'katex';
const course = () => import('../../data/satellite-course.js');

test('all sixteen course tools have substantive teaching content and valid cross-links', async () => {
  const { satelliteTools: tools, satelliteSources: sources } = await course();
  const slugs = ['fundamentals','frequency-bands','orbit','look-angles','subsystems','power-lifetime','transponders','antenna','rf-path','noise-gt','link-budget','doppler-delay','multiple-access','laboratory','practice','formula-sheet'];
  assert.deepEqual(tools.map(t => t.slug), slugs);
  assert.equal(new Set(tools.map(t => t.group)).size, 5);
  for (const t of tools) {
    assert.ok(t.title && t.summary && t.kind);
    assert.ok(t.topics.length >= 3 && t.lessons.length >= 2 && t.mistakes.length >= 2);
    assert.ok(t.related.length && t.related.every(s => slugs.includes(s) && s !== t.slug));
    for (const l of t.lessons) {
      assert.ok(l.title && l.text.length > 100);
      assert.ok(sources.some(s => s.file === l.source.file));
      assert.ok(Number.isInteger(l.source.page) && l.source.page > 0);
      if (l.formula) assert.ok(l.symbols && l.interpretation);
    }
  }
});

test('formula and glossary reference meet course breadth and define mathematical assumptions', async () => {
  const { satelliteFormulas: formulas, satelliteGlossary: glossary, satelliteTools: tools } = await course();
  assert.ok(formulas.length >= 40);
  assert.equal(new Set(formulas.map(f => f.id)).size, formulas.length);
  for (const f of formulas) {
    assert.ok(f.title && f.latex && f.symbols && f.assumptions);
    assert.ok(tools.some(t => t.slug === f.tool));
    // Catch corrupted backslashes / control characters and unbalanced TeX groups.
    assert.ok(!/[\u0000-\u001f]/.test(f.latex));
    assert.equal([...f.latex].filter(c => c === '{').length, [...f.latex].filter(c => c === '}').length);
    assert.doesNotThrow(() => katex.renderToString(f.latex, { throwOnError: true }));
  }
  const required = ['Active satellite','Passive satellite','Apogee','Perigee','Semi-major axis','Eccentricity','LEO','MEO','GEO','GSO','HEO','Subsatellite point','Azimuth','Elevation','Slant range','Space segment','Ground segment','Bus','Payload','AOCS','Attitude control','Orbital control','Station keeping','TT&C','Telemetry','Tracking','Command','Transponder','Frequency translation','Bent pipe','Regenerative transponder','LNA','LNC','LNB','DBS','MATV','CATV','EIRP','PFD','Effective aperture','Antenna gain','Beamwidth','Sidelobe','FSPL','Noise temperature','Noise factor','Noise figure','Noise bandwidth','G/T','C/N','C/N0','Eb/N0','Link margin','Uplink','Downlink','Composite link','FDMA','TDMA','CDMA','SCPC','Guard band','Preamble','Reference burst','Doppler','Propagation delay'];
  for (const term of required) assert.ok(glossary.some(g => g.term === term && g.definition.length > 15), term);
});

test('lesson equations render as TeX and laboratory lessons cover all thirteen experiments', async () => {
  const { satelliteTools: tools } = await course();
  for (const t of tools) for (const l of t.lessons) if (l.formula) {
    assert.doesNotThrow(() => katex.renderToString(l.formula, { throwOnError: true }));
  }
  const lessons = tools.find(t => t.slug === 'laboratory').lessons;
  for (let n = 1; n <= 13; n++) assert.ok(lessons.some(l => l.title.startsWith(`Experiment ${n} —`)));
});

test('theory bank supports all exam levels with sourced answers and explanations', async () => {
  const { satelliteTheoryQuestions: questions, satelliteSources: sources, satelliteTools: tools } = await course();
  assert.ok(questions.length >= 40);
  assert.equal(new Set(questions.map(q => q.id)).size, questions.length);
  for (const exam of ['quiz','midterm','final']) assert.ok(questions.filter(q => q.exam === exam).length >= 8);
  assert.ok(new Set(questions.map(q => q.topic)).size >= 12);
  for (const q of questions) {
    assert.ok(tools.some(t => t.slug === q.topic));
    assert.ok(q.prompt && q.choices.length >= 3 && new Set(q.choices).size === q.choices.length);
    assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.choices.length);
    assert.ok(q.explanation.length > 40);
    assert.ok(sources.some(s => s.file === q.source.file) || q.source.file === 'Lec6.pdf');
    assert.ok(Number.isInteger(q.source.page) && q.source.page > 0);
  }
});
