export default {
  routes: [
    {
      method: "POST",
      path: "/kyc/check",
      handler: "kyc.check",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
