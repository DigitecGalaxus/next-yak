import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  ),
});
