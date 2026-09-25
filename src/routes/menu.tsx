import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { categories, products, type Product } from "@/lib/menu";

export const Route = createFileRoute("/menu")({ component: MenuPage });

function MenuPage() {
  const [cat, setCat] = useState("Все");
  const [open, setOpen] = useState<Product | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [itemCounts, setItemCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    try {
      const cart = JSON.parse(localStorage.getItem("mazCart") || "[]");
      setCartCount(cart.reduce((sum: number, item: { qty: number }) => sum + item.qty, 0));
      setItemCounts(Object.fromEntries(cart.map((item: { id: number; qty: number }) => [item.id, item.qty])));
    } catch {}
  }, []);

  const add = (id: number) => {
    try {
      const cart = JSON.parse(localStorage.getItem("mazCart") || "[]");
      const found = cart.find((x: { id: number }) => Number(x.id) === id);
      const next = found
        ? cart.map((x: { id: number; qty: number }) =>
            Number(x.id) === id ? { ...x, id, qty: Number(x.qty || 0) + 1 } : x
          )
        : [...cart, { key: String(id), id, qty: 1, extra: 0, extras: [] }];
      localStorage.setItem("mazCart", JSON.stringify(next));
      const totalCount = next.reduce((sum: number, item: { qty: number }) => sum + item.qty, 0);
      setCartCount(totalCount);
      setItemCounts(Object.fromEntries(next.map((item: { id: number; qty: number }) => [item.id, item.qty])));
    } catch {}
  };

  const list = cat === "Все" ? products : products.filter((p) => p.cat === cat);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header cartCount={cartCount} />
      <main className="mx-auto max-w-6xl px-5 py-16">
        <p className="text-sm tracking-[0.3em] text-primary">НАШЕ МЕНЮ</p>
        <h1 className="font-display mt-2 text-6xl uppercase">Бургеры и любимые блюда.</h1>
        <p className="mt-5 max-w-2xl text-muted-foreground">Выбирайте любимые бургеры, комбо, закуски, напитки и десерты.</p>
        <div className="mt-8 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`rounded-full border px-4 py-2 text-sm ${cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`}>{c}</button>
          ))}
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <article key={p.id} onClick={() => setOpen(p)} className="group cursor-pointer overflow-hidden rounded-3xl border border-border bg-card">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={p.img} alt={p.name} loading="lazy" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=85"; }} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                {p.tag && <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">{p.tag}</span>}
              </div>
              <div className="p-5">
                <h2 className="font-display text-2xl uppercase">{p.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">₽{p.price}</span>
                  <div className="flex items-center gap-2">
                    {itemCounts[p.id] > 0 && (
                      <span className="min-w-8 rounded-full border border-primary/30 bg-primary/10 px-2 py-2 text-center text-sm font-bold text-primary" title="Количество в корзине">
                        ×{itemCounts[p.id]}
                      </span>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); add(p.id); }} className="rounded-full bg-secondary px-4 py-2 text-sm font-bold hover:bg-primary hover:text-primary-foreground">В корзину +</button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5" onClick={() => setOpen(null)}>
          <div className="max-w-lg overflow-hidden rounded-3xl border border-border bg-card" onClick={(e) => e.stopPropagation()}>
            <img src={open.img} alt={open.name} className="aspect-[4/3] w-full object-cover" />
            <div className="p-6">
              <h2 className="font-display text-3xl uppercase">{open.name}</h2>
              <p className="mt-3 text-muted-foreground">{open.desc}</p>
              <p className="mt-4 text-sm text-muted-foreground"><b>Ингредиенты:</b> {open.ingredients}</p>
              <div className="mt-6 flex items-center justify-between gap-4">
                <span className="text-2xl font-bold text-primary">₽{open.price}</span>
                <button onClick={() => { add(open.id); setOpen(null); }} className="rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground">Добавить в заказ +</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Header({ cartCount }: { cartCount: number }) {
  return <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
    <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
      <a href="/" className="font-display text-2xl">MAZ <span className="text-primary">BURGER</span></a>
      <nav className="hidden gap-7 text-sm text-muted-foreground md:flex">
        <a href="/menu" className="text-foreground">Меню</a><a href="/about">О нас</a><a href="/delivery">Доставка</a><a href="/contact">Контакты</a>
      </nav>
      <a href="/cart" className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground">Корзина</a>
    </div>
  </header>;
}
