import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: varchar("role", { length: 16 })
    .$type<"user" | "admin" | "super_admin">()
    .default("user")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  headline: varchar("headline", { length: 255 }).notNull(),
  subheadline: varchar("subheadline", { length: 255 }).notNull(),
  bio: text("bio").notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  avatarUrl: text("avatarUrl").notNull(),
  linkedinUrl: text("linkedinUrl").notNull(),
  githubUrl: text("githubUrl").notNull(),
  availability: varchar("availability", { length: 255 }).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  summary: text("summary").notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 120 }).notNull(),
  technologies: text("technologies").notNull(),
  imageUrl: text("imageUrl").notNull(),
  liveUrl: text("liveUrl").notNull(),
  repoUrl: text("repoUrl").notNull(),
  featured: boolean("featured").default(true).notNull(),
  published: boolean("published").default(true).notNull(),
  sortOrder: integer("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  category: varchar("category", { length: 120 }).notNull(),
  level: integer("level").default(80).notNull(),
  featured: boolean("featured").default(true).notNull(),
  published: boolean("published").default(true).notNull(),
  sortOrder: integer("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const caseStudies = pgTable("case_studies", {
  id: serial("id").primaryKey(),
  projectId: integer("projectId").references(() => projects.id, { onDelete: "set null" }),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  challenge: text("challenge").notNull(),
  approach: text("approach").notNull(),
  outcome: text("outcome").notNull(),
  imageUrl: text("imageUrl").notNull(),
  published: boolean("published").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const blogs = pgTable("blogs", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  coverUrl: text("coverUrl").notNull(),
  published: boolean("published").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Skill = typeof skills.$inferSelect;
export type CaseStudy = typeof caseStudies.$inferSelect;
export type Blog = typeof blogs.$inferSelect;
