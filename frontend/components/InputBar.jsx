export default function InputBar({
  value,
  onChange,
  onSubmit,
  loading
}) {
  const maxLength = 250;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex w-full flex-1 items-center gap-3 rounded-2xl border border-black/10 bg-white/90 px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-teal/40">
          <input
            type="text"
            className="w-full bg-transparent text-sm text-ink placeholder:text-ink/40 focus:outline-none"
            placeholder="Escribe un sintoma como dolor de pecho"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            disabled={loading}
            maxLength={maxLength}
          />
          <button
            type="submit"
            className="rounded-full bg-ink px-4 py-2 text-xs uppercase tracking-[0.2em] text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-ink/60"
            disabled={loading || !value.trim()}
          >
            {loading ? "Procesando" : "Enviar"}
          </button>
        </div>
        <p className="text-xs text-ink/50">Enter para enviar</p>
      </div>
      <p className="text-xs text-slate-400">{value.length}/{maxLength}</p>
    </form>
  );
}
