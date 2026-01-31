import { collectionsRouter } from "./routers/collections"
import { commentsRouter } from "./routers/comments"
import { experimentsRouter } from "./routers/experiments"
import { favoritesRouter } from "./routers/favorites"
import { galleryRouter } from "./routers/gallery"
import { ratingsRouter } from "./routers/ratings"
import { recipesRouter } from "./routers/recipes"
import { subscribersRouter } from "./routers/subscribers"
import { tagsRouter } from "./routers/tags"
import { winesRouter } from "./routers/wines"
import { createTRPCRouter } from "./trpc"

export const appRouter = createTRPCRouter({
  recipes: recipesRouter,
  wines: winesRouter,
  experiments: experimentsRouter,
  gallery: galleryRouter,
  collections: collectionsRouter,
  tags: tagsRouter,
  subscribers: subscribersRouter,
  favorites: favoritesRouter,
  comments: commentsRouter,
  ratings: ratingsRouter,
})

export type AppRouter = typeof appRouter
