"use client";

import React, { useState } from "react";
import { BayesStackLogo } from "@bayesstack/assets";
import {
  Button,
  Badge,
  Title,
  Text,
  Paper,
  Tabs,
  VideoPlayer,
  Spotlight,
  useToast,
  Icon,
  Avatar,
  ChatMessage,
  CodeDisplay,
  type SpotlightActionItem,
} from "@bayesstack/ui";

import { useTenant } from "@bayesstack/tenant";

export default function LearnerPage() {
  const { tenant, isTenant } = useTenant();
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [completed, setCompleted] = useState(false);
  const { showToast } = useToast();


  const spotlightActions: SpotlightActionItem[] = [
    { id: "1", title: "Module 01: Probability Foundations", description: "Completed - Score 98%", group: "Curriculum", icon: "CheckCircle" },
    { id: "2", title: "Module 02: Prior & Posterior Distributions", description: "Completed - Score 95%", group: "Curriculum", icon: "CheckCircle" },
    { id: "3", title: "Module 03: Conjugate Priors & Likelihoods", description: "Completed - Score 92%", group: "Curriculum", icon: "CheckCircle" },
    { id: "4", title: "Module 04: MCMC Sampling & Gibbs Algorithms", description: "Active Lesson (In Progress)", group: "Curriculum", icon: "BookOpen" },
    { id: "5", title: "Module 05: Hierarchical Bayesian Models", description: "Upcoming Lesson", group: "Curriculum", icon: "Clock" },
  ];

  const handleMarkComplete = () => {
    setCompleted(true);
    showToast({
      title: "Module 04 Completed!",
      message: "Your progress has been synchronized with the institutional gradebook.",
      variant: "success",
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bs-canvas)" }}>
      {/* Learner Header Navigation */}
      <header className="learner-header">
        <div className="learner-container learner-header-inner">
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <BayesStackLogo variant="primary" style={{ height: "32px" }} />
            <span style={{ height: "20px", width: "1px", background: "#d7e8e4" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Title as="h3" style={{ fontSize: "1.05rem", fontWeight: 700, color: "#123333" }}>
                CS-402: Advanced Bayesian Inference
              </Title>
              <Badge variant="subtle" size="sm">
                Module 4 of 12
              </Badge>
              {isTenant && tenant && (
                <Badge variant="solid" size="sm">
                  {tenant.name}
                </Badge>
              )}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Icon name="Search" size={16} color="#0b6763" />}
              onClick={() => setSpotlightOpen(true)}
              style={{ background: "#ffffff" }}
            >
              Search Modules <span style={{ opacity: 0.6, fontSize: "0.75rem", marginLeft: "0.5rem" }}>Cmd+K</span>
            </Button>
            <Avatar name="Alex Vance" color="#0b6763" size="sm" />
          </div>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="learner-container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "1.75rem" }}>
          {/* Left Column: Video Lecture Player & Course Tabs */}
          <div>
            <div className="studio-card" style={{ overflow: "hidden", marginBottom: "1.5rem" }}>
              <VideoPlayer
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                title="Lesson 4.2: Metropolis-Hastings MCMC Sampling Algorithms"
                autoPlay={false}
              />
            </div>

            <Paper className="studio-card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  variant="line"
                  items={[
                    { value: "overview", label: "Lesson Overview", icon: <Icon name="BookOpen" size={16} /> },
                    { value: "code", label: "Interactive Python Code", icon: <Icon name="Code" size={16} /> },
                    { value: "resources", label: "Reading Notes", icon: <Icon name="File" size={16} /> },
                  ]}
                />

                <Button
                  variant={completed ? "secondary" : "primary"}
                  size="sm"
                  leftIcon={<Icon name={completed ? "CheckCircle" : "Sparkles"} size={16} />}
                  onClick={handleMarkComplete}
                >
                  {completed ? "Completed" : "Mark as Complete"}
                </Button>
              </div>

              {activeTab === "overview" && (
                <div>
                  <Title as="h4" style={{ color: "#123333", marginBottom: "0.5rem" }}>
                    About Markov Chain Monte Carlo (MCMC)
                  </Title>
                  <Text style={{ color: "#4a6360", lineHeight: 1.6, marginBottom: "1rem" }}>
                    Markov Chain Monte Carlo methods are a class of algorithms for sampling from a probability distribution. By constructing a Markov chain that has the desired distribution as its equilibrium distribution, one can obtain a sample of the desired distribution by observing the chain after a number of steps.
                  </Text>
                </div>
              )}

              {activeTab === "code" && (
                <div>
                  <Title as="h4" style={{ color: "#123333", marginBottom: "0.75rem" }}>
                    Metropolis-Hastings Python Implementation
                  </Title>
                  <CodeDisplay
                    code={`import numpy as np

def metropolis_hastings(target_pdf, proposal_sd, n_samples=10000):
    samples = np.zeros(n_samples)
    current = 0.0
    for i in range(n_samples):
        proposal = current + np.random.normal(0, proposal_sd)
        acceptance_ratio = min(1, target_pdf(proposal) / target_pdf(current))
        if np.random.rand() < acceptance_ratio:
            current = proposal
        samples[i] = current
    return samples`}
                    language="python"
                    filename="mcmc_sampler.py"
                  />
                </div>
              )}

              {activeTab === "resources" && (
                <div>
                  <Title as="h4" style={{ color: "#123333", marginBottom: "0.5rem" }}>
                    Required Reading Materials
                  </Title>
                  <Text style={{ color: "#4a6360", lineHeight: 1.6 }}>
                    • Gelman et al., <em>Bayesian Data Analysis (3rd Edition)</em> - Chapter 11: MCMC Computation.
                    <br />
                    • Bishop, <em>Pattern Recognition and Machine Learning</em> - Chapter 11: Sampling Methods.
                  </Text>
                </div>
              )}
            </Paper>
          </div>

          {/* Right Column: AI Assistant Chat Panel */}
          <div>
            <Paper className="studio-card" style={{ padding: "1.25rem", height: "100%", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", borderBottom: "1px solid #d7e8e4", paddingBottom: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "#e4f2ef", display: "flex", alignItems: "center", justifyContent: "center", color: "#0b6763" }}>
                    <Icon name="Sparkles" size={16} />
                  </div>
                  <Title as="h4" style={{ color: "#123333", fontSize: "1rem" }}>
                    Bayes AI Assistant
                  </Title>
                </div>
                <Badge variant="subtle" size="sm">Online</Badge>
              </div>

              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto", marginBottom: "1rem" }}>
                <ChatMessage
                  user={{ name: "Bayes AI Copilot" }}
                  content="Hi Alex! I'm tracking your progress in Module 4. Ask me any questions about MCMC sampling convergence or acceptance ratios."
                  timestamp="10:30 AM"
                />
                <ChatMessage
                  user={{ name: "Alex (Learner)" }}
                  content="Why does selecting a large proposal standard deviation slow down convergence?"
                  timestamp="10:32 AM"
                  isOwn
                />
                <ChatMessage
                  user={{ name: "Bayes AI Copilot" }}
                  content="Great question! A proposal SD that is too large causes proposed candidate points to land in low-probability density regions, leading to high rejection rates and stagnant state transitions."
                  timestamp="10:33 AM"
                />
              </div>

              <div style={{ borderTop: "1px solid #d7e8e4", paddingTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  placeholder="Ask Bayes AI a question..."
                  style={{ flex: 1, padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid #d7e8e4", outline: "none", fontSize: "0.875rem", fontFamily: "var(--bs-font-main)" }}
                />
                <Button variant="primary" size="sm" leftIcon={<Icon name="ArrowRight" size={14} />}>
                  Send
                </Button>
              </div>
            </Paper>
          </div>
        </div>
      </main>

      {/* Spotlight Command Overlay */}
      <Spotlight
        open={spotlightOpen}
        onClose={() => setSpotlightOpen(false)}
        actions={spotlightActions}
        placeholder="Type to search curriculum modules or course notes..."
      />
    </div>
  );
}
