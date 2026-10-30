import { resolve } from "node:path";
import { defineConfig } from "vite";

const pages = [
  "index.html",
  "login.html",
  "campus.html",
  "canteen.html",
  "my-orders.html",
  "canteen-staff.html",
  "clubs.html",
  "lost-found.html"
];

export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      input: Object.fromEntries(
        pages.map((page) => [page.replace(".html", ""), resolve(import.meta.dirname, page)])
      )
    }
  }
});
