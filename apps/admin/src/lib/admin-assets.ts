import { createServerFn } from "@tanstack/react-start"
import { Schema } from "effect"
import { AdminAssets } from "../server/AdminAssets"
import { runAdminMutation, runAdminQuery } from "../server/run"
import { DeleteAssetInput, ListAssetsInput } from "../server/schemas"

export type { ManagedImageAsset } from "../server/AdminAssets"

export const listManagedAssets = createServerFn({ method: "GET" })
  .validator(Schema.toStandardSchemaV1(ListAssetsInput))
  .handler(({ data }) =>
    runAdminQuery(
      AdminAssets.use((assets) =>
        assets.list({
          folder: data?.folder ?? "all",
          limit: data?.limit ?? 60,
          cursor: data?.cursor,
        }),
      ),
    ),
  )

export const deleteManagedAsset = createServerFn({ method: "POST" })
  .validator(Schema.toStandardSchemaV1(DeleteAssetInput))
  .handler(({ data }) => runAdminMutation(AdminAssets.use((assets) => assets.delete(data.key))))
