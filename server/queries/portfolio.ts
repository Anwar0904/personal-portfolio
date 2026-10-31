import { and, asc, desc, eq } from "drizzle-orm";
import { blogs, caseStudies, profiles, projects, skills } from "../../db/schema.js";
import { getDb } from "./connection.js";

export async function getPublicPortfolio() {
  const db = getDb();
  const [profile] = await db.select().from(profiles).limit(1);
  const [projectRows, skillRows, caseRows, blogRows] = await Promise.all([
    db.select().from(projects).where(eq(projects.published, true)).orderBy(asc(projects.sortOrder), desc(projects.createdAt)),
    db.select().from(skills).where(eq(skills.published, true)).orderBy(asc(skills.sortOrder), asc(skills.name)),
    db.select().from(caseStudies).where(eq(caseStudies.published, true)).orderBy(desc(caseStudies.createdAt)),
    db.select().from(blogs).where(eq(blogs.published, true)).orderBy(desc(blogs.createdAt)),
  ]);
  return { profile: profile ?? null, projects: projectRows, skills: skillRows, caseStudies: caseRows, blogs: blogRows };
}

export async function getAdminPortfolio() {
  const db = getDb();
  const [profile] = await db.select().from(profiles).limit(1);
  const [projectRows, skillRows, caseRows, blogRows] = await Promise.all([
    db.select().from(projects).orderBy(asc(projects.sortOrder), desc(projects.createdAt)),
    db.select().from(skills).orderBy(asc(skills.sortOrder), asc(skills.name)),
    db.select().from(caseStudies).orderBy(desc(caseStudies.createdAt)),
    db.select().from(blogs).orderBy(desc(blogs.createdAt)),
  ]);
  return { profile: profile ?? null, projects: projectRows, skills: skillRows, caseStudies: caseRows, blogs: blogRows };
}

export async function getPublicCaseStudy(slug: string) {
  const [item] = await getDb().select().from(caseStudies).where(and(eq(caseStudies.slug, slug), eq(caseStudies.published, true))).limit(1);
  return item ?? null;
}
