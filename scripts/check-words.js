#!/usr/bin/env node
// Проверка words.js: дубликаты внутри набора, повторы между наборами,
// одиночные дополнительные слова, входящие в словосочетания. Правила: docs/adding-lessons.md
global.window={};require(require('path').join(__dirname,'..','words.js'));
var S=window.WORD_SETS,errors=0;
var strip=function(s){return s.toLowerCase().replace(/[;?!.,·…:«»"()]/g,' ').replace(/\s+/g,' ').trim();};
var seen={};
S.forEach(function(s){
  var all=s.words.concat(s.extra||[]),keys=all.map(function(w){return w.gr.toLowerCase();});
  var dups=keys.filter(function(k,i){return keys.indexOf(k)!==i;});
  console.log(s.id+': основных '+s.words.length+', дополнительных '+(s.extra||[]).length);
  dups.forEach(function(d){console.log('  ОШИБКА: дубликат внутри набора: '+d);errors++;});
  keys.forEach(function(k){if(seen[k]){console.log('  ОШИБКА: '+k+' уже есть в '+seen[k]);errors++;}seen[k]=s.id;});
});
var phrases=[];
S.forEach(function(s){s.words.concat(s.extra||[]).forEach(function(w){var t=strip(w.gr);if(t.split(' ').length>1&&!/^(ο|η|το|οι|τα) [^ ]+$/.test(t))phrases.push({set:s.id,gr:w.gr,tokens:t.split(' ')});});});
S.forEach(function(s){(s.extra||[]).forEach(function(w){var t=strip(w.gr);if(t.split(' ').length!==1)return;phrases.forEach(function(p){if(p.tokens.indexOf(t)>=0){console.log('  ОШИБКА: '+s.id+' extra «'+w.gr+'» входит в «'+p.gr+'» ('+p.set+')');errors++;}});});});
// grammar.js: у каждого существительного есть запись plural (форма или null), у каждого
// однословного глагола — спряжение; лишних ключей нет.
require(require('path').join(__dirname,'..','grammar.js'));
var G=window.GRAMMAR,known={};
S.forEach(function(s){s.words.concat(s.extra||[]).forEach(function(w){known[w.gr]=1;
  if(w.pos==='n'&&!(w.gr in G.plural)){console.log('  ОШИБКА: нет plural в grammar.js: '+w.gr);errors++;}
  if(w.pos==='v'&&!/\s/.test(w.gr)&&!(w.gr in G.verbs)){console.log('  ОШИБКА: нет спряжения в grammar.js: '+w.gr);errors++;}
  if(w.pos==='v'&&G.verbs[w.gr]){var e=G.verbs[w.gr];if(!(e.ru&&e.ru.length===6)||!(e.f?e.f.length===6:/^(1|2a|2b)$/.test(e.c))){console.log('  ОШИБКА: неполная запись глагола: '+w.gr);errors++;}}
});});
Object.keys(G.plural).forEach(function(k){if(!known[k]){console.log('  ОШИБКА: plural для слова не из words.js: '+k);errors++;}});
Object.keys(G.verbs).forEach(function(k){if(!known[k]){console.log('  ОШИБКА: спряжение для слова не из words.js: '+k);errors++;}});
console.log('Существительных с мн. ч.: '+Object.keys(G.plural).filter(function(k){return G.plural[k];}).length+', глаголов со спряжением: '+Object.keys(G.verbs).length+'.');
console.log(errors?'Ошибок: '+errors:'Ошибок нет.');
process.exit(errors?1:0);
