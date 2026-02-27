export default {
  routes: [
    {
      method: "GET" as const,
      path: "/sdui/screen/:screenKey",
      handler: "custom.getScreen",
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      method: "GET" as const,
      path: "/sdui/journey/:journeyKey",
      handler: "custom.getJourney",
      config: { auth: false, policies: [], middlewares: [] },
    },
  ],
};
