import { BayesStackLogo, BRAND_COLORS } from "@bayesstack/assets";

export default function Home() {
  return (
    <main style={{ padding: "3rem", background: "#ffffff", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.5rem" }}>
        <BayesStackLogo variant="primary" style={{ height: "48px" }} />
      </div>
      <h1 style={{ color: BRAND_COLORS.primary.hex, marginTop: "0.5rem" }}>
        Welcome to BayesStack
      </h1>
      <p style={{ color: "#475569" }}>
        Learning infrastructure for modern institutions.
      </p>
    </main>
  );
}