export default {
  schema: {
    kind: "single",
    filePath: "prisma/schema.prisma",
  },
  migrate: {
    connection: {
      url: process.env.DATABASE_URL || "postgresql://curvy:password@localhost:5432/curvy_girls?schema=public",
    },
  },
};
