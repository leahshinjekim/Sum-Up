import { SignIn } from "@clerk/nextjs";
import Typography from "@mui/material/Typography";

export default function SignInPage() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20, padding: 24 }}>
      <div style={{ textAlign: "center" }}>
        <Typography variant="h1">Welcome back</Typography>
        <Typography variant="body1">Sign in to continue studying with Sum-Up.</Typography>
      </div>
      <SignIn
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/"
        appearance={{ variables: { colorPrimary: "#bb2693", fontFamily: "DM Sans, sans-serif", borderRadius: "10px" } }}
      />
    </div>
  );
}
