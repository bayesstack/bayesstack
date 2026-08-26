import React, { useState } from "react";
import { Modal } from "../Modals/Modal";
import { Button } from "../../atoms/Buttons/Button";
import "./Editor.css";

export interface LinkModalProps {
  open: boolean;
  onClose: () => void;
  onInsertLink: (url: string, text?: string, openInNewTab?: boolean) => void;
  initialUrl?: string;
  initialText?: string;
}

export function LinkModal({
  open,
  onClose,
  onInsertLink,
  initialUrl = "",
  initialText = "",
}: LinkModalProps) {
  const [url, setUrl] = useState(initialUrl);
  const [text, setText] = useState(initialText);
  const [openInNewTab, setOpenInNewTab] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onInsertLink(url.trim(), text.trim() || undefined, openInNewTab);
    onClose();
  };

  return (
    <Modal
      opened={open}
      onClose={onClose}
      title="Insert Hyperlink"
      size="sm"
      footer={
        <>
          <Button size="sm" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" variant="primary" onClick={handleSubmit} disabled={!url.trim()}>
            Insert Link
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="bs-editor-link-form">
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#123333" }}>URL Link Target</label>
          <input
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="bs-editor-link-input"
            required
            autoFocus
          />
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#123333" }}>Link Display Text (Optional)</label>
          <input
            type="text"
            placeholder="e.g. Read documentation"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="bs-editor-link-input"
          />
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={openInNewTab}
            onChange={(e) => setOpenInNewTab(e.target.checked)}
          />
          Open link in new browser tab
        </label>
      </form>
    </Modal>
  );
}
