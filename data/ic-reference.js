export const icReferences = Object.freeze([
  {name:'LM358',family:'Dual op amp · 8-pin DIP/SOIC',pins:['1 OUT A','2 IN− A','3 IN+ A','4 V−','5 IN+ B','6 IN− B','7 OUT B','8 V+'],note:'Verify supply range, common-mode range, output swing, and bandwidth in the exact datasheet.'},
  {name:'TL072',family:'Dual JFET-input op amp · 8-pin package',pins:['1 OUT A','2 IN− A','3 IN+ A','4 V−','5 IN+ B','6 IN− B','7 OUT B','8 V+'],note:'High input impedance does not guarantee rail-to-rail input or output operation.'},
  {name:'LM741',family:'Single classic op amp · 8-pin PDIP, top view',pins:['1 OFFSET NULL','2 IN−','3 IN+','4 V−','5 OFFSET NULL','6 OUT','7 V+','8 NC'],note:'Internally compensated. Requires appropriate supply headroom; not a low-voltage or rail-to-rail default. Leave NC unconnected.'}
]);
