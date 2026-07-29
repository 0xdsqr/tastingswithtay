import { experimentsRouter } from "./routers/experiments"
import { galleryRouter } from "./routers/gallery"
import { recipesRouter } from "./routers/recipes"
import { siteRouter } from "./routers/site"
import { subscribersRouter } from "./routers/subscribers"
import { winesRouter } from "./routers/wines"
import { createTRPCRouter } from "./trpc"

export const appRouter = createTRPCRouter({
  recipes: recipesRouter,
  wines: winesRouter,
  experiments: experimentsRouter,
  gallery: galleryRouter,
  subscribers: subscribersRouter,
  site: siteRouter,
})

export type AppRouter = typeof appRouter
