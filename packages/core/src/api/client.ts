import { FetchHttpClient, HttpClient, HttpClientRequest } from "effect/http"
import { HttpApiClient } from "effect/http-api"
import { Effect } from "effect"
import { Api } from "./Api"

export type ApiClient = HttpApiClient.ForApi<typeof Api>

/** A typed client for the public API. `baseUrl` is empty for same-origin browser calls. */
export const makeApiClient = (baseUrl: string): Effect.Effect<ApiClient> =>
  HttpApiClient.make(Api, {
    transformClient: HttpClient.mapRequest(HttpClientRequest.prependUrl(baseUrl)),
  }).pipe(Effect.provide(FetchHttpClient.layer))
