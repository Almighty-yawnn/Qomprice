import "./globals.css"; // Adjust path if needed

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Add this meta tag to prevent IE/Edge compatibility issues */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </head>
      <body className="h-full bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}



// import "./globals.css";

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en">
//       <body className="bg-background text-foreground">{children}</body>
//     </html>
//   );
// }
