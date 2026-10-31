import { getDb } from "../api/queries/connection";
import { blogs, caseStudies, profiles, projects, skills } from "./schema";

const projectSeed = [
  {
    title: "AI Content Agent",
    slug: "ai-content-agent",
    summary: "An open-source AI content automation pipeline for short-form video creation, human review, and multi-platform publishing.",
    description: "A provider-agnostic system that turns a content idea into structured campaigns, scripts, scenes, rendered videos, and reviewable publishing jobs. The architecture prioritizes inspectable workflows and human approval over opaque automation.",
    category: "Applied AI · Open Source",
    technologies: "Next.js, TypeScript, MongoDB, FFmpeg, LLM APIs, Zod",
    imageUrl: "",
    liveUrl: "",
    repoUrl: "https://github.com/Anwar0904/Facebook-automation-agent",
    featured: true,
    published: true,
    sortOrder: 1,
  },
  {
    title: "Blood Connect",
    slug: "blood-connect",
    summary: "A full-stack digital presence for a Pakistan-focused blood donation and community-impact initiative.",
    description: "A responsive platform that presents donor networks, awareness programs, leadership, and regional initiatives through an accessible, mission-led content experience.",
    category: "Full-Stack · Social Impact",
    technologies: "Next.js, TypeScript, MongoDB",
    imageUrl: "/images/blood-connect.png",
    liveUrl: "https://blood-connect-todq.vercel.app/",
    repoUrl: "https://github.com/Anwar0904/Blood-Connect",
    featured: true,
    published: true,
    sortOrder: 2,
  },
  {
    title: "Arazi Digital Media",
    slug: "arazi-digital-media",
    summary: "A conversion-focused company website bringing AI automation, custom software, and digital services into one clear story.",
    description: "A polished business website with service positioning, portfolio content, insights, FAQs, and consultation paths—designed to make a broad digital offering easy to understand and act on.",
    category: "Business Platform · Digital Services",
    technologies: "Web Development, UI/UX, Content Architecture",
    imageUrl: "/images/arazi-digital.png",
    liveUrl: "https://arazidigitalmedia.com",
    repoUrl: "",
    featured: true,
    published: true,
    sortOrder: 3,
  },
  {
    title: "PHP2Shell Guard",
    slug: "php2shell-guard",
    summary: "An open-source security assessment interface for researching and understanding PHP vulnerability exposure.",
    description: "A focused security tool built around clear assessment workflows, modern web technologies, and edge deployment. The project reflects an interest in practical security engineering and developer tooling.",
    category: "Security · Developer Tooling",
    technologies: "React, TypeScript, Cloudflare Workers, PHP Security",
    imageUrl: "",
    liveUrl: "https://php2shell-guard.anwar-labs.workers.dev",
    repoUrl: "https://github.com/Anwar0904/php2shell-guard",
    featured: false,
    published: true,
    sortOrder: 4,
  },
  {
    title: "ATK App",
    slug: "atk-app",
    summary: "A responsive web platform project with a structured content experience and full-stack development focus.",
    description: "A production website project representing end-to-end implementation across interface development, content organization, and responsive delivery.",
    category: "Web Application",
    technologies: "Full-Stack Development, JavaScript, Responsive UI",
    imageUrl: "",
    liveUrl: "https://atkapp.org",
    repoUrl: "",
    featured: false,
    published: true,
    sortOrder: 5,
  },
];

