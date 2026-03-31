import ThemeRegistry from "./ThemeRegistry";
import Navbar from "@/components/Navbar";

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
