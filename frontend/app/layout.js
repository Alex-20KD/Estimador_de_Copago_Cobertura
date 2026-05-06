import "./globals.css";
import { Space_Grotesk, Fraunces } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap"
});

export const metadata = {
  title: "Agente Estimador de Copago y Cobertura",
  description: "Chatbot para estimar copago y recomendar hospitales."
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${spaceGrotesk.variable} ${fraunces.variable}`}>
        {children}
      </body>
    </html>
  );
}
