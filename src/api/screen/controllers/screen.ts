"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::screen.screen", ({ strapi }) => ({
  // Custom method to find by screen_id
  async findByScreenId(ctx) {
    const { screenId } = ctx.params;

    try {
      const entries = await strapi.entityService.findMany("api::screen.screen", {
        filters: {
          screen_id: screenId,
          is_active: true, // Only return active screens
        },
        populate: "*", // Populate relations if needed
      });

      if (!entries || entries.length === 0) {
        return ctx.notFound("Screen not found");
      }

      // Return the first match (screen_id should be unique)
      return entries[0];
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Override default find to only return active screens
  async find(ctx) {
    // Add is_active filter by default
    ctx.query = {
      ...ctx.query,
      filters: {
        ...ctx.query.filters,
        is_active: true,
      },
    };

    return await super.find(ctx);
  },
}));
