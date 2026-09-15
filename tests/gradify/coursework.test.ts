import { describe, expect, it } from 'vitest';
import { calculateCoursework } from '../../lib/tools/gradify/coursework';

describe('assessment marks to course percentage', () => {
  it('weights unequal assessment maxima rather than averaging their percentages', () => {
    const result = calculateCoursework([{ id:'1',name:'Coursework',earned:'20',maximum:'30' },{ id:'2',name:'Final',earned:'60',maximum:'70' }]);
    expect(result.percent).toBe(80);
    expect(result.earned).toBe(80);
    expect(result.maximum).toBe(100);
  });
  it('accepts zero marks as a real result', () => {
    expect(calculateCoursework([{id:'1',name:'Quiz',earned:'0',maximum:'20'}]).percent).toBe(0);
  });
  it.each([['21','20'],['-1','20'],['','20'],['20','0'],['NaN','20']])('suppresses a percentage for invalid marks %s/%s', (earned,maximum) => {
    expect(calculateCoursework([{id:'1',name:'Quiz',earned,maximum}]).percent).toBeNull();
  });
});
