import type { Product } from "../lib/data/products"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps): React.ReactElement {
  return (
    <a href={`/shop/${product.slug}`} className="group">
      <article>
        <div className="relative mb-4 aspect-square overflow-hidden rounded-lg bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {!product.inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60">
              <span className="text-sm font-medium text-foreground">
                Sold Out
              </span>
            </div>
          )}
          {product.compareAtPrice && product.inStock && (
            <div className="absolute left-4 top-4">
              <span className="inline-block rounded bg-accent px-2 py-1 text-xs font-medium text-accent-foreground">
                Sale
              </span>
            </div>
          )}
        </div>
        <h3 className="mb-1 font-medium text-foreground transition-colors group-hover:text-muted-foreground">
          {product.name}
        </h3>
        <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
          {product.description}
        </p>
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">${product.price}</span>
          {product.compareAtPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ${product.compareAtPrice}
            </span>
          )}
        </div>
      </article>
    </a>
  )
}
