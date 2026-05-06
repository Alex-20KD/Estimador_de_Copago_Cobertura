import ChatBox from "../components/ChatBox";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-12">
      <div
        className="pointer-events-none absolute -top-24 left-[-10%] h-72 w-72 rounded-full bg-ember/30 blur-3xl float-slow"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-10 right-[-8%] h-64 w-64 rounded-full bg-teal/25 blur-3xl float-slow float-delay"
        aria-hidden="true"
      />

      <section className="relative mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-ink/50">
            Agente Estimador
          </p>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-ink md:text-5xl">
              Agente Estimador de Copago y Cobertura
            </h1>
            <p className="max-w-2xl text-base text-ink/70 md:text-lg">
              Escribe un sintoma y recibe la especialidad medica, el copago
              estimado y el hospital recomendado segun tu plan.
            </p>
          </div>
        </header>

        <ChatBox />

        <p className="text-xs text-ink/60">
          Aviso: esta herramienta ofrece estimaciones y no reemplaza el
          diagnostico profesional.
        </p>
      </section>
    </main>
  );
}
