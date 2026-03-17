const steps = [
  {
    number: "01",
    title: "Upload your resume",
    description: [
      "PDF, DOCX, or paste plain text.",
      "Add a job description for job match mode.",
    ],
  },
  {
    number: "02",
    title: "Review scored suggestions",
    description: [
      "Accept or dismiss improvements by severity,",
      "section, and impact on job match.",
    ],
  },
  {
    number: "03",
    title: "Preview a diff, then export",
    description: [
      "Generate an updated resume, undo any change,",
      "then download PDF or DOCX.",
    ],
  },
];

export function HowItWorksSection() {
  return (
    <section id="how" className="border-t border-border bg-bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-medium text-text-primary">How it works</h2>
          <p className="mt-2 text-text-secondary">
            A straightforward flow designed to keep you in control of every change.
          </p>
        </div>

        <div className="relative mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
          {/* Horizontal connecting line — sits at the vertical center of the 60px numbers */}
          <div
            className="absolute hidden sm:block"
            style={{
              top: "30px",
              left: 0,
              right: 0,
              height: "1px",
              backgroundColor: "#2a3230",
            }}
          />

          {steps.map((step) => (
            <div key={step.number}>
              {/* Number with bg to visually mask the line behind it */}
              <div className="relative">
                <span className="relative z-10 inline-block bg-bg-surface pr-5 font-mono text-[60px] font-medium leading-none text-accent">
                  {step.number}
                </span>
              </div>
              <p className="mt-5 text-sm font-medium text-text-primary">{step.title}</p>
              {step.description.map((line, i) => (
                <p key={i} className="mt-1 text-sm text-text-secondary">
                  {line}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
