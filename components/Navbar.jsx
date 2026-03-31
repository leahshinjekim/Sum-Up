"use client";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { usePathname, useRouter } from "next/navigation";

const navLinks = [
  { label: "Dashboard", href: "/" },
  { label: "+ New Summary", href: "/upload" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar
        sx={{
          maxWidth: 1200,
          width: "100%",
          mx: "auto",
          px: { xs: 2, sm: 4 },
          gap: 2,
        }}
      >
        {/* Logo */}
        <Box
          onClick={() => router.push("/")}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
            flexGrow: 0,
            mr: 4,
          }}
        >
          <img
            src="/logo.png"
            alt="Sum-Up logo"
            style={{ width: 160, height: 80, borderRadius: 10 }}
          />
        </Box>

        {/* Nav links */}
        <Box
          sx={{
            display: "flex",
            gap: 0.5,
            flexGrow: 1,
            justifyContent: "flex-end",
          }}
        >
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Button
                key={link.href}
                onClick={() => router.push(link.href)}
                sx={{
                  fontSize: "0.88rem",
                  fontWeight: active ? 700 : 500,
                  color: active ? "primary.main" : "text.disabled",
                  backgroundColor: active
                    ? "rgba(187,38,147,0.07)"
                    : "transparent",
                  borderRadius: "8px",
                  px: 1.5,
                  "&:hover": {
                    backgroundColor: "rgba(187,38,147,0.07)",
                    color: "primary.main",
                  },
                }}
              >
                {link.label}
              </Button>
            );
          })}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
