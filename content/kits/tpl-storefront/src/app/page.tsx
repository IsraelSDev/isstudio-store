import Link from "next/link";
import { formatPrice, products } from "@/lib/catalog";
import { AddToCartButton } from "@/components/add-to-cart-button";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Nova coleção</h1>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <li key={product.id} className="rounded-2xl border p-5">
            <Link href={`/produto/${product.slug}`} className="block">
              <h2 className="font-medium">{product.name}</h2>
              <p className="mt-1 text-sm text-neutral-500">
                {product.description}
              </p>
              <p className="mt-3 text-lg font-semibold tabular-nums">
                {formatPrice(product.price)}
              </p>
            </Link>
            <div className="mt-4">
              <AddToCartButton product={product} />
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}