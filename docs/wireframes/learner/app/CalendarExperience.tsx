"use client";

import React, { useState } from "react";
import { Badge, Button, Chip, Drawer, Icon, Paper, ScheduleCalendar, Select, Tabs, Text, TextInput, Title, type ScheduleCalendarEvent } from "@bayesstack/ui";

const events: ScheduleCalendarEvent[] = [
  { id: "ml-lecture", title: "ML 401 Lecture", description: "Optimization", dayIndex: 0, start: "09:00", end: "10:30", type: "session", icon: "BookOpen" },
  { id: "database-lab", title: "Database Systems Lab", description: "Lab 3 / Room C-204", dayIndex: 1, start: "10:00", end: "12:00", type: "session", icon: "Terminal" },
  { id: "assignment", title: "Relational Algebra Assignment", description: "Due 18:00", dayIndex: 1, start: "18:00", type: "deadline" },
  { id: "optimization-lab", title: "Optimization Lab", description: "Batch B / Engineering Lab 4", dayIndex: 2, start: "14:00", end: "16:00", type: "session", icon: "Notebook" },
  { id: "office-hours", title: "Prof. Rao Office Hours", description: "Online / 30 min slots", dayIndex: 3, start: "12:00", end: "13:00", type: "session", icon: "Comment" },
  { id: "project-milestone", title: "Model Evaluation", description: "Project milestone / Due 20:00", dayIndex: 4, start: "20:00", type: "milestone" },
  { id: "quiz", title: "Probability Quiz", description: "Room A-201 / 20 marks", dayIndex: 0, start: "10:00", end: "10:45", type: "exam", icon: "ShieldCheck" },
];

const detailCopy: Record<string, { eyebrow: string; course: string; date: string; location: string; status: string; action: string; actionNote: string }> = {
  "optimization-lab": { eyebrow: "Scheduled lab session", course: "ML 401 / Machine Learning / Chapter 2", date: "Wednesday, Sep 16 / 14:00 - 16:00", location: "Engineering Lab 4 / Batch B", status: "Ready to begin", action: "Open lab", actionNote: "Gradient Descent and Loss Functions complete" },
  assignment: { eyebrow: "Academic deadline", course: "CS 326 / Database Systems", date: "Tuesday, Sep 15 / Due 18:00", location: "Submit through assignment workspace", status: "In progress / 3 of 5 questions complete", action: "Continue task", actionNote: "Your work is saved" },
  "project-milestone": { eyebrow: "Project milestone", course: "Customer Churn Prediction", date: "Friday, Sep 18 / Due 20:00", location: "Project workspace", status: "3 of 4 team deliverables ready", action: "Open project", actionNote: "Your responsibility: model comparison" },
  quiz: { eyebrow: "Assessment", course: "Probability and Statistics / Quiz 03", date: "Monday, Sep 14 / 10:00 - 10:45", location: "Room A-201", status: "Available from 09:55", action: "Prepare for exam", actionNote: "System check: identity verification pending" },
  "database-lab": { eyebrow: "Scheduled lab session", course: "CS 326 / Database Systems Laboratory", date: "Tuesday, Sep 15 / 10:00 - 12:00", location: "Room C-204 / Lab 3", status: "Preparation required", action: "Prepare for lab", actionNote: "Relational algebra review incomplete" },
  "ml-lecture": { eyebrow: "Course session", course: "ML 401 / Machine Learning", date: "Monday, Sep 14 / 09:00 - 10:30", location: "Lecture Hall 2", status: "Scheduled", action: "Open course", actionNote: "Topic: Optimization" },
  "office-hours": { eyebrow: "Office hours", course: "Prof. N. Rao / Machine Learning", date: "Thursday, Sep 17 / 12:00 - 13:00", location: "Online / Book a slot", status: "Slots available", action: "View slots", actionNote: "Academic support session" },
};

