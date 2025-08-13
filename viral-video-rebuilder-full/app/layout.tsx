// app/layout.tsx
export const metadata = {
  title: 'Viral Video Rebuilder',
  description: 'Paste link → transcribe → rewrite → generate → render',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
        background: '#0b0c10',
        color: '#e5e7eb'
      }}>
        {children}
      </body>
    </html>
  );
}
