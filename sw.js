const VERSAO = 'refeitorio-v1';

const ARQUIVOS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];
self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(VERSAO).then((cache) => cache.addAll(ARQUIVOS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(
        nomes.filter((nome) => nome !== VERSAO).map((nome) => caches.delete(nome))
      )
    )
  );
  self.clients.claim();
});
self.addEventListener('fetch', (evento) => {
  if (evento.request.method !== 'GET') return;
  if (!evento.request.url.startsWith(self.location.origin)) return;

  evento.respondWith(
    fetch(evento.request)
      .then((resposta) => {
        const copia = resposta.clone();
        caches.open(VERSAO).then((cache) => cache.put(evento.request, copia));
        return resposta;
      })
      .catch(() => caches.match(evento.request))
  );
});// ===== PWA: convite de instalação (Android e computador) =====
let pedidoInstalacao = null;
const convite = document.querySelector('#convite');

window.addEventListener('beforeinstallprompt', (evento) => {
  evento.preventDefault();
  pedidoInstalacao = evento;
  convite.hidden = false;
});

document.querySelector('#botao-instalar').addEventListener('click', async () => {
  convite.hidden = true;
  if (!pedidoInstalacao) return;
  pedidoInstalacao.prompt();
  await pedidoInstalacao.userChoice;
  pedidoInstalacao = null;
});

document.querySelector('#botao-depois').addEventListener('click', () => {
  convite.hidden = true;
});

window.addEventListener('appinstalled', () => {
  convite.hidden = true;
  console.log('🎉 App instalado!');
});

// ===== PWA: aviso para iPhone e iPad =====
const ehIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const jaInstalado = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const avisoIOS = document.querySelector('#aviso-ios');

if (ehIOS && !jaInstalado) {
  avisoIOS.hidden = false;
}

document.querySelector('#botao-fechar-ios').addEventListener('click', () => {
  avisoIOS.hidden = true;
});