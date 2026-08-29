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
  Table,
  Kanban,
  VideoPlayer,
  Spotlight,
  Modal,
  useToast,
  Icon,
  Avatar,
  AvatarsGroup,
  ChatMessage,
  CodeDisplay,
  type SpotlightActionItem,
  type KanbanColumnItem,
  type KanbanCardItem,
  type AvatarItem,
} from "@bayesstack/ui";

export default function Home() {
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("learner");
  const { showToast } = useToast();

  // Spotlight search items matching BayesStack Studio Suite
  const spotlightActions: SpotlightActionItem[] = [
    { id: "1", title: "Learner Experience Studio", description: "Interactive lectures, video player, and AI copilot", group: "Studios", icon: "BookOpen" },
    { id: "2", title: "Faculty Curriculum Studio", description: "Kanban pipeline, syllabus builder, and grading rubrics", group: "Studios", icon: "Pencil" },
    { id: "3", title: "Admin Telemetry Portal", description: "Institutional metrics, user management, and audit logs", group: "Studios", icon: "Database" },
    { id: "4", title: "SOC2 Security & Compliance", description: "Role-based access control and tenant isolation", group: "Security", icon: "ShieldCheck" },
    { id: "5", title: "AI Assistant Configuration", description: "LLM parameters, vector index, and prompt templates", group: "AI Tools", icon: "Sparkles" },
  ];

  // Table dataset for Admin Telemetry tab
  const sampleTableData = [
    { id: "USR-101", name: "Dr. Elena Rostova", role: "Faculty Lead", status: "Active", courses: 4, telemetry: "99.8%" },
    { id: "USR-102", name: "Marcus Vance", role: "Graduate Student", status: "Active", courses: 6, telemetry: "97.4%" },
    { id: "USR-103", name: "Sophia Chen", role: "Curriculum Admin", status: "Active", courses: 12, telemetry: "100%" },
    { id: "USR-104", name: "Devon Miller", role: "Research Associate", status: "Offline", courses: 2, telemetry: "94.1%" },
  ];

  const tableColumns = [
    { key: "id", header: "User ID", width: 110 },
    { key: "name", header: "Name", sortable: true },
    { key: "role", header: "System Role" },
    {
      key: "status",
      header: "Status",
      render: (val: string) => (
        <Badge variant={val === "Active" ? "solid" : "subtle"} size="sm">
          {val}
        </Badge>
      ),
    },
    { key: "courses", header: "Active Modules", align: "center" as const },
    { key: "telemetry", header: "Telemetry Score", align: "right" as const },
  ];

  // Kanban columns & cards for Faculty Curriculum tab
  const sampleKanbanColumns: KanbanColumnItem[] = [
    { id: "drafting", title: "Curriculum Drafts", badgeColor: "info" },
    { id: "in_review", title: "In Peer Review", badgeColor: "warning" },
    { id: "published", title: "Published Modules", badgeColor: "success" },
  ];

  const sampleKanbanCards: KanbanCardItem[] = [
    { id: "card-1", columnId: "drafting", title: "Bayesian Statistics 101", tags: ["Draft", "Math"], assignees: [{ name: "Elena" }] },
    { id: "card-2", columnId: "drafting", title: "Neural Nets & Optimizers", tags: ["Review", "AI"], assignees: [{ name: "Sophia" }] },
    { id: "card-3", columnId: "in_review", title: "Quantum Computing Foundations", tags: ["Physics"], assignees: [{ name: "Marcus" }] },
    { id: "card-4", columnId: "published", title: "Distributed Systems Architecture", tags: ["CS"], assignees: [{ name: "Devon" }] },
  ];

  const avatarGroupList: AvatarItem[] = [
    { name: "Elena Rostova", color: "#0b6763" },
    { name: "Marcus Vance", color: "#084c49" },
    { name: "Sophia Chen", color: "#14b8a6" },
    { name: "Devon Miller", color: "#2dd4bf" },
  ];

  const handleTestToast = () => {
    showToast({
      title: "Telemetry Event Logged",
      message: "Successfully synchronized interactive state across BayesStack network.",
      variant: "success",
    });
  };

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      {/* Soft Canvas Glow */}
      <div className="hero-glow-light" />

      {/* Navigation Header */}
      <header className="landing-header">
        <div className="landing-container landing-header-inner">
          <div style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <BayesStackLogo variant="primary" style={{ height: "36px" }} />
            </div>
            <nav className="landing-nav-links">
              <a href="#features" className="landing-nav-link">Capabilities</a>
              <a href="#showcase" className="landing-nav-link">Studio Suite</a>
              <a href="#sandbox" className="landing-nav-link">Architecture</a>
            </nav>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Icon name="Search" size={16} color="#0b6763" />}
              onClick={() => setSpotlightOpen(true)}
              style={{ color: "#123333", backgroundColor: "#ffffff" }}
            >
              Search <span style={{ opacity: 0.6, fontSize: "0.75rem", marginLeft: "0.5rem" }}>Cmd+K</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setModalOpen(true)}
            >
              Launch Studio Portal
            </Button>
          </div>
        </div>
      </header>

      <main className="landing-container" style={{ paddingTop: "4rem", paddingBottom: "6rem" }}>
        {/* HERO SECTION */}
        <section style={{ textAlign: "center", maxWidth: "880px", margin: "0 auto 5rem auto" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
            <Badge variant="subtle" size="md">
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "#0b6763", fontWeight: 600 }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#0b6763", display: "inline-block" }} />
                BayesStack UI v2.0 Enterprise Release
              </span>
            </Badge>
          </div>

          <Title as="h1" style={{ fontSize: "clamp(2.75rem, 5vw, 4.25rem)", fontWeight: 800, lineHeight: 1.15, marginBottom: "1.5rem", letterSpacing: "-0.03em", color: "#123333" }}>
            Institutional Infrastructure for <span className="brand-gradient-text">Modern Higher Education</span>
          </Title>

          <Text size="lg" style={{ color: "#4a6360", lineHeight: 1.6, marginBottom: "2.5rem", fontSize: "1.25rem", maxWidth: "760px", margin: "0 auto 2.5rem auto" }}>
            Unifying learner experiences, faculty curriculum studios, and real-time institutional telemetry in a single secure platform.
          </Text>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
            <Button
              variant="primary"
              size="lg"
              rightIcon={<Icon name="ArrowRight" size={18} />}
              onClick={() => setModalOpen(true)}
            >
              Launch Studio Portal
            </Button>
            <Button
              variant="secondary"
              size="lg"
              leftIcon={<Icon name="Sparkles" size={18} color="#0b6763" />}
              onClick={handleTestToast}
            >
              Test Telemetry Toast
            </Button>
          </div>

          {/* Social Proof Avatars */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginTop: "3rem" }}>
            <AvatarsGroup size="sm" avatars={avatarGroupList} />
            <Text size="sm" style={{ color: "#4a6360" }}>
              Trusted by <strong>50+ leading academic institutions</strong> worldwide
            </Text>
          </div>
        </section>

        {/* INTERACTIVE STUDIOS SHOWCASE SECTION */}
        <section id="showcase" style={{ marginBottom: "6rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <Text style={{ color: "#0b6763", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", fontSize: "0.85rem" }}>
              Interactive Studio Suite
            </Text>
            <Title as="h2" style={{ color: "#123333", marginTop: "0.5rem" }}>
              One Ecosystem. Three Specialized Experience Engines.
            </Title>
          </div>

          <div className="showcase-stage">
            <div style={{ marginBottom: "1.5rem", borderBottom: "1px solid #d7e8e4", paddingBottom: "1rem" }}>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                variant="pill"
                items={[
                  { value: "learner", label: "Learner Experience Engine", icon: <Icon name="BookOpen" size={16} /> },
                  { value: "faculty", label: "Faculty Curriculum Studio", icon: <Icon name="Pencil" size={16} /> },
                  { value: "admin", label: "Admin Telemetry & Data Grid", icon: <Icon name="Database" size={16} /> },
                ]}
              />
            </div>

            {/* TAB CONTENT 1: LEARNER EXPERIENCE */}
            {activeTab === "learner" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem" }}>
                <div>
                  <VideoPlayer
                    src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                    title="Module 04: Advanced Bayesian Inference & Markov Chains"
                    autoPlay={false}
                  />
                </div>
                <Paper style={{ background: "#ffffff", border: "1px solid #d7e8e4", padding: "1.25rem", borderRadius: "12px" }}>
                  <Title as="h4" style={{ color: "#123333", marginBottom: "1rem" }}>
                    AI Learning Copilot
                  </Title>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <ChatMessage
                      user={{ name: "Bayes Assistant" }}
                      content="In this lecture, notice how the posterior probability distribution converges over 500 iterations."
                      timestamp="10:42 AM"
                    />
                    <ChatMessage
                      user={{ name: "Alex (Learner)" }}
                      content="Does the MCMC sampling method guarantee convergence with high-dimensional data?"
                      timestamp="10:43 AM"
                      isOwn
                    />
                  </div>
                </Paper>
              </div>
            )}

            {/* TAB CONTENT 2: FACULTY CURRICULUM STUDIO */}
            {activeTab === "faculty" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <Text style={{ color: "#4a6360" }}>Drag & drop modules to organize active course pipelines:</Text>
                  <Button size="sm" variant="secondary" leftIcon={<Icon name="Plus" size={14} />}>Add Module</Button>
                </div>
                <Kanban columns={sampleKanbanColumns} cards={sampleKanbanCards} />
              </div>
            )}

            {/* TAB CONTENT 3: ADMIN TELEMETRY DATA GRID */}
            {activeTab === "admin" && (
              <div>
                <div style={{ marginBottom: "1rem" }}>
                  <Text style={{ color: "#4a6360" }}>Real-time user engagement and telemetry metrics:</Text>
                </div>
                <Table
                  data={sampleTableData}
                  columns={tableColumns}
                  selectable
                  hoverable
                  striped
                />
              </div>
            )}
          </div>
        </section>

        {/* PLATFORM CAPABILITIES GRID */}
        <section id="features" style={{ marginBottom: "6rem" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <Title as="h2" style={{ color: "#123333" }}>Architected for Enterprise Excellence</Title>
            <Text style={{ color: "#4a6360", maxWidth: "600px", margin: "0.5rem auto 0 auto" }}>
              Built from the ground up with strict type safety, modular tokens, and sub-millisecond interactivity.
            </Text>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
            <Paper className="bs-card-surface" style={{ padding: "2rem" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#e4f2ef", display: "flex", alignItems: "center", justifyContent: "center", color: "#0b6763", marginBottom: "1.25rem" }}>
                <Icon name="Sparkles" size={24} />
              </div>
              <Title as="h3" style={{ color: "#123333", fontSize: "1.25rem", marginBottom: "0.5rem" }}>
                AI Learning Copilots
              </Title>
              <Text style={{ color: "#4a6360", fontSize: "0.95rem", lineHeight: 1.6 }}>
                Context-aware tutoring assistants integrated directly alongside video content and code workspaces.
              </Text>
            </Paper>

            <Paper className="bs-card-surface" style={{ padding: "2rem" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#e4f2ef", display: "flex", alignItems: "center", justifyContent: "center", color: "#0b6763", marginBottom: "1.25rem" }}>
                <Icon name="Code" size={24} />
              </div>
              <Title as="h3" style={{ color: "#123333", fontSize: "1.25rem", marginBottom: "0.5rem" }}>
                Interactive Code Display
              </Title>
              <Text style={{ color: "#4a6360", fontSize: "0.95rem", lineHeight: 1.6 }}>
                Multi-language syntax highlighting with line numbering, copy triggers, and live execution widgets.
              </Text>
            </Paper>

            <Paper className="bs-card-surface" style={{ padding: "2rem" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#e4f2ef", display: "flex", alignItems: "center", justifyContent: "center", color: "#0b6763", marginBottom: "1.25rem" }}>
                <Icon name="BarChart" size={24} />
              </div>
              <Title as="h3" style={{ color: "#123333", fontSize: "1.25rem", marginBottom: "0.5rem" }}>
                Real-Time Telemetry
              </Title>
              <Text style={{ color: "#4a6360", fontSize: "0.95rem", lineHeight: 1.6 }}>
                Comprehensive analytics tracking student comprehension, video drop-offs, and assessment scores.
              </Text>
            </Paper>

            <Paper className="bs-card-surface" style={{ padding: "2rem" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#e4f2ef", display: "flex", alignItems: "center", justifyContent: "center", color: "#0b6763", marginBottom: "1.25rem" }}>
                <Icon name="ShieldCheck" size={24} />
              </div>
              <Title as="h3" style={{ color: "#123333", fontSize: "1.25rem", marginBottom: "0.5rem" }}>
                Enterprise Security
              </Title>
              <Text style={{ color: "#4a6360", fontSize: "0.95rem", lineHeight: 1.6 }}>
                Multi-tenant isolation, role-based permissions, SSO integration, and SOC2 compliance.
              </Text>
            </Paper>
          </div>
        </section>

        {/* CODE & UI SANDBOX SECTION */}
        <section id="sandbox" style={{ marginBottom: "6rem" }}>
          <Paper className="bs-card-surface" style={{ padding: "2.5rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem", alignItems: "center" }}>
              <div>
                <Badge variant="subtle" size="sm" style={{ marginBottom: "1rem" }}>Developer Integration</Badge>
                <Title as="h2" style={{ color: "#123333", marginBottom: "1rem" }}>
                  Native Next.js Component Integration
                </Title>
                <Text style={{ color: "#4a6360", marginBottom: "1.5rem", lineHeight: 1.6 }}>
                  Import `@bayesstack/ui` primitives directly inside Next.js App Router layouts and server components with zero configuration.
                </Text>
                <Button
                  variant="secondary"
                  size="md"
                  leftIcon={<Icon name="Terminal" size={16} color="#0b6763" />}
                  onClick={() => setSpotlightOpen(true)}
                >
                  Open Command Palette
                </Button>
              </div>

              <div>
                <CodeDisplay
                  code={`import { Button, Table, VideoPlayer } from "@bayesstack/ui";

export default function CourseStudio() {
  return (
    <main className="studio-container">
      <VideoPlayer src="/lessons/bayes-101.mp4" />
      <Table data={courseTelemetry} columns={cols} />
    </main>
  );
}`}
                  language="tsx"
                  filename="apps/learner/app/page.tsx"
                />
              </div>
            </div>
          </Paper>
        </section>
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #d7e8e4", background: "#ffffff", padding: "3rem 0" }}>
        <div className="landing-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <BayesStackLogo variant="primary" style={{ height: "28px" }} />
            <Text size="sm" style={{ color: "#4a6360" }}>
              © {new Date().getFullYear()} BayesStack Inc. All rights reserved.
            </Text>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <Badge variant="subtle" size="sm">
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "#0b6763", fontWeight: 600 }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0b6763" }} />
                All Systems Operational
              </span>
            </Badge>
          </div>
        </div>
      </footer>

      {/* SPOTLIGHT COMMAND PALETTE MODAL */}
      <Spotlight
        open={spotlightOpen}
        onClose={() => setSpotlightOpen(false)}
        actions={spotlightActions}
        placeholder="Type to search studio tools, courses, or settings..."
      />

      {/* SECURITY / DEMO MODAL */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title="BayesStack Studio Portal Access"
        size="md"
      >
        <div style={{ padding: "1rem 0" }}>
          <Text style={{ color: "#4a6360", marginBottom: "1.5rem" }}>
            Select which specialized studio environment you wish to launch:
          </Text>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
            <Paper style={{ padding: "1.25rem", background: "#ffffff", border: "1px solid #d7e8e4", borderRadius: "10px", cursor: "pointer" }} onClick={() => setModalOpen(false)}>
              <Title as="h4" style={{ color: "#0b6763", marginBottom: "0.25rem" }}>Learner Experience App</Title>
              <Text size="sm" style={{ color: "#4a6360" }}>Access course lectures, AI copilot, and quizzes.</Text>
            </Paper>

            <Paper style={{ padding: "1.25rem", background: "#ffffff", border: "1px solid #d7e8e4", borderRadius: "10px", cursor: "pointer" }} onClick={() => setModalOpen(false)}>
              <Title as="h4" style={{ color: "#0b6763", marginBottom: "0.25rem" }}>Faculty Studio App</Title>
              <Text size="sm" style={{ color: "#4a6360" }}>Manage curriculum Kanban pipelines and grading rubrics.</Text>
            </Paper>

            <Paper style={{ padding: "1.25rem", background: "#ffffff", border: "1px solid #d7e8e4", borderRadius: "10px", cursor: "pointer" }} onClick={() => setModalOpen(false)}>
              <Title as="h4" style={{ color: "#0b6763", marginBottom: "0.25rem" }}>Admin Portal App</Title>
              <Text size="sm" style={{ color: "#4a6360" }}>Inspect system user telemetry, table logs, and role security.</Text>
            </Paper>
          </div>
        </div>
      </Modal>
    </div>
  );
}