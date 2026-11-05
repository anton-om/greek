#!/usr/bin/env node
// Проверка words.js: дубликаты внутри набора, повторы между наборами,
// одиночные дополнительные слова, входящие в словосочетания. Правила: docs/adding-lessons.md
global.window={};require(require('path').join(__dirname,'..','words.js'));
var S=window.WORD_SETS,errors=0;
// Тема (поле t) обязательна и должна быть из window.TOPICS.
var TOPICS={};(window.TOPICS||[]).forEach(function(q){TOPICS[q[0]]=q[1];});
S.forEach(function(s){s.words.concat(s.extra||[]).forEach(function(w){if(!w.t||!TOPICS[w.t]){console.log('  ОШИБКА: '+s.id+' «'+w.gr+'»: нет темы или тема не из TOPICS: '+w.t);errors++;}});});
var strip=function(s){return s.toLowerCase().replace(/[;?!.,·…:«»"()]/g,' ').replace(/\s+/g,' ').trim();};
// Основное слово может повторяться в основной лексике другого урока (в наборе Custom дубли
// схлопываются); дополнительное слово не должно повторять ничего в других уроках.
var seen={};
S.forEach(function(s){
  var all=s.words.concat(s.extra||[]),keys=all.map(function(w){return w.gr.toLowerCase();});
  var dups=keys.filter(function(k,i){return keys.indexOf(k)!==i;});
  console.log(s.id+': основных '+s.words.length+', дополнительных '+(s.extra||[]).length);
  dups.forEach(function(d){console.log('  ОШИБКА: дубликат внутри набора: '+d);errors++;});
  keys.forEach(function(k,i){var x=i>=s.words.length;
    if(seen[k]&&(x||seen[k].x)){console.log('  ОШИБКА: '+k+' уже есть в '+seen[k].id+(x?' (дополнительное слово не повторяется)':' (там оно дополнительное: перенеси в основную лексику)'));errors++;}
    if(!seen[k])seen[k]={id:s.id,x:x};});
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
var tc={};S.forEach(function(s){s.words.concat(s.extra||[]).forEach(function(w){tc[w.t]=(tc[w.t]||0)+1;});});
console.log('Темы: '+Object.keys(TOPICS).map(function(k){return TOPICS[k]+' '+(tc[k]||0);}).join(', ')+'.');
// sentences.js: предложения режимов 9 и 10, по слову; ключ — слово из words.js, у каждого
// слова по 5 разных предложений с переводом.
require(require('path').join(__dirname,'..','sentences.js'));
var SN=window.SENTENCES||{},sn=0,noSent=0;
Object.keys(SN).forEach(function(k){
  if(!known[k]){console.log('  ОШИБКА: предложения для слова не из words.js: '+k);errors++;return;}
  var ss={};SN[k].forEach(function(x){sn++;var t=strip(x[0]||'');
    if(!x[0]||!x[1]){console.log('  ОШИБКА: «'+k+'»: предложение без текста или перевода');errors++;}
    if(ss[t]){console.log('  ОШИБКА: «'+k+'»: повтор предложения «'+x[0]+'»');errors++;}ss[t]=1;});
  if(SN[k].length!==5){console.log('  ОШИБКА: «'+k+'»: предложений '+SN[k].length+' вместо 5');errors++;}
});
Object.keys(known).forEach(function(k){if(!SN[k]){console.log('  ОШИБКА: нет предложений в sentences.js: '+k);noSent++;errors++;}});
console.log('Предложений: '+sn+', слов без предложений: '+noSent+'.');
console.log(errors?'Ошибок: '+errors:'Ошибок нет.');
process.exit(errors?1:0);
