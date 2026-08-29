"use client";

import React, { useState } from "react";
import { BayesStackLogo } from "@bayesstack/assets";
import {
  Button,
  Badge,
  Title,
  Text,
  Paper,
  Kanban,
  Modal,
  Spotlight,
  useToast,
  Icon,
  Avatar,
  type SpotlightActionItem,
  type KanbanColumnItem,
  type KanbanCardItem,
} from "@bayesstack/ui";

export default function FacultyPage() {
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const { showToast } = useToast();

  const sampleKanbanColumns: KanbanColumnItem[] = [
    { id: "drafting", title: "Curriculum Drafts", badgeColor: "info" },
    { id: "in_review", title: "In Peer Review", badgeColor: "warning" },
    { id: "published", title: "Published Modules", badgeColor: "success" },
  ];

  const [cards, setCards] = useState<KanbanCardItem[]>([
    { id: "card-1", columnId: "drafting", title: "Bayesian Statistics 101", tags: ["Draft", "Math"], assignees: [{ name: "Elena" }] },
    { id: "card-2", columnId: "drafting", title: "Neural Nets & Optimizers", tags: ["Review", "AI"], assignees: [{ name: "Sophia" }] },
    { id: "card-3", columnId: "in_review", title: "Quantum Computing Foundations", tags: ["Physics"], assignees: [{ name: "Marcus" }] },
    { id: "card-4", columnId: "published", title: "Distributed Systems Architecture", tags: ["CS"], assignees: [{ name: "Devon" }] },
    { id: "card-5", columnId: "published", title: "High-Performance C++ Kernels", tags: ["Systems"], assignees: [{ name: "Elena" }] },
  ]);

  const spotlightActions: SpotlightActionItem[] = [
    { id: "1", title: "Create New Course Syllabus", description: "Start drafting a new curriculum module", group: "Actions", icon: "Plus" },
    { id: "2", title: "Peer Review Queue", description: "3 modules waiting for faculty sign-off", group: "Workflows", icon: "FileCheck" },
    { id: "3", title: "Export Course Analytics", description: "Download CSV of student performance scores", group: "Reports", icon: "BarChart" },
  ];

  const handleAddModule = () => {
    if (!newTitle.trim()) return;
    const newCard: KanbanCardItem = {
      id: `card-${Date.now()}`,
      columnId: "drafting",
      title: newTitle,
      tags: ["New", "Draft"],
      assignees: [{ name: "Elena" }],
    };
    setCards((prev) => [...prev, newCard]);
    setNewTitle("");
    setModalOpen(false);
    showToast({
      title: "Module Added",
      message: `"${newTitle}" added to Curriculum Drafts pipeline.`,
      variant: "success",
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bs-canvas)" }}>
      {/* Faculty Header Navigation */}
      <header className="faculty-header">
        <div className="faculty-container faculty-header-inner">
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <BayesStackLogo variant="primary" style={{ height: "32px" }} />
            <span style={{ height: "20px", width: "1px", background: "#d7e8e4" }} />
            <Title as="h3" style={{ fontSize: "1.05rem", fontWeight: 700, color: "#123333" }}>
              Faculty Curriculum Authoring Studio
            </Title>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Icon name="Search" size={16} color="#0b6763" />}
              onClick={() => setSpotlightOpen(true)}
              style={{ background: "#ffffff" }}
            >
              Search <span style={{ opacity: 0.6, fontSize: "0.75rem", marginLeft: "0.5rem" }}>Cmd+K</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Icon name="Plus" size={16} />}
              onClick={() => setModalOpen(true)}
            >
              Add Module
            </Button>
            <Avatar name="Dr. Elena Rostova" color="#0b6763" size="sm" />
          </div>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="faculty-container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
        {/* Metric Summary Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
          <Paper className="faculty-stat-card">
            <Text size="sm" style={{ color: "#4a6360", marginBottom: "0.25rem" }}>Active Modules</Text>
            <Title as="h2" style={{ color: "#123333", fontSize: "1.75rem", fontWeight: 800 }}>12</Title>
            <Badge variant="subtle" size="sm" style={{ marginTop: "0.5rem" }}>+2 this semester</Badge>
          </Paper>

          <Paper className="faculty-stat-card">
            <Text size="sm" style={{ color: "#4a6360", marginBottom: "0.25rem" }}>Enrolled Learners</Text>
            <Title as="h2" style={{ color: "#123333", fontSize: "1.75rem", fontWeight: 800 }}>428</Title>
            <Badge variant="subtle" size="sm" style={{ marginTop: "0.5rem" }}>98% active retention</Badge>
          </Paper>

          <Paper className="faculty-stat-card">
            <Text size="sm" style={{ color: "#4a6360", marginBottom: "0.25rem" }}>Pending Peer Reviews</Text>
            <Title as="h2" style={{ color: "#0b6763", fontSize: "1.75rem", fontWeight: 800 }}>3</Title>
            <Badge variant="subtle" size="sm" style={{ marginTop: "0.5rem" }}>Requires sign-off</Badge>
          </Paper>

          <Paper className="faculty-stat-card">
            <Text size="sm" style={{ color: "#4a6360", marginBottom: "0.25rem" }}>Avg Assessment Score</Text>
            <Title as="h2" style={{ color: "#123333", fontSize: "1.75rem", fontWeight: 800 }}>94.2%</Title>
            <Badge variant="solid" size="sm" style={{ marginTop: "0.5rem" }}>Top 5% Cohort</Badge>
          </Paper>
        </div>

        {/* Curriculum Kanban Stage */}
        <Paper className="faculty-stat-card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <div>
              <Title as="h3" style={{ color: "#123333", fontSize: "1.25rem" }}>Course Syllabus Pipeline</Title>
              <Text size="sm" style={{ color: "#4a6360", marginTop: "0.25rem" }}>
                Organize and review active course development stages before publishing to student portals.
              </Text>
            </div>
            <Button size="sm" variant="secondary" leftIcon={<Icon name="Plus" size={14} />} onClick={() => setModalOpen(true)}>
              New Module
            </Button>
          </div>

          <Kanban columns={sampleKanbanColumns} cards={cards} />
        </Paper>
      </main>

      {/* Add Module Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Curriculum Module"
        size="md"
      >
        <div style={{ padding: "0.5rem 0" }}>
          <Text style={{ color: "#4a6360", marginBottom: "1rem" }}>
            Enter the module title to add it to the faculty drafting pipeline:
          </Text>
          <input
            type="text"
            placeholder="e.g. Monte Carlo Localization & Particle Filters"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "6px", border: "1px solid #d7e8e4", fontSize: "0.95rem", marginBottom: "1.5rem", outline: "none" }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
            <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleAddModule}>Create Module</Button>
          </div>
        </div>
      </Modal>

      {/* Spotlight Command Overlay */}
      <Spotlight
        open={spotlightOpen}
        onClose={() => setSpotlightOpen(false)}
        actions={spotlightActions}
        placeholder="Type to search authoring tools or course reviews..."
      />
    </div>
  );
}
