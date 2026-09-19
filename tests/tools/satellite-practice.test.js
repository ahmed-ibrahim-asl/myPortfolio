import test from 'node:test';
import assert from 'node:assert/strict';
import {generateQuestion, gradeAnswer, createSession, scoreSession} from '../../lib/tools/satellite/practice.js';
import * as practice from '../../lib/tools/satellite/practice.js';

test('session review separates assisted answers and recommends the weakest topic',()=>{
  assert.equal(typeof practice.reviewSession,'function');
  const review=practice.reviewSession([
    {topic:'orbit',correct:true,hints:0,checks:1,elapsedSeconds:20},
    {topic:'noise',correct:true,hints:1,checks:3,elapsedSeconds:60},
    {topic:'noise',correct:false,hints:0,checks:2,elapsedSeconds:40},
  ]);
  assert.equal(review.checks,6);
  assert.equal(review.elapsedSeconds,120);
  assert.equal(review.topics.find(t=>t.topic==='noise').percent,37.5);
  assert.equal(review.recommendations[0].href,'/tools/satellite/noise-gt/');
});

test('question seeds normalize negative and fractional values without breaking theory sessions',()=>{
  for(const seed of [-9,2.5,Infinity]) {
    const rows=createSession('quiz','theory',seed);
    assert.equal(rows.length,5);
    assert.ok(rows.every(q=>q.prompt&&q.choices?.length));
  }
});
test('orbit questions are seeded, independently calculable and accept equivalent units',()=>{
  const q=generateQuestion('orbit',42);
  assert.deepEqual(generateQuestion('orbit',42),q);
  assert.equal(q.expected,6043.392550868946);
  assert.equal(gradeAnswer(q,'100.7232091811491','min').correct,true);
  assert.equal(gradeAnswer(q,'800','s').correct,false);
  assert.equal(gradeAnswer(q,'','s').correct,false);
});
test('SCPC questions count complete channels and reject fractional answers',()=>{
  const q=generateQuestion('scpc',42);
  assert.equal(q.expected,900);
  assert.equal(gradeAnswer(q,900,'channels').correct,true);
  assert.equal(gradeAnswer(q,900.3,'channels').correct,false);
});
test('quiz, midterm and final sessions contain unique seeded questions and scoring penalizes reveal',()=>{
  for(const mode of ['quiz','midterm','final']){const session=createSession(mode,'all',42);assert.ok(session.length>=5);assert.equal(new Set(session.map(q=>q.id)).size,session.length);}
  assert.deepEqual(scoreSession([{correct:true,hints:0},{correct:true,hints:2},{correct:true,revealed:true},{correct:false}]),{earned:1.5,possible:4,percent:37.5});
});
test('wrong unit families cannot pass and corrected noise answers are graded in dBm',()=>{
  const q=generateQuestion('noise',42);
  assert.ok(Math.abs(q.expected-(-99.05661319174502))<0.01);
  assert.equal(gradeAnswer(q,-129.06,'dBm').correct,false);
  assert.equal(gradeAnswer(q,-99.06,'dBm').correct,true);
  assert.equal(gradeAnswer(q,q.expected,'km').correct,false);
});

test('topic selection reaches conceptual modules instead of silently generating an orbit question',()=>{
  for(const topic of ['fundamentals','frequency-bands','subsystems','transponders','laboratory','doppler-delay']){
    const rows=createSession('quiz',topic,42);
    assert.ok(rows.every(q=>q.topic===topic),topic);
    assert.ok(rows.every(q=>q.prompt&&q.choices?.length),topic);
  }
});

test('numerical-only sessions contain no theory and theory-only sessions contain no calculations',()=>{
  assert.ok(createSession('final','all',42,'numerical').every(q=>!q.choices));
  assert.ok(createSession('final','all',42,'theory').every(q=>q.choices));
});

test('extended numerical practice checks dimensional answers and Doppler sign',()=>{
  const pfd=generateQuestion('pfd',42);
  assert.equal(pfd.topic,'pfd');
  assert.ok(Math.abs(pfd.expected-7.957747154594767e-9)<1e-18);
  assert.equal(gradeAnswer(pfd,0,'W/m²').correct,false);
  const doppler=generateQuestion('doppler',42);
  assert.equal(doppler.expected,-40000);
  assert.equal(gradeAnswer(doppler,-40,'kHz').correct,true);
  const nf=generateQuestion('noise-figure',42);
  assert.ok(Math.abs(nf.expected-3.01029995664)<1e-9);
});

test('every generated numerical family carries a concrete reviewed source',()=>{
  const topics=['orbit','eccentricity','fspl','antenna','noise','gt','scpc','tdma','link','pfd','received-power','noise-figure','doppler'];
  for(const topic of topics){
    const source=generateQuestion(topic,42).source;
    assert.ok(source?.file&&source.file!=='reference material',topic);
    assert.ok(Number.isInteger(source.page),topic);
  }
  const link=generateQuestion('link',42).source;
  assert.equal(link.file,'week 3/reference.pdf');
  assert.deepEqual(link.pages,[263,264,267,268]);
});

test('seeded exercises vary the required quantity without accepting zero for tiny powers',()=>{
  const expectedUnits={orbit:['s','m','m/s'],eccentricity:['dimensionless','m'],antenna:['dBi','m','m²','dimensionless','°'],noise:['dBm','W','dBW'],scpc:['channels','Hz'],tdma:['fraction','terminals','bit/s','channels']};
  for(const [topic,units] of Object.entries(expectedUnits)){
    const questions=Array.from({length:20},(_,i)=>generateQuestion(topic,43+i));
    for(const unit of units)assert.ok(questions.some(q=>q.unit===unit),`${topic} ${unit}`);
    assert.ok(questions.every(q=>Number.isFinite(q.expected)&&gradeAnswer(q,q.expected,q.unit).correct));
    for(const q of questions.filter(q=>q.unit==='W'))assert.equal(gradeAnswer(q,0,'W').correct,false);
  }
});
test('numerical-only mode rejects conceptual topics instead of silently returning theory',()=>{
  for(const topic of ['fundamentals','subsystems','theory'])
    assert.throws(()=>createSession('quiz',topic,42,'numerical'),/calculation topic/i);
  assert.ok(createSession('quiz','all',42,'numerical').every(q=>q.unit!=='choice'));
});

test('practice restoration rejects malformed sessions and recomputes feedback from the actual answer',()=>{
  assert.equal(typeof practice.restorePracticeSession,'function');
  const valid={version:2,mode:'topic',topic:'orbit',kind:'mixed',seed:42,index:0,attempts:[],answer:'800',unit:'s',feedback:{correct:true,message:'forged'}};
  assert.equal(practice.restorePracticeSession(JSON.stringify(valid)).feedback.correct,false);
  for(const payload of ['{',JSON.stringify({...valid,attempts:{}}),JSON.stringify({...valid,seconds:-2}),JSON.stringify({...valid,index:20}),JSON.stringify({...valid,topic:'unknown'})])assert.equal(practice.restorePracticeSession(payload),null);
});
