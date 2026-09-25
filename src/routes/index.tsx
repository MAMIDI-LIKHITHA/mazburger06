import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { categories, products, type Product } from "@/lib/menu";
import { ThreeDBurger } from "@/components/ThreeDBurger";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MAZ BURGER — Яркий вкус. Настоящие бургеры." },
      { name: "description", content: "Свежие сочные бургеры, комбо, картофель фри и десерты. Заказывайте онлайн через WhatsApp." },
      { property: "og:title", content: "MAZ BURGER — Яркий вкус. Настоящие бургеры." },
      { property: "og:description", content: "Свежие сочные бургеры для настоящего удовольствия. Закажите онлайн за считанные секунды." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "/images/maz-burger-hero.png" },
      { name: "twitter:image", content: "/images/maz-burger-hero.png" },
    ],
  }),
  component: Home,
});

type Line = { key: string; id: number; qty: number; extra: number; extras: string[] };
const EXTRAS = [
  { label: "Дополнительный сыр", price: 49 },
  { label: "Дополнительный соус", price: 29 },
];
const WHATSAPP = "79287901679";
const byId = (id: number) => products.find((p) => p.id === id)!;

function Home() {
  const [cat, setCat] = useState("Все");
  const [open, setOpen] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<Line[]>([]);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    try { setCart(JSON.parse(localStorage.getItem("mazCart") || "[]")); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setScrollY(window.scrollY));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  useEffect(() => { localStorage.setItem("mazCart", JSON.stringify(cart)); }, [cart]);

  const list = cat === "Все" ? products : products.filter((p) => p.cat === cat);
  const count = cart.reduce((a, x) => a + x.qty, 0);
  const total = cart.reduce((a, x) => a + (byId(x.id).price + x.extra) * x.qty, 0);

  const add = (id: number, qty = 1, extras: string[] = []) => {
    const extra = EXTRAS.filter((e) => extras.includes(e.label)).reduce((a, e) => a + e.price, 0);
    const key = `${id}-${extras.sort().join("|")}`;
    setCart((c) => {
      const f = c.find((x) => x.key === key);
      return f ? c.map((x) => (x.key === key ? { ...x, qty: x.qty + qty } : x)) : [...c, { key, id, qty, extra, extras }];
    });
  };
  const adjust = (key: string, n: number) =>
    setCart((c) => c.map((x) => (x.key === key ? { ...x, qty: x.qty + n } : x)).filter((x) => x.qty > 0));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="bg-primary py-2 text-center text-sm font-medium text-primary-foreground">
        Свежеприготовлено. Невероятно вкусно. <a href="#menu" className="underline">Смотреть меню →</a>
      </div>

      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a href="#top" className="flex items-center" aria-label="MAZ BURGER">
            <img
              src="/images/maz-burger-logo.svg"
              alt="MAZ BURGER"
              className="h-14 w-14 rounded-full object-contain"
            />
          </a>
          <nav className="hidden gap-7 text-sm text-muted-foreground md:flex">
            {[[ "Меню", "/menu" ], [ "О нас", "/about" ], [ "Доставка", "/delivery" ], [ "Контакты", "/contact" ]].map(([n, href]) => (
              <a key={n} href={href} className="hover:text-foreground">{n}</a>
            ))}
          </nav>
          <button onClick={() => setCartOpen(true)} className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground">
            Заказать · {count}
          </button>
        </div>
      </header>

      <section id="top" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-card" />
        <div className="absolute -right-24 top-16 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-[0.9fr_1.1fr] md:py-24">
          <div className="relative z-10">
            <p className="mb-4 text-sm tracking-[0.3em] text-primary">СВЕЖЕЕ • ВКУСНОЕ • С НАСТРОЕНИЕМ</p>
            <h1 className="font-display text-6xl uppercase leading-[0.95] md:text-8xl">Яркий вкус.<br />Настоящие бургеры.</h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">Свежие сочные бургеры для настоящего удовольствия.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#menu" className="rounded-full bg-primary px-7 py-3 font-bold text-primary-foreground">Посмотреть меню</a>
              <button onClick={() => setCartOpen(true)} className="rounded-full border border-border px-7 py-3 font-bold">Заказать ↗</button>
            </div>
          </div>

          <div className="relative flex min-h-[390px] items-center justify-center md:min-h-[560px]">
            <div className="pointer-events-none absolute h-72 w-72 rounded-full bg-primary/15 blur-3xl md:h-96 md:w-96" aria-hidden="true" />
            <ThreeDBurger scrollY={scrollY} />
          </div>
        </div>
      </section>

      <section id="menu" className="mx-auto max-w-6xl px-5 py-20">
        <p className="text-sm tracking-[0.3em] text-primary">НАШЕ МЕНЮ</p>
        <h2 className="font-display mt-2 text-5xl uppercase">То, ради чего хочется вернуться.</h2>
        <div className="mt-8 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`rounded-full border px-4 py-2 text-sm ${cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>
              {c}
            </button>
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
                <h3 className="font-display text-2xl uppercase">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">₽{p.price}</span>
                  <button onClick={(e) => { e.stopPropagation(); add(p.id); }} className="rounded-full bg-secondary px-4 py-2 text-sm font-bold hover:bg-primary hover:text-primary-foreground">
                    В корзину +
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="about" className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-2">
          <div>
            <p className="text-sm tracking-[0.3em] text-primary">О НАС</p>
            <h2 className="font-display mt-2 text-5xl uppercase">Создано для любителей бургеров.</h2>
            <p className="mt-5 text-muted-foreground">MAZ BURGER создан с одной простой идеей: готовить бургеры, которые действительно хочется есть. Яркий вкус, качественные ингредиенты, свежеприготовленная еда и удобный заказ.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[[ "Свежесть", "Качественные ингредиенты, приготовленные свежими для каждого заказа." ], [ "Яркий вкус", "Насыщенные соусы, хрустящие текстуры и удовольствие в каждом кусочке." ], [ "Быстро", "От выбора в меню до самовывоза или доставки — быстро и удобно." ], [ "Просто", "Выберите блюда, проверьте заказ и отправьте его за считанные секунды." ]].map(([t, d]) => (
              <div key={t} className="rounded-2xl border border-border p-5">
                <h3 className="font-display text-2xl uppercase text-primary">{t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="delivery" className="mx-auto max-w-6xl px-5 py-20">
        <p className="text-sm tracking-[0.3em] text-primary">ДОСТАВКА</p>
        <h2 className="font-display mt-2 text-5xl uppercase">Горячая еда прямо к вашей двери.</h2>
        <p className="mt-4 text-muted-foreground">Зоны доставки, время работы и минимальная сумма заказа будут указаны здесь.</p>
      </section>

      <footer id="contact" className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 px-5 py-14 md:flex-row">
          <div>
            <img
              src="/images/maz-burger-logo.svg"
              alt="MAZ BURGER"
              className="h-20 w-20 rounded-full object-contain"
            />
            <p className="mt-2 text-muted-foreground">Яркий вкус. Настоящие бургеры.</p>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Телефон · WhatsApp · Адрес · Часы работы</p>
            <p className="mt-2">© 2026 MAZ BURGER</p>
          </div>
        </div>
      </footer>

      {open && <ProductModal p={open} onЗакрыть={() => setOpen(null)} onAdd={(q, ex) => { add(open.id, q, ex); setOpen(null); setCartOpen(true); }} />}
      {cartOpen && <Cart cart={cart} total={total} adjust={adjust} onЗакрыть={() => setCartOpen(false)} onDone={() => setCart([])} />}
    </div>
  );
}

function ProductModal({ p, onЗакрыть, onAdd }: { p: Product; onЗакрыть: () => void; onAdd: (q: number, ex: string[]) => void }) {
  const [qty, setQty] = useState(1);
  const [ex, setEx] = useState<string[]>([]);
  const price = useMemo(() => (p.price + EXTRAS.filter((e) => ex.includes(e.label)).reduce((a, e) => a + e.price, 0)) * qty, [p, ex, qty]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4" onClick={onЗакрыть}>
      <div className="grid max-h-[90vh] w-full max-w-3xl overflow-auto rounded-3xl border border-border bg-card md:grid-cols-2" onClick={(e) => e.stopPropagation()}>
        <img src={p.img} alt={p.name} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=85"; }} className="h-64 w-full object-cover md:h-full" />
        <div className="p-6">
          <div className="flex justify-between"><p className="text-sm tracking-widest text-primary">{p.cat.toUpperCase()}</p><button onClick={onЗакрыть} aria-label="Закрыть" className="text-2xl">×</button></div>
          <h2 className="font-display text-4xl uppercase">{p.name}</h2>
          <p className="mt-2 text-muted-foreground">{p.desc}</p>
          <p className="mt-4 text-sm"><b>Ингредиенты</b><br /><span className="text-muted-foreground">{p.ingredients}</span></p>
          <div className="mt-5 space-y-2">
            {EXTRAS.map((e) => (
              <label key={e.label} className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="accent-[var(--primary)]" checked={ex.includes(e.label)}
                  onChange={() => setEx((s) => (s.includes(e.label) ? s.filter((x) => x !== e.label) : [...s, e.label]))} />
                {e.label} +₽{e.price}
              </label>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-4">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-10 w-10 rounded-full bg-secondary">−</button>
            <b>{qty}</b>
            <button onClick={() => setQty((q) => q + 1)} className="h-10 w-10 rounded-full bg-secondary">+</button>
          </div>
          <button onClick={() => onAdd(qty, ex)} className="mt-6 w-full rounded-full bg-primary py-3 font-bold text-primary-foreground">Добавить в заказ · ₽{price}</button>
        </div>
      </div>
    </div>
  );
}

function Cart({ cart, total, adjust, onЗакрыть, onDone }: { cart: Line[]; total: number; adjust: (k: string, n: number) => void; onЗакрыть: () => void; onDone: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState<"Доставка" | "Самовывоз">("Доставка");
  const [address, setAddress] = useState("");
  const [err, setErr] = useState("");

  const send = () => {
    if (!cart.length) return setErr("Ваш заказ пуст.");
    if (name.trim().length < 2) return setErr("Введите ваше имя.");
    if (!/^[0-9+ ]{7,15}$/.test(phone.trim())) return setErr("Введите корректный номер телефона.");
    if (method === "Доставка" && address.trim().length < 5) return setErr("Введите адрес доставки.");
    const lines = cart.map((x) => { const p = byId(x.id); return `• ${p.name}${x.extras.length ? ` (${x.extras.join(", ")})` : ""} × ${x.qty} — ₽${(p.price + x.extra) * x.qty}`; }).join("\n");
    const msg = `MAZ BURGER — НОВЫЙ ЗАКАЗ\n\nКлиент: ${name}\nТелефон: ${phone}\nСпособ получения: ${method}${method === "Доставка" ? `\nАдрес: ${address}` : ""}\n\n${lines}\n\nИтого: ₽${total}`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
    onDone();
    onЗакрыть();
  };

  const input = "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary";
  return (
    <div className="fixed inset-0 z-50 bg-background/70" onClick={onЗакрыть}>
      <aside className="ml-auto flex h-full w-full max-w-md flex-col border-l border-border bg-card" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="font-display text-3xl uppercase">Ваш заказ</h2>
          <button onClick={onЗакрыть} aria-label="Закрыть" className="text-2xl">×</button>
        </div>
        <div className="flex-1 space-y-4 overflow-auto p-5">
          {!cart.length && <p className="py-10 text-center text-muted-foreground">Ваша корзина пуста.<br />Добавьте что-нибудь действительно вкусное.</p>}
          {cart.map((x) => { const p = byId(x.id); return (
            <div key={x.key} className="flex gap-3">
              <img src={p.img} alt="" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=85"; }} className="h-16 w-16 rounded-xl object-cover" />
              <div className="flex-1">
                <b>{p.name}</b>
                {x.extras.length > 0 && <p className="text-xs text-muted-foreground">{x.extras.join(", ")}</p>}
                <p className="text-xs text-muted-foreground">₽{p.price + x.extra} за шт.</p>
                <div className="mt-1 flex items-center gap-3 text-sm">
                  <button onClick={() => adjust(x.key, -1)} className="h-7 w-7 rounded-full bg-secondary">−</button>{x.qty}
                  <button onClick={() => adjust(x.key, 1)} className="h-7 w-7 rounded-full bg-secondary">+</button>
                </div>
              </div>
            </div>
          ); })}
          {cart.length > 0 && (
            <div className="space-y-3 border-t border-border pt-5">
              <input className={input} placeholder="Ваше имя" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
              <input className={input} placeholder="Номер телефона" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={15} />
              <div className="grid grid-cols-2 gap-2">
                {([ "Доставка", "Самовывоз" ] as const).map((m) => (
                  <button key={m} onClick={() => setMethod(m)} className={`rounded-xl border py-2 text-sm ${method === m ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>{m}</button>
                ))}
              </div>
              {method === "Доставка" && <textarea className={input} placeholder="Адрес доставки" value={address} onChange={(e) => setAddress(e.target.value)} maxLength={200} />}
              {err && <p className="text-sm text-destructive">{err}</p>}
            </div>
          )}
        </div>
        <div className="border-t border-border p-5">
          <div className="mb-4 flex justify-between text-lg"><span>Итого</span><b className="text-primary">₽{total}</b></div>
          <button onClick={send} className="w-full rounded-full bg-primary py-3 font-bold text-primary-foreground">Отправить заказ в WhatsApp</button>
        </div>
      </aside>
    </div>
  );
}
