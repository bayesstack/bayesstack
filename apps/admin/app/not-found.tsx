"use client";

import React from "react";
import { Title, Text, Button, Paper } from "@bayesstack/ui";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bs-canvas)", padding: "2rem" }}>
      <Paper style={{ padding: "2.5rem", textAlign: "center", maxWidth: "480px", border: "1px solid #d7e8e4", borderRadius: "14px" }}>
        <Title as="h1" style={{ color: "#0b6763", fontSize: "3rem", marginBottom: "0.5rem" }}>404</Title>
        <Title as="h3" style={{ color: "#123333", marginBottom: "0.5rem" }}>Page Not Found</Title>
        <Text style={{ color: "#4a6360", marginBottom: "1.5rem" }}>
          The requested admin page or telemetry route does not exist.
        </Text>
        <Button variant="primary" size="md" onClick={() => window.location.href = "/"}>Return to Dashboard</Button>
      </Paper>
    </div>
  );
}
