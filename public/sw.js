self.addEventListener("push", (event) => {
  let payload = {
    title: "Nexgen Tasks",
    body: "Voce tem um lembrete pendente.",
  };

  if (event.data) {
    try {
      payload = {
        ...payload,
        ...event.data.json(),
      };
    } catch {
      payload.body = event.data.text();
    }
  }

  const title = payload.title || "Nexgen Tasks";
  const options = {
    body: payload.body || "Confira suas tarefas no Nexgen Tasks.",
    icon: "/nexgen-logo-icon.png",
    badge: "/nexgen-logo-icon.png",
    data: {
      url: payload.url || "/dashboard",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const existingClient = clients.find((client) =>
          client.url.includes(targetUrl),
        );

        if (existingClient) {
          return existingClient.focus();
        }

        return self.clients.openWindow(targetUrl);
      }),
  );
});
