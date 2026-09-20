"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Icon, ProgressRing } from "@bayesstack/ui";
import { getCourseCatalogueDetails } from "../../components/learning/data";

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
  const course = getCourseCatalogueDetails(slug);

  if (!course) {
    return (
      <main className="learning-workspace learning-v2-course-workspace">
        <header className="learning-v2-page-header">
          <div>
            <p className="learning-kicker">Course catalogue · {titleFromSlug(slug)}</p>
            <h1>Course details not found</h1>
            <p>This course is not in the current catalogue. Your learner workspace is still available.</p>
          </div>
        </header>
        <section className="learning-v2-next learning-v2-course-next" aria-labelledby="catalogue-return-title">
          <div>
            <div className="learning-v2-focus-label"><span>Course unavailable</span></div>
            <h2 id="catalogue-return-title">Choose another course</h2>
            <p>Return to learning to browse your curriculum, personal courses, and the full course library.</p>
          </div>
          <Link href="/learning" className="bs-button bs-button--variant-primary bs-button--size-md learning-primary-action">
            Back to learning <Icon name="ArrowRight" size="sm" />
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="learning-workspace learning-v2-course-workspace learning-course-placeholder">
      <header className="learning-v2-page-header learning-course-placeholder-header">
        <div className="learning-course-placeholder-identity">
          <span>{course.code}</span>
          <div>
            <p className="learning-kicker">{course.context}</p>
            <h1>{course.name}</h1>
            <p>{course.description}</p>
          </div>
        </div>
        {typeof course.progress === "number" && (
          <ProgressRing value={course.progress} size="lg" label={`${course.progress}% complete`} />
        )}
      </header>

      <section className="learning-v2-next learning-v2-course-next" aria-labelledby="catalogue-return-title">
        <div>
          <div className="learning-v2-focus-label"><span>{course.status ?? "Available"}</span></div>
          <h2 id="catalogue-return-title">Learning path coming soon</h2>
          <p>The course metadata is ready, but its chapters and activities have not been published yet. Nothing is broken and you can safely return to the catalogue.</p>
        </div>
        <Link href="/learning" className="bs-button bs-button--variant-primary bs-button--size-md learning-primary-action">
          Browse learning <Icon name="ArrowRight" size="sm" />
        </Link>
      </section>
    </main>
  );
}
