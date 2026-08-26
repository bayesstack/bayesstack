import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { ChatMessage } from "./ChatMessage";
import { Avatar } from "../Badges/Avatar";
import { Badge } from "../Badges/Badge";
import { Icon } from "../Icons";
import { IconButton } from "../Buttons/IconButton";
import { Button } from "../Buttons/Button";

const meta: Meta<typeof ChatMessage> = {
  title: "Atoms/Display/ChatMessage",
  component: ChatMessage,
  tags: ["autodocs"],
  argTypes: {
    isOwn: { control: "boolean" },
    showAvatar: { control: "boolean" },
    showUserName: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof ChatMessage>;

export const ReceivedMessage: Story = {
  args: {
    user: {
      name: "Sarah Chen",
      role: "Lead AI Engineer",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    },
    content: "Hey team! The new BayesStack UI components have been published to storybook.",
    timestamp: "10:42 AM",
    isOwn: false,
  },
};

export const SentMessage: Story = {
  args: {
    content: "Awesome work! Checking out the new Display atoms right now.",
    timestamp: "10:45 AM",
    isOwn: true,
  },
};

export const WithImageAttachment: Story = {
  args: {
    user: { name: "Marcus Vance", role: "Product Manager" },
    content: "Here is the updated architecture diagram for the model pipeline:",
    imageAttachment:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    timestamp: "10:48 AM",
    isOwn: false,
  },
};

export const FullChatWindowShowcase: Story = {
  render: () => {
    const [inputValue, setInputValue] = useState("");
    const [messages, setMessages] = useState([
      {
        id: "1",
        user: {
          name: "Sarah Chen",
          role: "Lead AI Engineer",
          avatar:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        },
        content: "Hi Marcus! I've finalized the BayesStack model inference telemetry service.",
        timestamp: "10:30 AM",
        isOwn: false,
      },
      {
        id: "2",
        user: { name: "Marcus Vance", role: "Product Manager" },
        content: "That sounds fantastic, Sarah! Do we have initial benchmark charts for latency?",
        timestamp: "10:32 AM",
        isOwn: true,
      },
      {
        id: "3",
        user: {
          name: "Sarah Chen",
          role: "Lead AI Engineer",
          avatar:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        },
        content: "Yes! Here is the latest performance visualization graph showing sub-50ms response times:",
        imageAttachment:
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80",
        timestamp: "10:35 AM",
        isOwn: false,
      },
      {
        id: "4",
        user: { name: "Marcus Vance", role: "Product Manager" },
        content: "Sub-50ms is incredible! I'll update the client status deck right away.",
        timestamp: "10:38 AM",
        isOwn: true,
      },
    ]);

    const handleSend = (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputValue.trim()) return;

      const newMsg = {
        id: String(Date.now()),
        user: { name: "Marcus Vance", role: "Product Manager" },
        content: inputValue.trim(),
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isOwn: true,
      };

      setMessages((prev) => [...prev, newMsg]);
      setInputValue("");
    };

    return (
      <div
        style={{
          maxWidth: 680,
          margin: "0 auto",
          border: "1px solid #E2E8F0",
          borderRadius: 12,
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)",
          backgroundColor: "#FFFFFF",
          overflow: "hidden",
          fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
          display: "flex",
          flexDirection: "column",
          height: 750,
        }}
      >
        {/* Chat Window Header */}
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid #F1F5F9",
            backgroundColor: "#F8FCFB",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar
              name="Sarah Chen"
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
              size="md"
            />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#123333" }}>
                  Sarah Chen
                </h4>
                <Badge color="success" size="sm" variant="subtle">
                  Online
                </Badge>
              </div>
              <span style={{ fontSize: 12, color: "#68807D" }}>
                Lead AI Engineer • BayesStack Core Team
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <IconButton name="Search" label="Search messages" size="sm" variant="transparent" />
            <IconButton name="Star" label="Starred messages" size="sm" variant="transparent" />
            <IconButton name="Settings" label="Chat settings" size="sm" variant="transparent" />
          </div>
        </div>

        {/* Chat Messages Body */}
        <div
          style={{
            flex: 1,
            padding: "20px",
            overflowY: "auto",
            backgroundColor: "#FAFDFD",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {messages.map((msg) => (
            <ChatMessage key={msg.id} {...msg} />
          ))}
        </div>

        {/* Chat Input Bar Footer */}
        <form
          onSubmit={handleSend}
          style={{
            padding: "12px 16px",
            borderTop: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <IconButton name="Image" label="Attach image file" size="sm" variant="transparent" />
            <IconButton name="Paperclip" label="Attach file" size="sm" variant="transparent" />
          </div>

          <input
            type="text"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{
              flex: 1,
              height: 38,
              padding: "0 14px",
              borderRadius: 8,
              border: "1px solid #D7E8E4",
              fontSize: 13.5,
              outline: "none",
              color: "#123333",
              backgroundColor: "#F8FCFB",
              fontFamily: "inherit",
            }}
          />

          <Button type="submit" size="sm" variant="primary">
            Send
          </Button>
        </form>
      </div>
    );
  },
};
