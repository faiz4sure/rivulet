import { createBrowserRouter, RouterProvider } from "react-router";

const createAppRouter = () =>
  createBrowserRouter([
    {
      path: "/",
      lazy: () => import("@/app/routes/home"),
    },
    {
      path: "/welcome",
      lazy: () => import("@/app/routes/welcome"),
    },
    {
      path: "/movie",
      lazy: () => import("@/app/routes/movie"),
    },
    {
      path: "/search",
      lazy: () => import("@/app/routes/search"),
    },
    {
      path: "/player",
      lazy: () => import("@/app/routes/player"),
    },
    {
      path: "*",
      lazy: () => import("@/app/routes/not-found"),
    },
  ]);

export default function AppRouter() {
  return <RouterProvider router={createAppRouter()} />;
}
