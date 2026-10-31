import { eq } from "drizzle-orm";
import { z } from "zod";
import { blogs, caseStudies, profiles, projects, skills } from "../db/schema.js";
import { adminQuery, createRouter, publicQuery } from "./middleware.js";
import { getAdminPortfolio, getPublicPortfolio } from "./queries/portfolio.js";
import { getDb } from "./queries/connection.js";

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `entry-${Date.now()}`;
const idInput = z.object({ id: z.number().int().positive() });
const textField = z.string().trim().max(5000).default("");

const projectInput = z.object({
  id: z.number().int().positive().optional(),
  title: z.string().trim().min(2).max(255),
  slug: z.string().trim().max(255).default(""),
  summary: z.string().trim().min(10).max(1000),
  description: z.string().trim().min(10).max(5000),
  category: z.string().trim().min(2).max(120),
  technologies: textField,
  imageUrl: textField,
  liveUrl: textField,
  repoUrl: textField,
  featured: z.boolean(),
  published: z.boolean(),
  sortOrder: z.number().int().min(0).max(9999),
});

const skillInput = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().trim().min(2).max(120),
  category: z.string().trim().min(2).max(120),
  level: z.number().int().min(0).max(100),
  featured: z.boolean(),
  published: z.boolean(),
  sortOrder: z.number().int().min(0).max(9999),
});

const caseStudyInput = z.object({
  id: z.number().int().positive().optional(),
  projectId: z.number().int().positive().nullable().default(null),
  title: z.string().trim().min(2).max(255),
  slug: z.string().trim().max(255).default(""),
  challenge: z.string().trim().min(10).max(5000),
  approach: z.string().trim().min(10).max(5000),
  outcome: z.string().trim().min(10).max(5000),
  imageUrl: textField,
  published: z.boolean(),
});

const blogInput = z.object({
  id: z.number().int().positive().optional(),
  title: z.string().trim().min(2).max(255),
  slug: z.string().trim().max(255).default(""),
  excerpt: z.string().trim().min(10).max(1000),
  content: z.string().trim().min(20).max(30000),
  coverUrl: textField,
  published: z.boolean(),
});

const profileInput = z.object({
  name: z.string().trim().min(2).max(255),
  headline: z.string().trim().min(2).max(255),
  subheadline: z.string().trim().min(2).max(255),
  bio: z.string().trim().min(20).max(5000),
  location: z.string().trim().min(2).max(255),
  email: z.string().trim().email().max(320),
  avatarUrl: textField,
  linkedinUrl: textField,
  githubUrl: textField,
  availability: z.string().trim().min(2).max(255),
});

async function saveRow<T extends { id?: number }>(table: any, input: T, prepare: (value: T) => Record<string, unknown>) {
  const db = getDb();
  const values = prepare(input);
  if (input.id) {
    await db.update(table).set(values).where(eq(table.id, input.id));
    return { id: input.id };
  }
  const [{ id }] = await db.insert(table).values(values).returning({ id: table.id });
  return { id };
}

export const portfolioRouter = createRouter({
  public: publicQuery.query(() => getPublicPortfolio()),
  admin: adminQuery.query(() => getAdminPortfolio()),
  saveProject: adminQuery.input(projectInput).mutation(({ input }) => saveRow(projects, input, ({ id: _id, ...value }) => ({ ...value, slug: slugify(value.slug || value.title) }))),
  deleteProject: adminQuery.input(idInput).mutation(async ({ input }) => { await getDb().delete(projects).where(eq(projects.id, input.id)); return { ok: true }; }),
  saveSkill: adminQuery.input(skillInput).mutation(({ input }) => saveRow(skills, input, ({ id: _id, ...value }) => value)),
  deleteSkill: adminQuery.input(idInput).mutation(async ({ input }) => { await getDb().delete(skills).where(eq(skills.id, input.id)); return { ok: true }; }),
  saveCaseStudy: adminQuery.input(caseStudyInput).mutation(({ input }) => saveRow(caseStudies, input, ({ id: _id, ...value }) => ({ ...value, slug: slugify(value.slug || value.title) }))),
  deleteCaseStudy: adminQuery.input(idInput).mutation(async ({ input }) => { await getDb().delete(caseStudies).where(eq(caseStudies.id, input.id)); return { ok: true }; }),
  saveBlog: adminQuery.input(blogInput).mutation(({ input }) => saveRow(blogs, input, ({ id: _id, ...value }) => ({ ...value, slug: slugify(value.slug || value.title) }))),
  deleteBlog: adminQuery.input(idInput).mutation(async ({ input }) => { await getDb().delete(blogs).where(eq(blogs.id, input.id)); return { ok: true }; }),
  updateProfile: adminQuery.input(profileInput).mutation(async ({ input }) => {
    const db = getDb();
    const [existing] = await db.select().from(profiles).limit(1);
    if (existing) {
      await db.update(profiles).set(input).where(eq(profiles.id, existing.id));
      return { id: existing.id };
    }
    const [{ id }] = await db.insert(profiles).values(input).returning({ id: profiles.id });
    return { id };
  }),
});
