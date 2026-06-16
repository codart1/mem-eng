import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerRegister } from "@/components/service-worker-register";

// Runs before hydration so <html lang> reflects the stored/browser locale
// without a flash. Mirrors resolveLocale() in src/lib/i18n/config.ts.
const localeScript = `(function(){try{var l=null,s=localStorage.getItem("lexio-locale"),o=["en","vi"];if(s&&o.indexOf(s)>-1){l=s}else{var a=navigator.languages||[navigator.language||"en"];for(var i=0;i<a.length;i++){var b=(a[i]||"").toLowerCase().split("-")[0];if(o.indexOf(b)>-1){l=b;break}}}if(!l)l="en";var d=document.documentElement;d.lang=l;d.dataset.lexioLocale=l}catch(e){}})();`;

// Chrome can fire `beforeinstallprompt` before React mounts, so capture the
// event here and re-dispatch a custom event that the install button's hook
// (use-pwa-install) listens for. Without this, an early event would be missed
// and the install button wouldn't appear.
const installPromptScript = `(function(){window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();window.__lexioBIP=e;window.dispatchEvent(new Event("lexio-bip"))});})();`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
});

export const metadata: Metadata = {
  title: "Lexio — Learn English, one word at a time",
  description:
    "Offline-first English vocabulary trainer with spaced repetition (FSRS) and AI-assisted flashcards.",
  applicationName: "Lexio",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Lexio", statusBarStyle: "default" },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf6" },
    { media: "(prefers-color-scheme: dark)", color: "#13191f" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <script dangerouslySetInnerHTML={{ __html: localeScript }} />
        <script dangerouslySetInnerHTML={{ __html: installPromptScript }} />
        <Providers>
          {children}
          <Toaster richColors position="top-center" />
          <ServiceWorkerRegister />
        </Providers>
      </body>
    </html>
  );
}
