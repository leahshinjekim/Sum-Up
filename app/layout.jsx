import ThemeRegistry from "./ThemeRegistry";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Sum-Up",
  description: "Turn your lecture transcripts into insightful summaries.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          {/* <Navbar /> */}
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
