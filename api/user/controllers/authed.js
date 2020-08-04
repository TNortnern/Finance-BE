module.exports = {
  useView: async (ctx) => {
    if (!ctx.state.user) return 0;
    let user;
    // admins will always be able to view no matter what so we don't do any checking
    if (ctx.state.user.role.name === "Administrator") return 1000;
    if (ctx.state.user.views_left > 0) {
      user = await strapi
        .query("user", "users-permissions")
        .update(
          { id: ctx.state.user.id },
          { views_left: ctx.state.user.views_left - 1 }
        );
      return user.views_left;
    }
    return 0;
  },
  isAdmin: async (ctx) => {
    if (ctx.state.user.role.name === "Administrator") return true;
    ctx.throw('400', 'Unauthorized')
  }
};
