import React from 'react'

const page = () => {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Project Nexus — My Capstone</h1>
      <p className="text-gray-700 mb-6">
        I built Project Nexus to push beyond previous capstones and present how I work as a
        professional developer. It brings together my experience from completing the Airbnb
        project and expands it with stronger architecture, better developer workflows, and a
        focus on maintainability, accessibility, and performance.
      </p>

      <section className="space-y-3 mb-8">
        <h2 className="text-2xl font-semibold">What Project Nexus Means to Me</h2>
        <p className="text-gray-700">
          For me, Project Nexus is a space to demonstrate not just what I build, but how I build
          it—clean code, clear documentation, thoughtful UX, and reliable delivery. I treat it as
          a real-world product: scoped features, issue tracking, iterative releases, and
          continuous improvement.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-2xl font-semibold">How This Benefits Employers</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>🚀 Deliver production-ready features with modern tooling and best practices.</li>
          <li>🛠 Work with professional workflows: branching strategy, code reviews, and CI.</li>
          <li>📚 Provide clear documentation, meaningful commit history, and maintainable code.</li>
          <li>🔒 Prioritize accessibility, performance, and security from the start.</li>
          <li>🤝 Communicate trade-offs and collaborate effectively across teams.</li>
        </ul>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-2xl font-semibold">What I Built</h2>
        <p className="text-gray-700">
          I implemented the Web Application using Next.js (App Router), TypeScript, and Tailwind
          CSS. My focus was on a modular component architecture, typed APIs, and a consistent UI
          that’s easy to extend.
        </p>
        <ul className="list-disc pl-6 space-y-1 text-gray-700">
          <li>Reusable UI components and accessible forms</li>
          <li>Typed data models and API utilities</li>
          <li>Clean routing structure and sensible UX defaults</li>
        </ul>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-2xl font-semibold">How I Work</h2>
        <ul className="list-disc pl-6 space-y-1 text-gray-700">
          <li>💬 Collaborate openly on requirements, scope, and design decisions.</li>
          <li>🧪 Add tests and meaningful logging to catch issues early.</li>
          <li>⚙️ Automate checks (formatting, linting, type safety) to keep code quality high.</li>
          <li>📦 Document setup, run scripts, and deployment steps for smooth handoffs.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">What’s Next</h2>
        <p className="text-gray-700">
          I’m continuing to iterate—expanding features, refining DX, and exploring a PWA/mobile
          extension. If you’d like a walkthrough, I’m happy to demo the architecture and
          decision-making behind the build.
        </p>
      </section>
    </main>
  )
}

export default page