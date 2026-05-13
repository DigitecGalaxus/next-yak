import { HeadContent, Link, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "next-yak + TanStack Start" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <nav>
          <Link to="/">Home</Link>
          {" | "}
          <Link to="/server-component">Server Component</Link>
          {" | "}
          <Link to="/clock">Clock</Link>
        </nav>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
