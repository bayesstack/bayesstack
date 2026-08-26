import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { Pager } from "./Pager";

const meta: Meta<typeof Pager> = {
  title: "Molecules/Navigation/Pager",
  component: Pager,
  argTypes: {
    variant: {
      control: "select",
      options: ["paged", "compact"],
    },
    withControls: { control: "boolean" },
    withEdges: { control: "boolean" },
    withGoTo: { control: "boolean" },
    withSizeSelector: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Pager>;

export const Default: Story = {
  render: () => {
    const [page, setPage] = useState(3);

    return (
      <div>
        <Pager
          page={page}
          totalPages={15}
          onPageChange={setPage}
          withControls
        />
        <div style={{ marginTop: 16, fontSize: 13, color: "#68807D" }}>
          Current Page: <strong>{page}</strong>
        </div>
      </div>
    );
  },
};

export const FullEnterpriseToolbar: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);

    return (
      <div>
        <Pager
          page={page}
          totalPages={20}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          withEdges
          withControls
          withGoTo
          withSizeSelector
        />
        <div style={{ marginTop: 16, fontSize: 13, color: "#68807D" }}>
          Active View: Page <strong>{page}</strong> | Page Size: <strong>{pageSize}</strong>
        </div>
      </div>
    );
  },
};

export const CompactVariant: Story = {
  render: () => {
    const [page, setPage] = useState(4);

    return (
      <Pager
        variant="compact"
        page={page}
        totalPages={10}
        onPageChange={setPage}
        withControls
        withEdges
      />
    );
  },
};
