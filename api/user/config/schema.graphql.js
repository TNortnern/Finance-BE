module.exports = {
  definition: `
  type User {
    name: String
  }
  type UserPayload {
      jwt: String
      user: UsersPermissionsUser
  }
  `,
  mutation: `
    registerUser(email: String, name: String, username: String, provider: String, password: String, company_name: String, company_email: String): UserPayload,
    loginUser(identifier: String, password: String, provider: String): UserPayload!

  `,
  query: `
    useView: Int,
    isAdmin: Boolean
  `,
  resolver: {
    Query:{
      useView: {
        description: "get user views",
        resolver: "application::user.authed.useView"
      },
      isAdmin: {
        desription: "is the user an admin",
        resolver: "application::user.authed.isAdmin"
      }
    },
    Mutation: {
      registerUser: {
        description: "Alternative to register user for this application",
        resolver: "application::user.user.registerUser",
      },
      loginUser: {
        resolver: "plugins::users-permissions.Auth.callback",
      },
    },
  },
};
