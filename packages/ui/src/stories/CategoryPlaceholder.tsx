import React, { type ReactNode } from "react";

type CategoryPlaceholderProps = {
  category: "Atoms" | "Molecules" | "Organisms";
  marker: string;
  description: ReactNode;
  path: string;
};

export function CategoryPlaceholder({
  category,
  marker,
  description,
  path,
}: CategoryPlaceholderProps) {
  return (
    <main className="bs-empty-shelf">
      <div className="bs-empty-shelf__inner">
        <p className="bs-empty-shelf__eyebrow">BayesStack Design System</p>
        <h1>{category} are ready for their first building block.</h1>
        <p className="bs-empty-shelf__description">{description}</p>
        <section className="bs-empty-shelf__card" aria-label={`${category} catalog status`}>
          <div className="bs-empty-shelf__icon" aria-hidden="true">
            {marker}
          </div>
          <div>
            <h2>This shelf is intentionally empty</h2>
            <p>
              Add a component beside this story, then replace this placeholder with its
              interactive variants and documentation.
            </p>
            <code className="bs-empty-shelf__path">{path}</code>
          </div>
        </section>
      </div>
    </main>
  );
}
