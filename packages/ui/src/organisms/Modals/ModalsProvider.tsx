import React, { createContext, useContext, useState, useCallback } from "react";
import { Modal, type ModalProps } from "./Modal";
import { Button } from "../../atoms/Buttons/Button";

export interface ConfirmModalProps
  extends Omit<ModalProps, "opened" | "onClose"> {
  labels?: {
    confirm?: string;
    cancel?: string;
  };
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmProps?: { color?: "primary" | "danger" };
}

interface ModalsContextType {
  openConfirmModal: (props: ConfirmModalProps) => string;
  closeModal: (id: string) => void;
}

const ModalsContext = createContext<ModalsContextType | null>(null);

/**
 * ModalsProvider enables context-based imperative modal management (e.g. `openConfirmModal`),
 * eliminating boilerplate state management for confirmation dialogs across application workflows.
 */
export function useModals() {
  const ctx = useContext(ModalsContext);
  if (!ctx) {
    throw new Error("useModals hook must be used within a ModalsProvider");
  }
  return ctx;
}

export function ModalsProvider({ children }: { children: React.ReactNode }) {
  // Stack of active programmatically managed modals
  const [modalState, setModalState] = useState<
    ({ id: string; opened: boolean } & ConfirmModalProps)[]
  >([]);

  const closeModal = useCallback((id: string) => {
    setModalState((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // Generate unique collision-resistant ID string for imperative modal tracking
  const openConfirmModal = useCallback(
    (props: ConfirmModalProps) => {
      const id = `modal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      setModalState((prev) => [...prev, { id, opened: true, ...props }]);
      return id;
    },
    []
  );

  return (
    <ModalsContext.Provider value={{ openConfirmModal, closeModal }}>
      {children}
      {modalState.map((m) => {
        // Wrap action handlers to automatically tear down modal instance upon user decision
        const handleConfirm = () => {
          if (m.onConfirm) m.onConfirm();
          closeModal(m.id);
        };
        const handleCancel = () => {
          if (m.onCancel) m.onCancel();
          closeModal(m.id);
        };

        const footer = (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button size="sm" variant="secondary" onClick={handleCancel}>
              {m.labels?.cancel || "Cancel"}
            </Button>
            <Button
              size="sm"
              variant={m.confirmProps?.color === "danger" ? "primary" : "primary"}
              onClick={handleConfirm}
            >
              {m.labels?.confirm || "Confirm"}
            </Button>
          </div>
        );

        return (
          <Modal
            key={m.id}
            opened={m.opened}
            onClose={() => closeModal(m.id)}
            title={m.title}
            description={m.description}
            size={m.size}
            footer={footer}
            className={m.className}
            classNames={m.classNames}
          >
            {m.children}
          </Modal>
        );
      })}
    </ModalsContext.Provider>
  );
}
