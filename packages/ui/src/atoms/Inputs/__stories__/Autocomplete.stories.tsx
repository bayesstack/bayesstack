import React, { useState, useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Autocomplete, type AutocompleteItem } from "../Autocomplete";
import { Avatar } from "../../Badges/Avatar";
import { Badge } from "../../Badges/Badge";
import { Chip } from "../../Badges/Chip";

const SAMPLE_LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Go",
  "Rust",
  "Java",
  "C++",
  "C#",
  "Ruby",
  "Swift",
  "Kotlin",
  "PHP",
  "SQL",
  "GraphQL",
];

const SAMPLE_COURSES: AutocompleteItem[] = [
  {
    value: "CS101",
    label: "CS101: Introduction to Computer Science",
    description: "Foundational algorithms, complexity, and basic data structures",
    icon: "BookOpen",
    group: "Foundations",
  },
  {
    value: "CS201",
    label: "CS201: Advanced Data Structures & Algorithms",
    description: "Trees, graphs, dynamic programming, and algorithm proofs",
    icon: "CodeFolder",
    group: "Foundations",
  },
  {
    value: "AI301",
    label: "AI301: Deep Learning & Neural Networks",
    description: "Backpropagation, PyTorch architectures, transformers, and CNNs",
    icon: "AiBrain",
    group: "Artificial Intelligence",
  },
  {
    value: "AI302",
    label: "AI302: Generative AI & Large Language Models",
    description: "Prompt tuning, RLHF, attention mechanisms, and RAG pipelines",
    icon: "Sparkles",
    group: "Artificial Intelligence",
  },
  {
    value: "DS201",
    label: "DS201: Bayesian Statistical Inference",
    description: "Prior/posterior analysis, MCMC, probabilistic programming",
    icon: "BarChart",
    group: "Data Science",
  },
  {
    value: "SYS401",
    label: "SYS401: Distributed Systems & Cloud Architecture",
    description: "Consensus protocols, Raft, Kubernetes, microservices",
    icon: "Server",
    group: "Systems",
  },
];

const SAMPLE_USERS: (AutocompleteItem & { email: string; role: string; avatarUrl?: string })[] = [
  {
    value: "sagar.udasi",
    label: "Sagar Udasi",
    email: "sagar@bayesstack.com",
    role: "Lead Architect",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
  },
  {
    value: "elena.rostova",
    label: "Dr. Elena Rostova",
    email: "elena.rostova@bayesstack.edu",
    role: "Faculty Instructor",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80",
  },
  {
    value: "marcus.chen",
    label: "Marcus Chen",
    email: "marcus.chen@bayesstack.com",
    role: "Senior ML Engineer",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
  },
  {
    value: "priya.sharma",
    label: "Priya Sharma",
    email: "priya.sharma@bayesstack.com",
    role: "Product Designer",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
  },
  {
    value: "alex.kumar",
    label: "Alex Kumar",
    email: "alex.kumar@bayesstack.edu",
    role: "Teaching Assistant",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
  },
];

const meta: Meta<typeof Autocomplete> = {
  title: "Atoms/Inputs/Autocomplete",
  component: Autocomplete,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    data: { control: false },
    value: { control: { type: "text" }, description: "Controlled input text value" },
    placeholder: { control: { type: "text" }, description: "Input placeholder prompt" },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Input size scale",
    },
    loading: { control: { type: "boolean" }, description: "Shows loading spinner suffix" },
    error: { control: { type: "boolean" }, description: "Applies red error focus ring" },
    disabled: { control: { type: "boolean" }, description: "Disables interaction" },
    clearable: { control: { type: "boolean" }, description: "Enables instant clear trigger (✕)" },
    highlightMatch: { control: { type: "boolean" }, description: "Highlights matched substring tokens" },
    className: { control: "text" },
    classNames: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    data: SAMPLE_LANGUAGES,
    value: "Type",
    size: "md",
    placeholder: "Search technologies...",
    loading: false,
    error: false,
    disabled: false,
    clearable: true,
    highlightMatch: true,
  },
  render: (args) => {
    const [query, setQuery] = useState<string>(args.value ?? "Type");

    useEffect(() => {
      setQuery(args.value ?? "");
    }, [args.value]);

    return (
      <div style={{ maxWidth: 380 }}>
        <Autocomplete
          {...args}
          value={query}
          onValueChange={setQuery}
          onItemSubmit={(item) => console.log("Selected item:", item)}
          onClear={() => setQuery("")}
        />
      </div>
    );
  },
};

