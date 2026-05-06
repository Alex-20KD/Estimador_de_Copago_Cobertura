export default function MessageBubble({ role, content }) {
  const isUser = role === "user";

  return (
    <div className={`fade-up flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm md:text-base ${
          isUser
            ? "bg-ink text-white"
            : "border border-black/5 bg-white/90 text-ink"
        }`}
        style={{ whiteSpace: "pre-line" }}
      >
        {content}
      </div>
    </div>
  );
}
