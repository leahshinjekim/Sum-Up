import { SignUp } from "@clerk/nextjs";
import Typography from "@mui/material/Typography";

export default function SignUpPage() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20, padding: 24 }}>
      <div style={{ textAlign: "center" }}>
        <Typography variant="h1">Create your account</Typography>
        <Typography variant="body1">Start turning lectures into study-ready summaries.</Typography>
      </div>
      <SignUp
        signInUrl="/sign-in"
        fallbackRedirectUrl="/"
        appearance={{ variables: { colorPrimary: "#bb2693", fontFamily: "DM Sans, sans-serif", borderRadius: "10px" } }}
      />
    </div>
  );
}
