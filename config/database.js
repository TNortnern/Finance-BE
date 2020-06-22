module.exports = ({ env }) => ({
  defaultConnection: "default",
  connections: {
    default: {
      connector: "mongoose",
      settings: {
        client: "mongo",
        uri: env("DATABASE_URI"),
      },
      options: {
        authenticationDatabase: env("AUTHENTICATION_DATABASE"),
        ssl: true,
      },
    },
  },
});