export function CalendarExperience() {
  const [view, setView] = useState<"Week" | "Month" | "Agenda">("Week");
  const [selected, setSelected] = useState<ScheduleCalendarEvent | null>(null);
  const [personalOpen, setPersonalOpen] = useState(false);
  const [personalAdded, setPersonalAdded] = useState(false);
  const selectedDetails = selected ? detailCopy[selected.id] : null;
  return <div className="calendar-page calendar-page-v2">
    <header className="calendar-v2-header"><div><Text as="p" size="xs" color="tertiary" strong className="learner-panel-eyebrow">Academic time</Text><Title as="h1" weight="semibold">Your week, with room to learn.</Title><Text as="p" size="md" color="secondary">Official sessions, deadlines, project commitments, and personal focus time in one dependable schedule.</Text></div><Button variant="outline" size="md" leftIcon="Plus" onClick={() => setPersonalOpen(true)}>Add study block</Button></header>

    <section className="calendar-command-v2">
      <Paper className="calendar-next-card" radius="xl" elevation="lg" bordered={false} padding={0}><div className="calendar-next-date"><span>WED</span><strong>16</strong><small>September</small></div><div><div><Badge color="success" variant="outline" prefixIcon="Notebook">Next on your schedule</Badge><span>Starts in 18 min</span></div><Title as="h2" weight="semibold">Optimization Lab</Title><Text as="p" size="sm">Engineering Lab 4 / Batch B / Preparation complete</Text><div className="calendar-next-actions"><Button size="sm" rightIcon="ArrowRight" onClick={() => setSelected(events.find((item) => item.id === 'optimization-lab') || null)}>Open lab brief</Button><Button variant="link" size="sm">Directions</Button></div></div><aside><Chip color="success" variant="subtle" size="sm" prefixIcon="CheckCircle">Ready</Chip><span><Icon name="Clock" size="sm" /> 14:00 - 16:00</span><span><Icon name="MapPin" size="sm" /> Engineering Lab 4</span></aside></Paper>
      <Paper className="calendar-load-card" radius="xl" elevation="md" padding={22}><div className="learner-panel-heading"><div><Text as="p" size="xs" color="tertiary" strong className="learner-panel-eyebrow">Week load</Text><Title as="h2" weight="semibold">Balanced</Title></div><Badge color="success" variant="subtle">On track</Badge></div><div><span><strong>4</strong><small>sessions</small></span><span><strong>2</strong><small>deadlines</small></span><span><strong>1</strong><small>milestone</small></span></div><Text as="p" size="xs" color="tertiary">Thursday afternoon has your best open focus window.</Text></Paper>
    </section>

    <Paper className="calendar-workspace-v2" radius="xl" elevation="md" padding={0}><div className="calendar-toolbar-v2"><div className="calendar-date-nav-v2"><Button variant="outline" size="sm">Today</Button><Button variant="outline" size="sm" leftIcon="ChevronLeft" aria-label="Previous week" /><strong>Sep 14 - 20</strong><Button variant="outline" size="sm" leftIcon="ChevronRight" aria-label="Next week" /></div><Tabs value={view} onValueChange={(value) => setView(value as typeof view)} variant="pill" size="sm" items={["Week","Month","Agenda"].map((value) => ({ value, label: value }))} /><div className="calendar-filters-v2"><Select defaultValue="all" options={[{ value: 'all', label: 'All courses' }, { value: 'ml', label: 'Machine Learning' }, { value: 'db', label: 'Database Systems' }]} /><Select defaultValue="all" options={[{ value: 'all', label: 'All event types' }, { value: 'session', label: 'Sessions' }, { value: 'deadline', label: 'Deadlines' }]} /></div></div>
      <div className="calendar-canvas-v2">{view === "Week" ? <ScheduleCalendar days={[{ label: "MON", date: "14" }, { label: "TUE", date: "15" }, { label: "WED", date: "16", isToday: true }, { label: "THU", date: "17" }, { label: "FRI", date: "18" }]} events={events.filter((event) => event.id !== "quiz")} startHour={8} endHour={21} currentTime={{ dayIndex: 2, time: "13:42" }} onEventClick={setSelected} /> : view === "Agenda" ? <Agenda events={events} onOpen={setSelected} /> : <MonthPreview events={events} onOpen={setSelected} />}</div>
    </Paper>

    <section className="calendar-decisions-v2"><div className="calendar-v2-section-heading"><div><Text as="p" size="xs" color="tertiary" strong className="learner-panel-eyebrow">Upcoming decisions</Text><Title as="h2" weight="semibold">Prepare before urgency arrives</Title></div><Button variant="link" size="sm" rightIcon="ArrowRight">View full agenda</Button></div><div>{[["Tomorrow", "Optimization Lab", "14:00", "Session"], ["Tue", "Relational Algebra Assignment", "18:00", "Due"], ["Fri", "Model Evaluation", "20:00", "Milestone"], ["Sep 22", "Probability Quiz", "10:00", "Exam"]].map(([date, title, time, kind], index) => <Paper as="article" hoverable radius="xl" elevation="md" padding={18} key={title} onClick={() => setSelected(events.find((item) => item.title === title) || events[0])}><span className={`calendar-decision-icon is-${kind.toLowerCase()}`}><Icon name={index === 0 ? 'Notebook' : index === 1 ? 'FileCheck' : index === 2 ? 'Folder' : 'ShieldCheck'} size="sm" /></span><div><Text as="p" size="xs" color="tertiary" strong>{date} / {time}</Text><Title as="h3" weight="semibold">{title}</Title><Badge color={kind === 'Due' ? 'warning' : kind === 'Exam' ? 'danger' : 'primary'} variant="subtle" size="sm">{kind}</Badge></div><Icon name="ChevronRight" size="xs" /></Paper>)}</div></section>
    {selected && selectedDetails && <EventDrawer event={selected} details={selectedDetails} onClose={() => setSelected(null)} />}
    <PersonalDrawer open={personalOpen} onClose={() => setPersonalOpen(false)} onAdd={() => { setPersonalAdded(true); setPersonalOpen(false); }} />
    {personalAdded && <div className="calendar-toast"><Icon name="CheckCircle" size="xs" /> Personal study block added. Official academic events remain unchanged.</div>}
  </div>;
}

