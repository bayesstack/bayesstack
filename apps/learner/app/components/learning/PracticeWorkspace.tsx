"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button, Icon } from "@bayesstack/ui";
import { conceptPath } from "./data";

export function PracticeWorkspace() {
  const [hasRun, setHasRun] = useState(false);
  return (
    <main className="learning-studio" aria-labelledby="practice-title">
      <header className="learning-studio-bar"><Link href={conceptPath}><Icon name="ArrowLeft" size="sm" />Back to Gradient Descent</Link><div><span>ML 401 / Optimization / Coding practice</span><strong id="practice-title">Implement a gradient descent step</strong></div><span><Icon name="CheckCircle" size="xs" />Draft saved</span></header>
      <div className="learning-studio-layout">
        <aside className="learning-studio-instructions"><p className="learning-kicker">Coding practice</p><h1>Implement a gradient descent step</h1><p>Write and test a small optimiser against a quadratic loss function.</p><section><h2>Objectives</h2><ol><li>Complete the update function.</li><li>Run the provided test.</li><li>Explain why the parameter moves downhill.</li></ol></section><section><h2>Submission</h2><p>Saved automatically · no submission required</p></section><Link href={conceptPath}>Return to learning material <Icon name="ArrowRight" size="xs" /></Link></aside>
        <section className="learning-studio-editor" aria-label="Python coding environment"><header><div><Icon name="Notebook" size="sm" /><strong>gradient_descent_step.py</strong><span>Python 3.11</span></div><Button variant="primary" size="sm" leftIcon="Play" onClick={() => setHasRun(true)}>Run code</Button></header><div className="learning-code-cell"><div><span>Python</span><span>1</span></div><pre><code>{`def gradient_step(theta, gradient, learning_rate):\n    # Return the next parameter value.\n    return theta - learning_rate * gradient\n\nprint(gradient_step(0.8, 1.6, 0.1))`}</code></pre></div>{hasRun ? <div className="learning-code-output is-success"><strong><Icon name="CheckCircle" size="xs" />All tests passed</strong><code>0.64</code><p>The parameter moved in the negative-gradient direction.</p></div> : <div className="learning-code-output"><strong>Output</strong><p>Run the code to check your implementation.</p></div>}<label className="learning-observation"><span>Observation</span><textarea placeholder="What changed when you increased the learning rate?" /><small>Your response is saved automatically.</small></label></section>
      </div>
    </main>
  );
}
