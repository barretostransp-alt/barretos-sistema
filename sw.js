// Service Worker — roda em segundo plano no navegador, independente da
// aba estar aberta. É essa a peça que recebe o push do sistema
// operacional e manda mostrar a notificação, mesmo com a aba fechada ou
// o computador bloqueado.

self.addEventListener('install', function (event) {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function (event) {
  var dados = {};
  try { dados = event.data ? event.data.json() : {}; } catch (e) {}

  var titulo = dados.title || "Barreto's";
  var opcoes = {
    body: dados.body || '',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    data: { url: dados.url || 'shell.html' },
    vibrate: [100, 50, 100],
  };

  event.waitUntil(self.registration.showNotification(titulo, opcoes));
});

// Ao clicar na notificação: se já tiver uma aba do sistema aberta, só foca
// nela; senão, abre uma nova.
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var relativo = (event.notification.data && event.notification.data.url) || 'shell.html';
  var urlAbsoluta = new URL(relativo, self.registration.scope).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (lista) {
      for (var i = 0; i < lista.length; i++) {
        var cliente = lista[i];
        if (cliente.url.indexOf('shell.html') !== -1 && 'focus' in cliente) {
          return cliente.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(urlAbsoluta);
    })
  );
});
