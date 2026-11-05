/* Service worker: офлайн-работа приложения. Правила:
   - страница (переходы, index.html): сначала сеть, копия в кеш; без сети — из кеша;
   - файлы с того же сайта (words.js?v=…, sentences.js, grammar.js, иконки, манифест): сначала кеш,
     иначе сеть с сохранением в кеш; у файлов данных с номером сборки в адресе старые версии
     удаляются при появлении новой;
   - шрифты Google: из кеша с обновлением в фоне;
   - запросы проверки новой сборки (cache: no-store, параметр u) идут только в сеть.
   Номера сборки здесь нет: кеш наполняется при установке из текущего index.html и пополняется при
   каждой загрузке онлайн, поэтому при публикации этот файл менять не нужно. */
var CACHE='greek-words-v1';
var SHELL=['./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){
    return fetch('./index.html',{cache:'no-store'}).then(function(r){
      if(!r.ok)throw new Error('index '+r.status);
      return r.text().then(function(t){
        var files=[],re=/<script src="([^"]+\?v=[^"]+)"/g,m;while((m=re.exec(t)))files.push('./'+m[1]);
        return Promise.all([c.put('./index.html',new Response(t,{headers:{'content-type':'text/html; charset=utf-8'}}))]
          .concat(SHELL.concat(files).map(function(u){return c.add(u).catch(function(){});})));
      });
    }).catch(function(){});
  }).then(function(){return self.skipWaiting();}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));})
    .then(function(){return self.clients.claim();}));
});
self.addEventListener('fetch',function(e){
  var req=e.request;if(req.method!=='GET')return;
  var url=new URL(req.url);
  if(req.cache==='no-store'||url.searchParams.has('u'))return;
  var same=url.origin===self.location.origin;
  if(req.mode==='navigate'||(same&&/\/(index\.html)?$/.test(url.pathname))){
    /* Сеть, но не дольше 5 с (вайфай без интернета): иначе из кеша. */
    var timeout=new Promise(function(res){setTimeout(function(){res(null);},5000);});
    e.respondWith(Promise.race([fetch(req).then(function(r){
      if(r.ok){var copy=r.clone();caches.open(CACHE).then(function(c){c.put('./index.html',copy);});}
      return r;
    }).catch(function(){return null;}),timeout]).then(function(r){return r||caches.match('./index.html').then(function(hit){return hit||Response.error();});}));
    return;
  }
  if(same){
    e.respondWith(caches.match(req).then(function(hit){
      if(hit)return hit;
      return fetch(req).then(function(r){
        if(r.ok){var copy=r.clone();caches.open(CACHE).then(function(c){
          c.put(req,copy);
          if(url.searchParams.has('v'))c.keys().then(function(ks){ks.forEach(function(k){var ku=new URL(k.url);if(ku.pathname===url.pathname&&ku.search!==url.search)c.delete(k);});});
        });}
        return r;
      });
    }));
    return;
  }
  if(/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){
    e.respondWith(caches.open(CACHE).then(function(c){return c.match(req).then(function(hit){
      var net=fetch(req).then(function(r){if(r.ok||r.type==='opaque')c.put(req,r.clone());return r;}).catch(function(){return hit;});
      return hit||net;
    });}));
  }
});
