import type { CodingActivityDescriptor } from "@bayesstack/studio-coding";
import type { VideoActivityDescriptor } from "@bayesstack/studio-video";

export const gradientDescentVideoActivity: VideoActivityDescriptor = {
  id: "ml-401-gradient-descent-video",
  activity_type: "video",
  activity_version: "1",
  title: "Following the negative gradient",
  concept_id: "gradient-descent",
  concept_title: "Gradient Descent",
  is_required: true,
  config: {
    duration_seconds: 720,
    aspect_ratio: "16:9",
    poster_url: "/learner/learning/gradient-descent-poster.svg",
    course_label: "ML 401 · Machine Learning",
    chapter_label: "02 · Optimisation for learning",
    learning_objective: "See how each update turns the slope of a loss function into a deliberate move toward a better model.",
    segments: [
      {
        time: 0,
        title: "Start with the loss landscape",
        description: "Frame optimisation as a sequence of small, evidence-led choices.",
      },
      {
        time: 133,
        title: "Read the direction of steepest change",
        description: "The gradient points uphill; the update must move the other way.",
      },
      {
        time: 356,
        title: "Choose the size of the step",
        description: "Use the learning rate to trade off momentum and stability.",
      },
      {
        time: 605,
        title: "Test whether the model is settling",
        description: "Watch the loss to validate that each iteration is helping.",
      },
    ],
    transcript: [
      { time: 0, time_formatted: "0:00", text: "Gradient descent improves a model through small, deliberate updates." },
      { time: 133, time_formatted: "2:13", text: "The gradient points uphill, so the update moves in the opposite direction." },
      { time: 356, time_formatted: "5:56", text: "The learning rate controls how much of the gradient is applied at each step." },
      { time: 605, time_formatted: "10:05", text: "A useful optimiser balances steady progress with stable convergence." },
    ],
    key_takeaways: [
      "Move parameters in the negative-gradient direction to reduce loss.",
      "A learning rate that is too large can overshoot the minimum.",
      "Training is an iterative process of measuring, updating, and validating.",
    ],
  },
};

export const gradientDescentCodingActivity: CodingActivityDescriptor = {
  id: "ml-401-gradient-descent-practice",
  activity_type: "coding",
  activity_version: "1",
  title: "Implement a gradient descent step",
  concept_id: "gradient-descent",
  concept_title: "Gradient Descent",
  is_required: true,
  config: {
    problem_id: "ml-401-gradient-descent-practice",
    problem_title: "Implement a gradient descent step",
    difficulty: "Medium",
    description: "Complete the update function so that it moves a parameter in the negative-gradient direction.",
    default_language: "python",
    allowed_languages: ["python", "javascript"],
    starter_code: {
      python: "def gradient_step(theta, gradient, learning_rate):\n    # Return the next parameter value.\n    pass\n\nprint(gradient_step(0.8, 1.6, 0.1))\n",
      javascript: "function gradientStep(theta, gradient, learningRate) {\n  // Return the next parameter value.\n}\n\nconsole.log(gradientStep(0.8, 1.6, 0.1));\n",
    },
    test_cases: [
      { id: "update-rule", title: "One update", input: "0.8 1.6 0.1", expected: "0.64", is_sample: true },
    ],
  },
};
