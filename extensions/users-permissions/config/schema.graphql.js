module.exports = {
  definition: `
  `,
  query: `
    self: UsersPermissionsUser
  `,
  resolver: {
    Query: {
      self: {
        resolver: "plugins::users-permissions.user.me",
      },
    },
  },
};