function Agenda({ events, onOpen }: { events: ScheduleCalendarEvent[]; onOpen: (event: ScheduleCalendarEvent) => void }) {
  const groups: Array<{ label: string; items: ScheduleCalendarEvent[] }> = [
    { label: "Today / Mon 14", items: events.filter((event) => event.dayIndex === 0) },
    { label: "Tomorrow / Tue 15", items: events.filter((event) => event.dayIndex === 1) },
    { label: "Wed 16", items: events.filter((event) => event.dayIndex === 2) },
    { label: "Fri 18", items: events.filter((event) => event.dayIndex === 4) },
  ];
  return <div className="calendar-agenda">{groups.map(({ label, items }) => <section key={label}><p className="calendar-kicker">{label}</p>{items.map((event) => <button key={event.id} onClick={() => onOpen(event)}><time>{event.start}</time><span className={`agenda-marker is-${event.type}`}>{event.type === "deadline" || event.type === "milestone" ? "◆" : <Icon name={event.icon || "Calendar"} size="xs" />}</span><span><strong>{event.title}</strong><small>{event.description}</small></span><Icon name="ChevronRight" size="xs" /></button>)}</section>)}</div>;
}

function MonthPreview({ events, onOpen }: { events: ScheduleCalendarEvent[]; onOpen: (event: ScheduleCalendarEvent) => void }) {
  const days = Array.from({ length: 30 }, (_, index) => index + 1);
  return <section className="calendar-month"><div className="calendar-month-head">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <span key={day}>{day}</span>)}</div><div className="calendar-month-grid">{days.map((day) => { const linked = events.filter((event) => day >= 14 && day <= 18 && event.dayIndex === day - 14); return <button key={day} className={day === 16 ? "is-today" : ""} onClick={() => linked[0] && onOpen(linked[0])}><strong>{day}</strong>{linked.slice(0, 2).map((event) => <small className={`is-${event.type}`} key={event.id}>{event.type === "deadline" || event.type === "milestone" ? "◆ " : ""}{event.title}</small>)}</button>; })}</div></section>;
}

function EventDrawer({ event, details, onClose }: { event: ScheduleCalendarEvent; details: NonNullable<typeof detailCopy[string]>; onClose: () => void }) {
  return <Drawer open onClose={onClose} title={event.title} subtitle={details.course} size="md" className="calendar-event-drawer-v2" footer={<><Button variant="outline" onClick={onClose}>Close</Button><Button rightIcon="ArrowRight">{details.action}</Button></>}><Badge color={event.type === 'deadline' ? 'warning' : event.type === 'exam' ? 'danger' : 'primary'} variant="subtle" prefixIcon={event.icon || 'Calendar'}>{details.eyebrow}</Badge><div className="event-facts-v2"><span><Icon name="Calendar" size="sm" /><strong>{details.date}</strong></span><span><Icon name="MapPin" size="sm" /><strong>{details.location}</strong></span></div><Paper variant="subtle" elevation="none" radius="lg" padding={16} className="event-status-v2"><Text as="p" size="xs" color="tertiary" strong>Status</Text><strong>{details.status}</strong><small>{details.actionNote}</small></Paper><div className="event-source-v2"><Icon name="ShieldCheck" size="sm" /><span><strong>Official academic schedule</strong><small>Changes from your institution will appear automatically.</small></span></div><Button variant="link" size="sm" rightIcon="ArrowRight">View related discussion</Button></Drawer>;
}

function PersonalDrawer({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: () => void }) {
  return <Drawer open={open} onClose={onClose} title="Add a study block" subtitle="Reserve personal focus time around your academic schedule" size="md" className="personal-drawer-v2" footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button rightIcon="ArrowRight" onClick={onAdd}>Add study block</Button></>}><Badge color="info" variant="subtle" prefixIcon="Calendar">Personal event</Badge><div className="personal-drawer-fields"><TextInput defaultValue="Revision - Probability" aria-label="Study block title" /><TextInput defaultValue="Thu, Sep 17 / 16:00 - 17:00" aria-label="Study block time" /></div><Paper variant="subtle" radius="lg" elevation="none" padding={16}><Text as="p" size="sm" color="secondary">Personal events remain separate from official academic scheduling and are visible only to you.</Text></Paper></Drawer>;
}
