import type { Core } from "@strapi/strapi";

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // ── Idempotency guard ─────────────────────────────────────────────────────
    const existing = await strapi.db.query("api::sdui-screen.sdui-screen").findOne({
      where: { screenKey: "APPLY_ACCOUNT_PURPOSE", publishedAt: { $notNull: true } },
      populate: ["content"],
    });
    if (existing?.content?.length > 0) {
      strapi.log.info("[seed] Screens already have content — skipping.");
      return;
    }

    strapi.log.info("[seed] Seeding SDUI screens...");

    // ── Clean existing empty screens so we don't get duplicates ──────────────
    const existing1 = await strapi.db.query("api::sdui-screen.sdui-screen").findMany({
      where: { screenKey: "APPLY_ACCOUNT_PURPOSE" },
    });
    for (const s of existing1) {
      await strapi.entityService.delete("api::sdui-screen.sdui-screen", s.id);
    }
    const existing2 = await strapi.db.query("api::sdui-screen.sdui-screen").findMany({
      where: { screenKey: "APPLY_NPWP_INTRO" },
    });
    for (const s of existing2) {
      await strapi.entityService.delete("api::sdui-screen.sdui-screen", s.id);
    }

    // ── Rule Set ──────────────────────────────────────────────────────────────
    let rule = await strapi.db.query("api::rule-set.rule-set").findOne({
      where: { ruleKey: "APPLY_CA_ACCOUNT_PURPOSE_REQUIRED" },
    });
    if (!rule) {
      rule = await strapi.db.query("api::rule-set.rule-set").create({
        data: {
          ruleKey: "APPLY_CA_ACCOUNT_PURPOSE_REQUIRED",
          description: "Account purpose must be selected before proceeding",
          logic: { "!!": [{ var: "accountPurpose" }] },
        },
      });
    }
    strapi.log.info(`[seed] Rule Set id=${rule.id}`);

    // ── Screen 1: APPLY_ACCOUNT_PURPOSE ───────────────────────────────────────
    const screen1 = await strapi.entityService.create("api::sdui-screen.sdui-screen", {
      data: {
        screenKey: "APPLY_ACCOUNT_PURPOSE",
        screenType: "journey",
        isActive: true,
        publishedAt: new Date(),
        content: [
          {
            __component: "ui.text",
            value: "How will you use this account?",
            variant: "title",
          },
          {
            __component: "ui.radio-group",
            options: [
              {
                key: "business",
                label: "Business",
                description: "For managing business finances and day-to-day operations.",
                icon: "icon_business",
              },
              {
                key: "personal",
                label: "Personal",
                description: "For your everyday personal banking needs.",
                icon: "icon_personal",
              },
            ],
            binding: { path: "accountPurpose", scope: "journeyState" },
            validation: [{ rule: "required", message: "Please select how you will use this account" }],
          },
        ],
        actions: [
          {
            key: "s1_next",
            label: "Next",
            type: "navigate",
            payload: { direction: "next" },
            guards: [rule.id],
            analytics: { event: "apply_ca_s1_next_tap" },
          },
        ],
      } as any,
    });
    strapi.log.info(`[seed] Screen 1 id=${screen1.id}`);

    // ── Screen 2: APPLY_NPWP_INTRO ────────────────────────────────────────────
    const screen2 = await strapi.entityService.create("api::sdui-screen.sdui-screen", {
      data: {
        screenKey: "APPLY_NPWP_INTRO",
        screenType: "journey",
        isActive: true,
        publishedAt: new Date(),
        content: [
          {
            __component: "ui.text",
            value: "Let's verify your identity",
            variant: "title",
          },
          {
            __component: "ui.text",
            value:
              "We need your NPWP number to complete your application. Make sure your NPWP card is ready before continuing.",
            variant: "body",
          },
        ],
        actions: [
          {
            key: "s2_next",
            label: "Continue",
            type: "navigate",
            payload: { direction: "next" },
            analytics: { event: "apply_ca_s2_next_tap" },
          },
          {
            key: "s2_back",
            label: "Back",
            type: "navigate",
            payload: { direction: "prev" },
          },
        ],
      } as any,
    });
    strapi.log.info(`[seed] Screen 2 id=${screen2.id}`);

    // ── Journey Definition ─────────────────────────────────────────────────────
    let journey = await strapi.db.query("api::journey-definition.journey-definition").findOne({
      where: { journeyKey: "APPLY_CURRENT_ACCOUNT", publishedAt: { $notNull: true } },
    });
    if (!journey) {
      journey = await strapi.entityService.create("api::journey-definition.journey-definition", {
        data: {
          journeyKey: "APPLY_CURRENT_ACCOUNT",
          version: "1.0.0",
          name: "Apply Current Account",
          channel: "NGA",
          publishedAt: new Date(),
        } as any,
      });
    }
    strapi.log.info(`[seed] Journey id=${journey.id}`);

    // ── Journey Steps — link screens ──────────────────────────────────────────
    // Wipe existing steps so we have clean ordering
    const oldSteps = await strapi.db.query("api::journey-step.journey-step").findMany({});
    for (const s of oldSteps) {
      await strapi.entityService.delete("api::journey-step.journey-step", s.id);
    }

    await strapi.entityService.create("api::journey-step.journey-step", {
      data: {
        order: 1,
        analyticsTag: "apply_ca_s1_account_purpose",
        headerTitle: "Apply Current Account",
        headerVariant: "default",
        showBack: false,
        showClose: true,
        progressCurrent: 1,
        progressTotal: 2,
        journey: journey.id,
        screen: screen1.id,
      } as any,
    });

    await strapi.entityService.create("api::journey-step.journey-step", {
      data: {
        order: 2,
        analyticsTag: "apply_ca_s2_npwp_intro",
        headerTitle: "Identity Verification",
        headerVariant: "default",
        showBack: true,
        showClose: true,
        progressCurrent: 2,
        progressTotal: 2,
        journey: journey.id,
        screen: screen2.id,
      } as any,
    });

    strapi.log.info("[seed] ✅ Done.");
    strapi.log.info(
      '[seed] curl "http://localhost:1337/api/sdui/screen/APPLY_ACCOUNT_PURPOSE?journeyKey=APPLY_CURRENT_ACCOUNT&sessionId=sess_test"',
    );
    strapi.log.info(
      '[seed] curl "http://localhost:1337/api/sdui/screen/APPLY_NPWP_INTRO?journeyKey=APPLY_CURRENT_ACCOUNT&sessionId=sess_test"',
    );
  },
};
