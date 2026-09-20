import type { CodingActivityDescriptor } from "@bayesstack/studio-coding";
import type { VideoActivityDescriptor } from "@bayesstack/studio-video";
import { machineLearningCourse, type ActivityContext } from "./courseContent";

/** Adapt the API-shaped mock contract to the independent video studio package. */
export function createVideoActivity({ activity, concept, chapter, chapterIndex }: ActivityContext): VideoActivityDescriptor {
  const contract = activity.studio.video;
  if (!contract) throw new Error(`Video contract missing for activity ${activity.id}`);

  return {
    id: `${machineLearningCourse.id}-${activity.id}`,
    activity_type: activity.type,
    activity_version: activity.studio.version,
    title: activity.title,
    concept_id: concept.id,
    concept_title: concept.title,
    is_required: activity.studio.required,
    config: {
      duration_seconds: contract.durationSeconds,
      aspect_ratio: contract.aspectRatio,
      poster_url: contract.posterUrl,
      course_label: `${machineLearningCourse.code} · ${machineLearningCourse.name}`,
      chapter_label: `${String(chapterIndex + 1).padStart(2, "0")} · ${chapter.title}`,
      learning_objective: contract.learningObjective,
      segments: contract.segments,
      transcript: contract.transcript.map((item) => ({
        time: item.time,
        time_formatted: item.timeFormatted,
        text: item.text,
      })),
      key_takeaways: contract.keyTakeaways,
    },
  };
}

/** Adapt the API-shaped mock contract to the independent coding studio package. */
export function createCodingActivity({ activity, concept }: ActivityContext): CodingActivityDescriptor {
  const contract = activity.studio.coding;
  if (!contract) throw new Error(`Coding contract missing for activity ${activity.id}`);

  return {
    id: `${machineLearningCourse.id}-${activity.id}`,
    activity_type: activity.type,
    activity_version: activity.studio.version,
    title: activity.title,
    concept_id: concept.id,
    concept_title: concept.title,
    is_required: activity.studio.required,
    config: {
      problem_id: contract.problemId,
      problem_title: activity.title,
      difficulty: contract.difficulty,
      description: contract.description,
      default_language: contract.defaultLanguage,
      allowed_languages: contract.allowedLanguages,
      starter_code: contract.starterCode,
      test_cases: contract.testCases.map((testCase) => ({
        id: testCase.id,
        title: testCase.title,
        input: testCase.input,
        expected: testCase.expected,
        is_sample: testCase.isSample,
      })),
    },
  };
}
