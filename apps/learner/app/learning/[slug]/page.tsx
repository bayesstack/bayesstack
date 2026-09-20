"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Icon } from "@bayesstack/ui";

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.toUpperCase())
    .join(" ");
}

export default function CoursePlaceholderPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "course";

  return (
    <main className="learning-workspace learning-v2-course-workspace">
      <header className="learning-v2-page-header">
        <div>
          <p className="learning-kicker">Course catalogue · {titleFromSlug(slug)}</p>
          <h1>Course details not found</h1>
          <p>This course is in the catalogue, but its course workspace has not been built yet.</p>
        </div>
      </header>

      <section className="learning-v2-next learning-v2-course-next" aria-labelledby="catalogue-return-title">
        <div>
          <div className="learning-v2-focus-label"><span>Course workspace</span></div>
          <h2 id="catalogue-return-title">We are still preparing this course</h2>
          <p>Return to your learning catalogue to choose another course or continue with Machine Learning.</p>
        </div>
        <Link href="/learning" className="bs-button bs-button--variant-primary bs-button--size-md learning-primary-action">
          Back to learning <Icon name="ArrowRight" size="sm" />
        </Link>
      </section>
    </main>
  );
}
