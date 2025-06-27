/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  server: "./server.js",
  serverBuildPath: "build/server/index.js",
  serverModuleFormat: "esm",
  serverPlatform: "node",
  serverMinify: false,
  appDirectory: "app",
  assetsBuildDirectory: "build/client",
  publicPath: "/build/",
  future: {
    v3_fetcherPersist: true,
    v3_relativeSplatPath: true,
    v3_throwAbortReason: true,
    v3_lazyRouteDiscovery: true,
    v3_singleFetch: false,
    v3_routeConfig: true,
  }
}; 