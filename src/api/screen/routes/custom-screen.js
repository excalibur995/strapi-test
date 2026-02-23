// src/api/screen/routes/custom-screen.js

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/screens/by-id/:screenId",
      handler: "screen.findByScreenId",
      config: {
        auth: false, // Set to true if you need authentication
      },
    },
  ],
};
