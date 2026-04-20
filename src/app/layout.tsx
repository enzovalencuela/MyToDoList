import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

const APP_URL = process.env.NEXTAUTH_URL || "https://nexgen-tasks.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#7c3aed" },
    { media: "(prefers-color-scheme: dark)", color: "#0f3460" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Nexgen Tasks - Gerenciador de Tarefas Inteligente",
    template: "%s | Nexgen Tasks",
  },
  description:
    "Organize suas tarefas com o Nexgen Tasks. Gerenciador moderno com prioridades, prazos, drag-and-drop, calendário e tema escuro. Gratuito, rápido e seguro.",
  keywords: [
    "gerenciador de tarefas",
    "to-do list",
    "organizar tarefas",
    "lista de tarefas",
    "produtividade",
    "nexgen tasks",
    "task manager",
    "tarefas online",
    "agenda de tarefas",
    "planejamento pessoal",
  ],
  authors: [{ name: "Nexgen" }],
  creator: "Nexgen",
  publisher: "Nexgen",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: APP_URL,
    siteName: "Nexgen Tasks",
    title: "Nexgen Tasks - Gerenciador de Tarefas Inteligente",
    description:
      "Organize suas tarefas com prioridades, prazos, drag-and-drop e calendário. Gratuito, rápido e seguro.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nexgen Tasks - Gerenciador de Tarefas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexgen Tasks - Gerenciador de Tarefas Inteligente",
    description:
      "Organize suas tarefas com prioridades, prazos, drag-and-drop e calendário. Gratuito e seguro.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/nexgen-logo-icon.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/nexgen-logo-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: APP_URL,
  },
  category: "productivity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-5TNK5D9FDK" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-5TNK5D9FDK');`,
          }}
        />

        {/* Google Search Console */}
        <meta name="google-site-verification" content="oK_JHebRSmKGBc-6v3wO2Jb7Cdgg7Cx9tesvePaZs2c" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Nexgen Tasks",
              description:
                "Gerenciador de tarefas moderno com prioridades, prazos, drag-and-drop, calendário e tema escuro.",
              url: APP_URL,
              applicationCategory: "ProductivityApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "BRL",
              },
              featureList: [
                "Gerenciamento de tarefas com drag-and-drop",
                "Prioridades (Urgente, Alta, Normal, Baixa)",
                "Calendário integrado com filtro por data",
                "Tema claro e escuro",
                "Login com Google ou email/senha",
                "Busca e filtros avançados",
              ],
              screenshot: `${APP_URL}/og-image.png`,
              inLanguage: "pt-BR",
            }),
          }}
        />
        {/* FAQ Structured Data for Help page discovery */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "Como criar uma tarefa no Nexgen Tasks?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Clique no botão \"+\" no canto inferior direito do dashboard e preencha título, descrição, prioridade e data de prazo.",
                  },
                },
                {
                  "@type": "Question",
                  name: "O Nexgen Tasks é gratuito?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Sim, o Nexgen Tasks é totalmente gratuito. Você pode criar uma conta com email/senha ou entrar com Google.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Como organizar tarefas por prioridade?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Use o botão 'Filtrar' no dashboard e selecione 'Prioridade'. Você também pode arrastar tarefas para reordená-las manualmente.",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
