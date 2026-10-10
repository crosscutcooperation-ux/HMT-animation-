import "../styles.css";

export const metadata = {
  title: "HMT — In Motion",
  description:
    "A scroll-driven HMT Greenfield film—from bare land to production readiness.",
};

export const viewport = {
  themeColor: "#090a09",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Manrope:wght@400;500;600&family=Newsreader:ital,opsz,wght@1,6..72,500;1,6..72,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
