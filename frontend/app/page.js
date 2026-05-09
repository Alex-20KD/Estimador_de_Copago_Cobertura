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

        {/* Main layout container with flex for desktop */}
        <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto w-full items-start">
          {/* Left column: Guide */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-8 bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white shadow-sm">
              <h2 className="text-2xl font-extrabold text-slate-800 mb-6">
                Cómo usar el estimador 💡
              </h2>

              {/* Steps list */}
              <div className="flex flex-col gap-6">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-700">
                      Describe tu síntoma
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      Escribe con lenguaje natural qué te duele o qué emergencia tienes.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-700">
                      La IA analiza tu caso
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      Nuestro modelo identifica la especialidad y el hospital ideal para ti.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-700">
                      Compara y elige
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      Haz clic en las tarjetas interactivas para ver el copago exacto según tu plan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: Chat */}
          <div className="w-full lg:w-2/3">
            <ChatBox />
          </div>
        </div>

        <p className="text-xs text-ink/60">
          Aviso: esta herramienta ofrece estimaciones y no reemplaza el
          diagnostico profesional.
        </p>
      </section>
    </main>
  );
}
