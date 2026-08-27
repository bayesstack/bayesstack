import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FileUpload } from "../FileUpload";

describe("FileUpload Component", () => {
  it("renders dropzone and lists uploaded files", () => {
    const handleValueChange = vi.fn();
    render(
      <FileUpload
        title="Upload PDF Files"
        defaultValue={[{ name: "document.pdf", size: "1.2 MB" }]}
        onValueChange={handleValueChange}
      />
    );

    expect(screen.getByText("Upload PDF Files")).toBeInTheDocument();
    expect(screen.getByText("document.pdf")).toBeInTheDocument();

    const removeBtn = screen.getByLabelText("Remove file");
    fireEvent.click(removeBtn);
    expect(handleValueChange).toHaveBeenCalledWith([]);
  });
});
