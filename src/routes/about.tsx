import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({ component: AboutPage });

function AboutPage() {
  return <div className="min-h-screen bg-background text-foreground"><Header /><main className="mx-auto max-w-6xl px-5 py-20">
    <p className="text-sm tracking-[0.3em] text-primary">О НАС</p>
    <h1 className="font-display mt-2 text-6xl uppercase">Создано для любителей бургеров.</h1>
    <p className="mt-8 max-w-3xl text-lg leading-8 text-muted-foreground">MAZ BURGER создан с одной простой идеей: готовить бургеры, которые действительно хочется есть. Яркий вкус, качественные ингредиенты, свежеприготовленная еда и удобный заказ.</p>
    <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {[["Свежесть","Качественные ингредиенты, приготовленные свежими для каждого заказа."],["Яркий вкус","Насыщенные соусы, хрустящие текстуры и удовольствие в каждом кусочке."],["Быстро","От выбора в меню до самовывоза или доставки — быстро и удобно."],["Просто","Выберите блюда, проверьте заказ и отправьте его за считанные секунды."]].map(([t,d]) => <div key={t} className="rounded-3xl border border-border bg-card p-6"><h2 className="font-display text-2xl uppercase text-primary">{t}</h2><p className="mt-3 text-sm text-muted-foreground">{d}</p></div>)}
    </div>
  </main></div>;
}
function Header(){return <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4"><a href="/" className="font-display text-2xl">MAZ <span className="text-primary">BURGER</span></a><nav className="flex gap-5 text-sm text-muted-foreground"><a href="/menu">Меню</a><a href="/about" className="text-foreground">О нас</a><a href="/delivery">Доставка</a><a href="/contact">Контакты</a></nav></div></header>}
