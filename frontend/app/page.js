import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <main 
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed px-4 py-10 md:px-8 md:py-16"
      style={{ backgroundImage: "url('/fondo-medico.jpg')" }} // <--- EL ARCHIVO EN /PUBLIC
    >
      {/* SECCIÓN HERO PRINCIPAL CON GLASSMORPHISM */}
      <section className="mx-auto w-full max-w-7xl rounded-[3rem] border border-white/20 bg-white/85 backdrop-blur-xl p-8 shadow-[0_20px_50px_rgba(15,23,42,0.2)] md:p-16 border-t-8 border-t-emerald-500">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          
          {/* Columna Izquierda */}
          <div className="space-y-12">
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50/80 px-5 py-2 text-xs font-bold text-emerald-700 uppercase tracking-widest">
              Inteligencia Artificial Médica • Viamática 2026
            </span>

            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-red-500">✚</span>
                <p className="text-2xl font-black tracking-tighter text-slate-900">
                  VIACOPAGO
                </p>
              </div>

              <h1 className="max-w-2xl text-5xl font-black leading-[1.1] text-slate-900 md:text-7xl">
                Calcula tu{" "}
                <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 bg-clip-text italic text-transparent">
                  copago
                </span>{" "}
                en segundos
              </h1>

              <p className="max-w-xl text-xl leading-relaxed text-slate-700">
                Describe tus síntomas y obtén una estimación precisa de costos,
                especialidad sugerida y comparación de hospitales antes de salir de casa.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <Link
                href="/chat"
                className="rounded-2xl bg-amber-400 px-10 py-4 text-lg font-black text-slate-900 transition-all hover:bg-amber-500 hover:scale-105 shadow-[0_8px_0_0_rgba(217,119,6,1)] active:shadow-none active:translate-y-1"
              >
                Comenzar simulación →
              </Link>
            </div>
          </div>

          {/* Columna Derecha: Robot */}
          <div className="relative">
            <div className="relative mx-auto flex min-h-[550px] w-full max-w-[550px] items-center justify-center overflow-hidden rounded-[3rem] border-4 border-white/30 bg-emerald-500/90 shadow-2xl backdrop-blur-sm">
              <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 animate-pulse" />
              
              <div className="relative z-20 h-[500px] w-[500px] animate-float">
                <Image
                  src="/robot-mascota.png"
                  alt="Mascota ViaCopago"
                  fill
                  priority
                  className="object-contain"
                />
              </div>

              <div className="absolute bottom-10 left-1/2 z-30 w-[85%] -translate-x-1/2 rounded-[2rem] border border-white/40 bg-white/90 p-6 backdrop-blur-md shadow-xl">
                <div className="flex items-center justify-between text-slate-800">
                  <span className="text-lg font-bold">Copago estimado</span>
                  <span className="text-3xl font-black text-amber-500">$18.40</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN DE CARDS TAMBIÉN CON TRANSPARENCIA */}
      <section className="mx-auto mt-24 w-full max-w-7xl space-y-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          
          <article className="rounded-[2.8rem] border border-white/20 bg-white/80 backdrop-blur-lg p-12 shadow-xl transition-all hover:translate-y-[-5px]">
            <div className="mb-8 flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-3xl text-amber-500 shadow-inner">?</div>
              <h3 className="text-3xl font-black text-slate-900 leading-none">¿Qué resuelve?</h3>
            </div>
            <ul className="space-y-6 text-xl text-slate-700 font-medium">
              <li className="flex gap-4 items-center">
                <span className="h-3 w-3 rounded-full bg-amber-400"></span>
                <span>Incertidumbre sobre costos finales.</span>
              </li>
              <li className="flex gap-4 items-center">
                <span className="h-3 w-3 rounded-full bg-amber-400"></span>
                <span>Confusión sobre la especialidad.</span>
              </li>
            </ul>
          </article>

          <article className="rounded-[2.8rem] border border-white/20 bg-white/80 backdrop-blur-lg p-12 shadow-xl transition-all hover:translate-y-[-5px]">
            <div className="mb-8 flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-3xl text-emerald-600 shadow-inner">✓</div>
              <h3 className="text-3xl font-black text-slate-900 leading-none">¿Qué entrega?</h3>
            </div>
            <ul className="space-y-6 text-xl text-slate-700 font-medium">
              <li className="flex gap-4 items-center">
                <span className="text-emerald-600 font-black">✓</span>
                <span>Cálculo preciso de copago.</span>
              </li>
              <li className="flex gap-4 items-center">
                <span className="text-emerald-600 font-black">✓</span>
                <span>Ranking de hospitales cercanos.</span>
              </li>
            </ul>
          </article>
        </div>

        {/* FOOTER */}
        <footer className="mt-20 rounded-[3rem] border border-white/20 bg-white/90 backdrop-blur-md px-10 py-16 shadow-2xl md:px-16">
          <div className="grid grid-cols-1 gap-16 md:grid-cols-[1.5fr_1fr_1fr]">
            <div>
              <div className="mb-6 flex items-center gap-2">
                <span className="text-3xl font-black text-red-500">✚</span>
                <p className="text-4xl font-black tracking-tighter text-slate-900">VIACOPAGO</p>
              </div>
              <p className="max-w-md text-lg text-slate-600 leading-relaxed italic">
                "Decisiones inteligentes antes de tu consulta."
              </p>
            </div>
          </div>
        </footer>
      </section>
    </main>
  );
} 