async function seed() {
  const db = getDb();
  const [existing] = await db.select().from(profiles).limit(1);
  if (existing) {
    console.log("Portfolio already seeded.");
    process.exit(0);
  }

  console.log("Seeding portfolio...");
  await db.insert(profiles).values({
    name: "Anwar Ul Haq",
    headline: "Full-Stack AI Engineer",
    subheadline: "MERN Stack Developer · AI Engineer",
    bio: "I’m a software developer from Pakistan focused on combining full-stack development and applied artificial intelligence to build practical, reliable, and scalable software. My work spans frontend engineering, backend development, databases, API architecture, machine learning, LLM-powered applications, and intelligent automation.",
    location: "Pakistan",
    email: "au090469@gmail.com",
    avatarUrl: "/images/anwar-avatar.png",
    linkedinUrl: "https://www.linkedin.com/in/anwar-42khan/",
    githubUrl: "https://github.com/Anwar0904",
    availability: "Building intelligent software, end to end.",
  });

  const projectIds = new Map<string, number>();
  for (const project of projectSeed) {
    const [{ id }] = await db.insert(projects).values(project).returning({ id: projects.id });
    projectIds.set(project.slug, id);
  }

  await db.insert(skills).values([
    { name: "React", category: "Frontend", level: 92, sortOrder: 1 },
    { name: "Next.js", category: "Frontend", level: 90, sortOrder: 2 },
    { name: "TypeScript", category: "Languages", level: 88, sortOrder: 3 },
    { name: "JavaScript", category: "Languages", level: 92, sortOrder: 4 },
    { name: "Node.js", category: "Backend", level: 90, sortOrder: 5 },
    { name: "Express.js", category: "Backend", level: 88, sortOrder: 6 },
    { name: "Python", category: "AI & Data", level: 86, sortOrder: 7 },
    { name: "FastAPI", category: "Backend", level: 82, sortOrder: 8 },
    { name: "MongoDB", category: "Data", level: 90, sortOrder: 9 },
    { name: "Mongoose", category: "Data", level: 86, sortOrder: 10 },
    { name: "PHP", category: "Languages", level: 78, sortOrder: 11 },
    { name: "HTML & CSS", category: "Frontend", level: 94, sortOrder: 12 },
    { name: "LLM Applications", category: "AI & Data", level: 84, sortOrder: 13 },
    { name: "RAG Fundamentals", category: "AI & Data", level: 76, sortOrder: 14 },
    { name: "scikit-learn", category: "AI & Data", level: 74, sortOrder: 15 },
    { name: "Git & GitHub", category: "Tools", level: 88, sortOrder: 16 },
  ]);

  await db.insert(caseStudies).values([
    {
      projectId: projectIds.get("ai-content-agent"),
      title: "Designing approval-first AI content automation",
      slug: "approval-first-ai-content-automation",
      challenge: "Short-form publishing often fragments research, scripting, media generation, editing, review, and distribution across disconnected tools. The challenge was to design one pipeline without sacrificing editorial control.",
      approach: "The system separates campaigns, videos, publishing jobs, and social accounts into clear models. Structured data, Zod validation, provider-agnostic services, FFmpeg rendering, and human approval make each stage inspectable and replaceable.",
      outcome: "A working campaign creation workflow connects the interface, validated API layer, and MongoDB persistence, while the broader architecture supports iterative AI generation, rendering, review, and publishing capabilities.",
      imageUrl: "",
      published: true,
    },
    {
      projectId: projectIds.get("blood-connect"),
      title: "Turning a social mission into a clear digital experience",
      slug: "blood-connect-digital-experience",
      challenge: "Blood Connect needed to communicate a wide range of programs, regional activity, leadership information, and awareness initiatives without overwhelming visitors.",
      approach: "The experience organizes content around mission, coverage, impact areas, people, and campaigns. Responsive layouts and direct section hierarchy help visitors move from understanding the cause to exploring its work.",
      outcome: "A cohesive public platform presents the organization’s work across Pakistan and gives its programs a structured, accessible digital home.",
      imageUrl: "/images/blood-connect.png",
      published: true,
    },
    {
      projectId: projectIds.get("arazi-digital-media"),
      title: "Making a broad digital offer easier to navigate",
      slug: "arazi-digital-media-service-experience",
      challenge: "AI automation, custom software, websites, and digital growth services can feel abstract when presented as a long list of capabilities. The site needed a clear narrative and an obvious next step.",
      approach: "The content flows from value proposition to capabilities, methodology, work, testimonials, FAQs, insights, and consultation. Repeated section rhythms and direct calls to action keep the experience coherent.",
      outcome: "A polished company website brings services, proof, educational content, and conversion paths together in one extensible experience.",
      imageUrl: "/images/arazi-digital.png",
      published: true,
    },
  ]);

  await db.insert(blogs).values([
    {
      title: "What makes an AI feature production-ready?",
      slug: "production-ready-ai-features",
      excerpt: "A practical checklist for moving from a promising model response to a reliable software capability.",
      content: "A model response is not a product feature. Production-ready AI needs structured inputs, validated outputs, clear failure states, and an owner for every external dependency.\n\nStart with the workflow, not the model. Define what the user is trying to accomplish, which steps are deterministic, and where intelligence actually adds value. Then add schemas, timeouts, retries, logging, and human review wherever the cost of an error is high.\n\nThe final layer is evaluation. Keep representative examples, test edge cases, and measure whether the feature helps users complete the real task. Reliable AI engineering is the combination of software discipline and measured experimentation.",
      coverUrl: "",
      published: true,
    },
    {
      title: "Why I prefer inspectable AI pipelines",
      slug: "inspectable-ai-pipelines",
      excerpt: "Deterministic stages and structured artifacts make intelligent systems easier to debug, improve, and trust.",
      content: "An opaque agent can be impressive in a demo and difficult to operate in production. An inspectable pipeline takes the opposite approach: every stage produces data that can be reviewed, stored, regenerated, or tested.\n\nThis does not remove intelligence from the system. It gives intelligence boundaries. Script generation, scene planning, asset creation, rendering, and publishing can each evolve independently while the overall workflow remains understandable.\n\nHuman approval becomes a meaningful control rather than a button placed at the end. Teams can see what changed, retry one stage, and keep a reliable record of what was published.",
      coverUrl: "",
      published: true,
    },
    {
      title: "From MERN development to applied AI engineering",
      slug: "mern-to-applied-ai-engineering",
      excerpt: "Why a strong full-stack foundation is still one of the best starting points for building useful AI products.",
      content: "Applied AI products still need interfaces, APIs, databases, authentication, validation, deployment, and monitoring. A full-stack foundation makes those requirements familiar.\n\nThe new layer is learning how to work with models, data, embeddings, retrieval, evaluation, and uncertain outputs. Python, machine learning fundamentals, and LLM application patterns add that layer without replacing good software engineering.\n\nThe goal is not to collect frameworks. It is to understand complete systems: how a user action becomes data, how intelligence transforms it, and how the result becomes a reliable outcome.",
      coverUrl: "",
      published: true,
    },
  ]);

  console.log("Portfolio seeded successfully.");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
