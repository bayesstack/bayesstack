import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { ContentEditorInput } from ".././ContentEditorInput";

const meta: Meta<typeof ContentEditorInput> = {
  title: "Organisms/Editor/ContentEditorInput",
  component: ContentEditorInput,
};

export default meta;
type Story = StoryObj<typeof ContentEditorInput>;

export const FormReadyEditorInput: Story = {
  render: () => {
    const [htmlVal, setHtmlVal] = useState("<p>Write model deployment notes...</p>");

    return (
      <div style={{ padding: 24, maxWidth: 800 }}>
        <ContentEditorInput
          label="Model Release Documentation"
          helperText="Include release highlights, API breaking changes, and deployment instructions."
          maxLength={500}
          charCount={htmlVal.replace(/<[^>]*>/g, "").length}
          value={htmlVal}
          onChange={(html) => setHtmlVal(html)}
        />
      </div>
    );
  },
};