export const Ex1_StructuredCourses: Story = {
  name: "01: Structured Courses & Categories",
  render: () => {
    const [query, setQuery] = useState<string>("");
    const [selected, setSelected] = useState<AutocompleteItem | null>(null);

    return (
      <div style={{ maxWidth: 440, display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#123333", marginBottom: 6 }}>
            Select Course or Module
          </label>
          <Autocomplete
            data={SAMPLE_COURSES}
            value={query}
            onValueChange={setQuery}
            onItemSubmit={(item) => {
              setSelected(item);
              setQuery(item.label || item.value);
            }}
            placeholder="Search course title or subject..."
            prefixIcon="BookOpen"
          />
        </div>

        {selected && (
          <div
            style={{
              padding: 12,
              borderRadius: 8,
              backgroundColor: "#F0F7F6",
              border: "1px solid #D7E8E4",
              fontSize: 12,
              color: "#123333",
            }}
          >
            <strong>Active Selection:</strong> {selected.label} ({selected.value})
          </div>
        )}
      </div>
    );
  },
};

export const Ex2_UserCardRenderer: Story = {
  name: "02: Custom User Card Renderer",
  render: () => {
    const [query, setQuery] = useState<string>("");
    const [selectedUser, setSelectedUser] = useState<any | null>(null);

    return (
      <div style={{ maxWidth: 460, display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#123333", marginBottom: 6 }}>
            Assign Faculty / Team Member
          </label>
          <Autocomplete
            data={SAMPLE_USERS}
            value={query}
            onValueChange={setQuery}
            onItemSubmit={(user) => {
              setSelectedUser(user);
              setQuery(user.label || user.value);
            }}
            placeholder="Search by name, email, or role..."
            prefixIcon="UserSearch"
            renderItem={({ item, highlighted, isSelected, onClick }: any) => (
              <div
                key={item.value}
                onClick={onClick}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 10px",
                  borderRadius: 6,
                  cursor: "pointer",
                  backgroundColor: highlighted ? "#F0F7F6" : "transparent",
                  transition: "background-color 100ms ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar
                    name={item.label}
                    src={item.avatarUrl}
                    size="sm"
                  />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#123333" }}>
                      {item.label}
                    </span>
                    <span style={{ fontSize: 11, color: "#4A6360" }}>{item.email}</span>
                  </div>
                </div>

                <Badge size="sm" color="primary" variant="subtle">
                  {item.role}
                </Badge>
              </div>
            )}
          />
        </div>

        {selectedUser && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: 14,
              borderRadius: 10,
              backgroundColor: "#FFFFFF",
              border: "1.5px solid #0B6763",
              boxShadow: "0 2px 8px rgba(11, 103, 99, 0.08)",
            }}
          >
            <Avatar name={selectedUser.label} src={selectedUser.avatarUrl} size="md" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#123333" }}>{selectedUser.label}</div>
              <div style={{ fontSize: 12, color: "#4A6360" }}>{selectedUser.email}</div>
            </div>
            <Chip size="sm" variant="solid" color="primary">
              {selectedUser.role}
            </Chip>
          </div>
        )}
      </div>
    );
  },
};

export const Ex3_AsyncRemoteSearch: Story = {
  name: "03: Async Debounced Search",
  render: () => {
    const [query, setQuery] = useState<string>("");
    const [results, setResults] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const handleSearch = (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      setTimeout(() => {
        const filtered = SAMPLE_LANGUAGES.filter((lang) =>
          lang.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setResults(filtered);
        setLoading(false);
      }, 500);
    };

    return (
      <div style={{ maxWidth: 380, display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#123333", marginBottom: 6 }}>
            Async Debounced Query (500ms API Simulation)
          </label>
          <Autocomplete
            data={results}
            value={query}
            onValueChange={setQuery}
            onSearch={handleSearch}
            loading={loading}
            placeholder="Type 'script', 'py', 'sql'..."
            prefixIcon="Search"
            nothingFoundLabel={
              loading ? "Searching BayesStack servers..." : "No technologies found"
            }
          />
        </div>
      </div>
    );
  },
};
