"use client";

import React, { useMemo, useState } from "react";
import {
  Avatar,
  AvatarsGroup,
  Badge,
  Button,
  Chip,
  Drawer,
  Icon,
  IconButton,
  LoadingBar,
  Paper,
  ProgressRing,
  Tabs,
  Text,
  Title,
  Tooltip,
  type IconName,
} from "@bayesstack/ui";

type PlanWindow = "today" | "week";

interface PlanItem {
  id: string;
  time: string;
  eyebrow: string;
  title: string;
  context: string;
  meta: string;
  action: string;
  icon: IconName;
  tone: "learning" | "lab" | "deadline" | "feedback";
  progress?: number;
}

const todayItems: PlanItem[] = [
  {
    id: "gradient-descent",
    time: "9:10 AM",
    eyebrow: "Continue learning",
    title: "Finish Gradient Descent",
    context: "Machine Learning / Optimization",
    meta: "18 min left / Resume at learning rate",
    action: "Continue",
    icon: "PlayCircle",
    tone: "learning",
    progress: 68,
  },
  {
    id: "optimization-lab",
    time: "2:00 PM",
    eyebrow: "Physical lab",
    title: "Optimization Lab",
    context: "Engineering Lab 4 / Batch B",
    meta: "Preparation complete / Bring your lab journal",
    action: "View brief",
    icon: "Notebook",
    tone: "lab",
  },
  {
    id: "relational-algebra",
    time: "6:00 PM",
    eyebrow: "Due today",
    title: "Relational Algebra Assignment",
    context: "Database Systems",
    meta: "3 of 5 questions complete / Work saved",
    action: "Finish",
    icon: "FileCheck",
    tone: "deadline",
    progress: 60,
  },
];

const weekItems: PlanItem[] = [
  ...todayItems,
  {
    id: "model-evaluation",
    time: "Tomorrow",
    eyebrow: "Team milestone",
    title: "Model Evaluation report",
    context: "Customer Churn Prediction",
    meta: "Sarah mentioned you / One unresolved decision",
    action: "Open project",
    icon: "Folder",
    tone: "feedback",
  },
];

const weekBars = [42, 76, 58, 88, 64, 24, 0];
const weekLabels = ["M", "T", "W", "T", "F", "S", "S"];

