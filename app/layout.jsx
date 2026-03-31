import ThemeRegistry from "./ThemeRegistry";

export const metadata = {
  title: "Sum-Up",
  description: "Turn your lecture transcripts into insightful summaries.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
