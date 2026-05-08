"use client";

import { useEffect, useRef, useState } from "react";
import InputBar from "./InputBar";
import MessageBubble from "./MessageBubble";

const planOptions = ["Basico", "Estandar", "Premium"];
const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

const starterMessages = [
  {
    role: "assistant",
    content:
      "Hola, soy tu agente estimador. Describe un sintoma y elegire la especialidad adecuada."
  }
];

const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2
});

function formatCopay(value) {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return currencyFormatter.format(value);
  }

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return "N/A";
}

async function parseError(response) {
  const data = await response.json().catch(() => null);
  if (data?.botReply) {
    return data.botReply;
  }
  if (data?.error) {
    return data.error;
  }

  return `HTTP ${response.status}`;
}

export default function ChatBox() {
  const [messages, setMessages] = useState(starterMessages);
  const [input, setInput] = useState("");
  const [plan, setPlan] = useState(planOptions[1]);
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const replaceLastMessage = ({ content, hospitalData = null }) => {
    setMessages((prev) => {
      if (prev.length === 0) {
        return prev;
      }

      const updated = [...prev];
      // Replace the "Pensando..." bubble with the final response.
      updated[updated.length - 1] = { role: "assistant", content, hospitalData };
      return updated;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      { role: "user", content: trimmed },
      { role: "assistant", content: "Pensando..." }
    ]);
    setInput("");
    setLoading(true);

    try {
      const analyzeResponse = await fetch(`${apiBaseUrl}/analyze-symptom`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({ symptom: trimmed, insurancePlan: plan })
      });

      if (!analyzeResponse.ok) {
        throw new Error(await parseError(analyzeResponse));
      }

      const analyzeData = await analyzeResponse.json();
      replaceLastMessage({
        content:
          typeof analyzeData?.botReply === "string" && analyzeData.botReply.trim()
            ? analyzeData.botReply.trim()
            : "No se pudo obtener una respuesta válida.",
        hospitalData: analyzeData?.hospitalData ?? null
      });
    } catch (error) {
      const message = error?.message
        ? `No se pudo completar la estimacion: ${error.message}`
        : "No se pudo completar la estimacion.";
      replaceLastMessage({ content: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/60 bg-white/70 shadow-glow backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 px-6 py-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.3em] text-ink/40">
            Consulta
          </p>
          <h2 className="text-lg font-semibold text-ink">
            Estimacion en tiempo real
          </h2>
        </div>
        <div className="rounded-full bg-ink px-4 py-2 text-xs uppercase tracking-[0.2em] text-white">
          Plan: {plan}
        </div>
      </div>

      <div
        className="max-h-[60vh] space-y-4 overflow-y-auto px-6 py-6"
        aria-live="polite"
      >
        {messages.map((message, index) => {
          const hospitalData =
            message.role === "assistant" && message.hospitalData
              ? message.hospitalData
              : null;

          return (
            <div key={`${message.role}-${index}`} className="space-y-3">
              <MessageBubble role={message.role} content={message.content} />
              {hospitalData ? (
                <div className="fade-up flex justify-start">
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5 w-full max-w-md">
                    <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {hospitalData.specialty ?? "N/A"}
                    </span>

                    <h3 className="text-xl font-extrabold text-slate-800 mt-3">
                      {hospitalData.hospital ?? "N/A"}
                    </h3>

                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                      <span aria-hidden="true">📍</span>
                      <span>{hospitalData.location ?? "N/A"}</span>
                    </p>

                    <div className="bg-slate-50 rounded-xl p-4 mt-4 border border-slate-100">
                      <p className="text-slate-400 line-through text-sm">
                        {formatCopay(hospitalData.original_price)}
                      </p>
                      <p className="text-4xl font-black text-emerald-500">
                        {formatCopay(hospitalData.you_pay)}
                      </p>
                      <p className="text-xs text-slate-500">
                        Tu copago con plan {plan}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="border-t border-black/5 px-6 py-5">
        <InputBar
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          loading={loading}
          plan={plan}
          onPlanChange={setPlan}
          planOptions={planOptions}
        />
      </div>
    </div>
  );
}
