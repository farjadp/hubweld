/**
 * Case-insensitive text filter that works on both datasources.
 *
 * This project builds against two Prisma schemas: `schema.prisma` (SQLite,
 * local development) and `schema.prod.prisma` (PostgreSQL, Railway). They do
 * NOT behave the same for `contains`:
 *
 *   - SQLite  — `LIKE` is already case-insensitive for ASCII, and the SQLite
 *               connector does not support the `mode` argument at all.
 *   - Postgres — `contains` maps to case-SENSITIVE `LIKE`; matching needs
 *               `mode: "insensitive"` to become `ILIKE`.
 *
 * Without this helper, searching "arcforge" finds "ArcForge 210" in dev and
 * silently finds nothing in production — a bug that only ever appears after
 * deploy. Picking the shape from the live DATABASE_URL keeps one code path
 * correct on both.
 *
 * The return type is intentionally loose: the generated client only knows the
 * `mode` argument when it was generated from the Postgres schema.
 */
const isPostgres = /^postgres(ql)?:/i.test(process.env.DATABASE_URL ?? "");

export function contains(value: string): any {
  return isPostgres ? { contains: value, mode: "insensitive" } : { contains: value };
}