export function HomeExperience({ onNavigate }: { onNavigate?: (href: string) => void }) {
  const [planWindow, setPlanWindow] = useState<PlanWindow>("today");
  const [activeTask, setActiveTask] = useState<PlanItem | null>(null);
  const planItems = useMemo(() => planWindow === "today" ? todayItems : weekItems, [planWindow]);

  return (
    <div className="learner-home">
      <header className="learner-home-intro">
        <div>
          <Text as="p" size="sm" color="tertiary" strong className="learner-home-date">Friday, 13 September / Week 7 of 14</Text>
          <Title as="h1" weight="semibold" className="learner-home-title">Good morning, Sarah.</Title>
          <Text as="p" size="lg" color="secondary" className="learner-home-subtitle">
            You are on track. One focused session now keeps the rest of your day comfortably clear.
          </Text>
        </div>
        <div className="learner-home-intro-actions">
          <Button variant="outline" size="md" leftIcon="Calendar" onClick={() => onNavigate?.("/calendar")}>Plan my week</Button>
          <Button variant="secondary" size="md" leftIcon="ChartLine" onClick={() => onNavigate?.("/progress")}>View progress</Button>
        </div>
      </header>

      <section className="learner-home-command" aria-label="Recommended next action">
        <Paper className="learner-focus-card" radius="xl" elevation="lg" bordered={false} padding={0}>
          <div className="learner-focus-glow" aria-hidden="true" />
          <div className="learner-focus-copy">
            <div className="learner-focus-label">
              <span className="learner-focus-live"><i /> Your next best step</span>
              <Badge size="sm" variant="outline" color="success" prefixIcon="Sparkles">Recommended</Badge>
            </div>
            <Text as="p" size="sm" className="learner-focus-path">Machine Learning / Chapter 2 / Optimization</Text>
            <Title as="h2" weight="semibold">Finish Gradient Descent</Title>
            <Text as="p" size="md" className="learner-focus-description">
              Resume where you stopped: choosing a stable learning rate. This concept unlocks today&apos;s Optimization Lab.
            </Text>
            <div className="learner-focus-insight">
              <Tooltip content="This recommendation uses your course sequence, lab prerequisites, progress, and today's schedule." placement="top">
                <span className="learner-focus-ai"><Icon name="AiBrain" size="sm" /></span>
              </Tooltip>
              <span><strong>Why now</strong> You have 18 minutes left and a clear 42-minute focus window.</span>
            </div>
            <div className="learner-focus-actions">
              <Button size="lg" rightIcon="ArrowRight" className="learner-focus-primary" onClick={() => setActiveTask(todayItems[0])}>Continue learning</Button>
              <Button variant="link" size="md" className="learner-focus-secondary">View concept outline</Button>
            </div>
          </div>
          <div className="learner-focus-visual">
            <ProgressRing value={68} size={154} thickness={10} color="#8df0d4" trackColor="rgba(255,255,255,.13)" label={<span><strong>68%</strong><small>complete</small></span>} />
            <div className="learner-focus-stages" aria-label="Concept progress">
              <span className="is-done"><Icon name="CheckCircle" size="xs" /> Intuition</span>
              <span className="is-done"><Icon name="CheckCircle" size="xs" /> Derivation</span>
              <span className="is-current"><i /> Learning rate</span>
              <span><i /> Practice</span>
            </div>
          </div>
        </Paper>

        <Paper className="learner-rhythm-card" radius="xl" elevation="md" padding={24}>
          <div className="learner-panel-heading">
            <div>
              <Text as="p" size="xs" color="tertiary" strong className="learner-panel-eyebrow">Learning rhythm</Text>
              <Title as="h2" weight="semibold">A strong week</Title>
            </div>
            <Badge size="sm" color="success" variant="subtle" prefixIcon="CheckCircle">On track</Badge>
          </div>
          <div className="learner-rhythm-total">
            <span><strong>4h 36m</strong><small>deep learning</small></span>
            <span><strong>5</strong><small>active days</small></span>
          </div>
          <div className="learner-week-chart" aria-label="Focused learning time this week">
            {weekBars.map((height, index) => <span key={`${weekLabels[index]}-${index}`}><i style={{ height: `${Math.max(height, 4)}%` }} className={index === 4 ? "is-today" : ""} /><small>{weekLabels[index]}</small></span>)}
          </div>
          <div className="learner-rhythm-note"><Icon name="Flame" size="sm" /><span><strong>Three focused days in a row.</strong><small>Consistency is strengthening your retention.</small></span></div>
        </Paper>
      </section>

      <div className="learner-home-grid">
        <Paper className="learner-plan" radius="xl" elevation="md" padding={0}>
          <div className="learner-plan-header">
            <div>
              <Text as="p" size="xs" color="tertiary" strong className="learner-panel-eyebrow">Your plan</Text>
              <Title as="h2" weight="semibold">Move through today with confidence</Title>
            </div>
            <Tabs
              value={planWindow}
              onValueChange={(value) => setPlanWindow(value as PlanWindow)}
              variant="pill"
              size="sm"
              items={[{ value: "today", label: "Today", badge: <span>3</span> }, { value: "week", label: "This week", badge: <span>4</span> }]}
            />
          </div>
          <div className="learner-plan-list">
            {planItems.map((item, index) => (
              <article className={`learner-plan-item is-${item.tone}`} key={item.id}>
                <div className="learner-plan-time"><span>{item.time}</span>{index === 0 && planWindow === "today" ? <Badge size="sm" color="success" variant="subtle" dot>Now</Badge> : null}</div>
                <span className="learner-plan-icon"><Icon name={item.icon} size="md" /></span>
                <div className="learner-plan-copy">
                  <Text as="p" size="xs" color="tertiary" strong>{item.eyebrow}</Text>
                  <Title as="h3" weight="semibold">{item.title}</Title>
                  <Text as="p" size="sm" color="secondary">{item.context}</Text>
                  <span className="learner-plan-meta"><Icon name="Clock" size="xs" /> {item.meta}</span>
                  {item.progress !== undefined && <LoadingBar progress={item.progress} height={4} className="learner-plan-progress" />}
                </div>
                <Button variant={index === 0 && planWindow === "today" ? "primary" : "outline"} size="sm" rightIcon="ArrowRight" onClick={() => setActiveTask(item)}>{item.action}</Button>
              </article>
            ))}
          </div>
          <footer className="learner-plan-footer">
            <span><Icon name="CheckCircle" size="sm" /> Preparation is complete for every scheduled activity.</span>
            <Button variant="link" size="sm" rightIcon="ArrowRight" onClick={() => onNavigate?.("/calendar")}>Open calendar</Button>
          </footer>
        </Paper>

        <aside className="learner-home-rail">
          <Paper className="learner-path-card" radius="xl" elevation="md" padding={24}>
            <div className="learner-panel-heading">
              <div>
                <Text as="p" size="xs" color="tertiary" strong className="learner-panel-eyebrow">Career direction</Text>
                <Title as="h2" weight="semibold">AI Engineer</Title>
              </div>
              <IconButton name="ArrowRight" label="View AI Engineer path" variant="transparent" size="sm" onClick={() => onNavigate?.("/progress")} />
            </div>
            <div className="learner-role-readiness">
              <ProgressRing value={64} size={92} thickness={7} color="#5f6ee8" trackColor="#e8eafd" label={<strong>64%</strong>} />
              <div><strong>Role readiness</strong><span>4 capabilities strengthened this term</span><small><Icon name="ChartLine" size="xs" /> Up 8% in six weeks</small></div>
            </div>
            <div className="learner-path-gap"><span><Icon name="Target" size="sm" /></span><div><strong>Your closest capability gap</strong><p>Neural Networks / 2 evidence items needed</p></div></div>
            <Button variant="outline" size="sm" fullWidth rightIcon="ArrowRight" onClick={() => onNavigate?.("/progress")}>Explore my capability path</Button>
          </Paper>

          <Paper className="learner-circle-card" radius="xl" elevation="md" padding={24}>
            <div className="learner-panel-heading">
              <div>
                <Text as="p" size="xs" color="tertiary" strong className="learner-panel-eyebrow">Study circle</Text>
                <Title as="h2" weight="semibold">Optimization clinic</Title>
              </div>
              <Badge size="sm" color="info" variant="subtle" prefixIcon="Sparkles">Live now</Badge>
            </div>
            <Text as="p" size="sm" color="secondary">Three classmates are working through the same concept. Join with your learning context attached.</Text>
            <div className="learner-circle-people"><AvatarsGroup avatars={[{ name: "Aarav Shah", color: "#dbeafe" }, { name: "Meera Nair", color: "#fce7f3" }, { name: "Kabir Rao", color: "#dcfce7" }]} total={6} limit={3} size="sm" /><span>6 learners / Prof. Rao available</span></div>
            <Button variant="secondary" size="sm" fullWidth leftIcon="Comment" onClick={() => onNavigate?.("/discussions")}>Join contextual discussion</Button>
          </Paper>
        </aside>
      </div>

      <section className="learner-growth-section">
        <div className="learner-growth-heading">
          <div><Text as="p" size="xs" color="tertiary" strong className="learner-panel-eyebrow">Capability momentum</Text><Title as="h2" weight="semibold">Your work is becoming credible evidence.</Title></div>
          <Button variant="link" size="sm" rightIcon="ArrowRight" onClick={() => onNavigate?.("/progress")}>See full evidence record</Button>
        </div>
        <div className="learner-growth-grid">
          <Paper className="learner-skill-card" radius="xl" elevation="md" padding={24}>
            <div className="learner-skill-top"><span className="learner-skill-mark"><Icon name="Brain" size="md" /></span><div><Text as="p" size="xs" color="tertiary" strong>Skill strengthened</Text><Title as="h3" weight="semibold">Machine Learning</Title></div><Badge color="primary" variant="solid" size="md">Level 3</Badge></div>
            <div className="learner-skill-progress"><span><strong>Level 4</strong><small>460 / 600 evidence points</small></span><LoadingBar progress={77} height={8} /></div>
            <div className="learner-skill-evidence"><span><Icon name="Notebook" size="sm" /> Optimization Lab</span><span><Icon name="Folder" size="sm" /> Churn project</span><span><Icon name="ShieldCheck" size="sm" /> Faculty verified</span></div>
          </Paper>
          <Paper className="learner-evidence-card" radius="xl" elevation="md" padding={24}>
            <div className="learner-evidence-icon"><Icon name="Award" size="md" /></div>
            <div><Text as="p" size="xs" color="tertiary" strong>New verified evidence</Text><Title as="h3" weight="semibold">Optimization Lab / Experiment design</Title><Text as="p" size="sm" color="secondary">Prof. Rao verified your parameter analysis and linked it to two course outcomes.</Text><div className="learner-evidence-tags"><Chip size="sm" color="success" variant="subtle" prefixIcon="CheckCircle">Verified</Chip><Chip size="sm" color="neutral" variant="outline">2 outcomes</Chip></div></div>
            <Avatar name="Prof. Anika Rao" size="sm" />
          </Paper>
        </div>
      </section>

      <Drawer
        open={Boolean(activeTask)}
        onClose={() => setActiveTask(null)}
        title={activeTask?.title}
        subtitle={activeTask?.context}
        size="md"
        className="learner-task-drawer"
        footer={<><Button variant="outline" onClick={() => setActiveTask(null)}>Not now</Button><Button rightIcon="ArrowRight">{activeTask?.action || "Open"}</Button></>}
      >
        {activeTask && <div className="learner-task-detail">
          <Badge color={activeTask.tone === "deadline" ? "warning" : "primary"} variant="subtle" prefixIcon={activeTask.icon}>{activeTask.eyebrow}</Badge>
          <div className="learner-task-detail-block"><Text as="p" size="xs" color="tertiary" strong>Why this matters</Text><Text as="p" size="md" color="secondary">This activity is part of your current academic sequence and produces evidence toward Machine Learning and analytical reasoning.</Text></div>
          {activeTask.progress !== undefined && <div className="learner-task-detail-block"><span className="learner-task-detail-progress"><strong>Your progress</strong><small>{activeTask.progress}%</small></span><LoadingBar progress={activeTask.progress} height={8} /></div>}
          <div className="learner-task-detail-block"><Text as="p" size="xs" color="tertiary" strong>Ready to continue</Text><div className="learner-task-ready"><Icon name="CheckCircle" size="sm" /><span><strong>Your work is saved</strong><small>{activeTask.meta}</small></span></div><div className="learner-task-ready"><Icon name="ShieldCheck" size="sm" /><span><strong>Evidence capture is active</strong><small>Only course-authorized evidence is recorded.</small></span></div></div>
        </div>}
      </Drawer>
    </div>
  );
}
