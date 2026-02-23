/**
 * kyc controller
 */

export default ({ strapi }) => ({
  async check(ctx) {
    const { userId } = ctx.request.body;

    if (!userId) {
      return ctx.badRequest("userId is required in the request body");
    }

    const state = await strapi.service("api::kyc.kyc").getUserRegistrationState(userId);
    const { hasCreditCard, isRegisteredInApp, hasAnyBankProduct } = state;

    let navigation;

    if (hasCreditCard && !isRegisteredInApp) {
      navigation = {
        action: "push",
        target: "Page3",
        params: {
          skipReason: "existing_credit_card_holder",
          message: "Welcome back! We found your existing credit card.",
        },
      };
    } else if (!hasAnyBankProduct) {
      navigation = {
        action: "push",
        target: "Page2",
        params: { message: "Let's get you started with your first product." },
      };
    } else if (isRegisteredInApp) {
      navigation = {
        action: "reset",
        target: "Dashboard",
        params: { message: "You're all set!" },
      };
    } else {
      navigation = {
        action: "push",
        target: "Page2",
        params: { message: "Please complete your registration." },
      };
    }

    return ctx.send({ status: "success", userState: state, navigation });
  },
});
