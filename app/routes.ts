import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@remix-run/route-config";

export default [
  index("routes/_index/route.tsx"),
  route("auth/login", "routes/auth.login/route.tsx"),
  route("auth/*", "routes/auth.$.tsx"),

  ...prefix("app", [
    layout("routes/app.tsx", [
      index("routes/app._index.tsx"),
      route("additional", "routes/app.additional.tsx"),
      route("reviews", "routes/app.reviews.tsx"),
      route("settings", "routes/app.settings.tsx"),
      route("help", "routes/app.help.tsx"),
      route("add-review", "routes/app.add-review.tsx"),
      route("templates", "routes/app.templates.tsx"),
      route("api/reviews", "routes/api.reviews.tsx"),
    ]),
  ]),

  route("webhooks/app/scopes_update", "routes/webhooks.app.scopes_update.tsx"),
  route("webhooks/app/uninstalled", "routes/webhooks.app.uninstalled.tsx"),
  route("webhooks/orders/paid", "routes/webhooks.orders.paid.tsx"),
  route("webhooks/orders/fulfilled", "routes/webhooks.orders.fulfilled.tsx"),

  // API Routes
  route("app/api/products", "routes/app.api.products.tsx"),
  route("api/config", "routes/api.config.tsx"),
  route("api/validate-invitation", "routes/api.validate-invitation.tsx"),
  route("api/mark-responded", "routes/api.mark-responded.tsx"),
  route("api/sync-reviews", "routes/api.sync-reviews.tsx"),
  route("api/add-test-review", "routes/api.add-test-review.tsx"),
  route("api/test-webhook", "routes/api.test-webhook.tsx"),
  route("api/process-emails", "routes/api.process-emails.tsx"),
  route("api/debug", "routes/api.debug.tsx"),

  // Rota do App Proxy - consome reviews do backend externo
  route("apps/minimalreviews/api/reviews", "routes/api.proxy.reviews.tsx"),
] satisfies RouteConfig;
