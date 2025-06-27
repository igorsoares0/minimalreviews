import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  Link as RemixLink,
} from "@remix-run/react";
import { AppProvider } from "@shopify/polaris";
import polarisTranslations from "@shopify/polaris/locales/en.json";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LinkComponent = ({ children, url, ...rest }: any) => {
  return (
    <RemixLink to={url} {...rest}>
      {children}
    </RemixLink>
  );
};

export default function App() {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <Meta />
        <Links />
        {/* Polaris CSS */}
        <link rel="stylesheet" href={polarisStyles} />
      </head>
      <body>
        <AppProvider i18n={polarisTranslations} linkComponent={LinkComponent}>
        <Outlet />
        </AppProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
