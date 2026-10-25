"use client";

import { Show, SignInButton, SignOutButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

export default function AuthControls() {
  return (
    <Box
      sx={{
        position: "fixed",
        top: { xs: 12, sm: 20 },
        right: { xs: 12, sm: 20 },
        zIndex: (theme) => theme.zIndex.modal + 1,
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Show when="signed-out">
        <SignInButton mode="modal">
          <Button variant="outlined" color="primary" size="small">
            Sign in
          </Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button variant="contained" color="primary" size="small">
            Sign up
          </Button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <UserButton />
        <SignOutButton>
          <Button variant="outlined" color="primary" size="small">
            Sign out
          </Button>
        </SignOutButton>
      </Show>
    </Box>
  );
}
