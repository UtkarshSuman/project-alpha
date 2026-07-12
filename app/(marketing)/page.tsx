// FEATURE: Landing page — hero features the "pipeline strip" signature
// element: PDF -> chunks -> vectors -> chat, the actual thing the product does.
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

const pipeline = ["your PDF", "chunks", "embeddings", "your chatbot"];

const features = [
  {
    title: "Any document, instantly indexed",
    desc: "Upload a PDF or text file. We parse, chunk, and embed it in seconds — no manual tagging.",
  },
  {
    title: "Your own API key",
    desc: "Every chatbot ships with a scoped key. Track usage, set limits, revoke access — per bot.",
  },
  {
    title: "Drop-in widget",
    desc: "One script tag. Matches your brand colors. No iframe hacks, no React required on your end.",
  },
  {
    title: "Answers grounded in your docs",
    desc: "Retrieval + reranking means it cites your content — and says 'I don't know' instead of guessing.",
  },
];

export default function LandingPage() {
  return (
    <>
      <section className="py-24 md:py-32">
        <Container className="flex flex-col items-center text-center">
          <span className="mb-6 rounded-full border border-line bg-surface px-3 py-1 font-mono text-xs text-accent-2">
            now supporting PDF + TXT ingestion
          </span>
          <h1 className="font-display max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
            Turn your docs into a chatbot that knows them{" "}
            <span className="text-accent">cold</span>.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted">
            Upload a file. Get a chatbot with its own API key. Embed it on your site in one line of code.
          </p>
          <div className="mt-10 flex gap-4">
            <Button href="/register" variant="primary">Start free — no card required</Button>
            <Button href="/#how-it-works" variant="secondary">See how it works</Button>
          </div>

          {/* Signature element: the ingestion pipeline strip */}
          <div className="mt-20 flex w-full max-w-2xl items-center justify-center gap-3 rounded-lg border border-line bg-surface px-6 py-5 font-mono text-xs md:text-sm">
            {pipeline.map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                <span className={i === pipeline.length - 1 ? "text-accent" : "text-muted"}>
                  {step}
                </span>
                {i < pipeline.length - 1 && (
                  <span className="pipeline-arrow text-accent-2">&rarr;</span>
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section id="how-it-works" className="border-t border-line py-24">
        <Container>
          <h2 className="font-display text-center text-3xl font-semibold">
            What you actually get
          </h2>
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className="rounded-lg border border-line bg-surface p-6">
                <h3 className="font-display text-lg font-medium">{f.title}</h3>
                <p className="mt-2 text-sm text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-line py-24">
        <Container className="flex flex-col items-center text-center">
          <h2 className="font-display text-3xl font-semibold">Ready to try it on your own docs?</h2>
          <p className="mt-4 max-w-md text-muted">
            Free plan includes 100 messages a month — enough to test it on a real file today.
          </p>
          <Button href="/register" variant="primary" className="mt-8">
            Create your first chatbot
          </Button>
        </Container>
      </section>
    </>
  );
}