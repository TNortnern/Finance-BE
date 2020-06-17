if (process.env.NODE_ENV === "production") {
module.exports = ({ env }) => ({
  defaultConnection: "default",
  connections: {
    default: {
      connector: "mongoose",
      settings: {
        client: "mongo",
        host: env("DATABASE_HOST", "localhost"),
        port: env.int("DATABASE_PORT", 27017),
        database: env("DATABASE_NAME", "strapi"),
        username: env("DATABASE_USERNAME", "strapi"),
        password: env("DATABASE_PASSWORD", "strapi"),
        uri: env("DATABASE_URI"),
      },
      options: {
        authenticationDatabase: env("AUTHENTICATION_DATABASE"),
        ssl: true,
      },
    },
  },
});
} else {
  module.exports = ({ env }) => ({
    defaultConnection: "default",
    connections: {
      default: {
        connector: "bookshelf",
        settings: {
          client: "sqlite",
          filename: env("DATABASE_FILENAME", ".tmp/data.db"),
        },
        options: {
          useNullAsDefault: true,
        },
      },
    },
  });
}
