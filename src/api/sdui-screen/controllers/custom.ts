import type { Core } from "@strapi/strapi";

function transformComponent(raw: any) {
  if (!raw) return null;
  const { __component, id, documentId, createdAt, updatedAt, publishedAt, ...rest } = raw;
  const component: any = { type: __component, ...rest };

  if (component.binding) component.binding = transformNested(component.binding);
  if (component.source) component.source = transformNested(component.source);
  if (component.onComplete) component.onComplete = transformNested(component.onComplete);
  if (component.visibility) component.visibility = transformNested(component.visibility);
  if (component.dataSource) component.dataSource = transformNested(component.dataSource);

  if (Array.isArray(component.validation)) component.validation = component.validation.map(transformNested);
  if (Array.isArray(component.options)) component.options = component.options.map(transformOption);
  if (Array.isArray(component.items)) component.items = component.items.map(transformOption);
  if (Array.isArray(component.rows)) component.rows = component.rows.map(transformNested);
  if (Array.isArray(component.tiers)) component.tiers = component.tiers.map(transformNested);

  return component;
}

function transformNested(raw: any) {
  if (!raw) return null;
  const { id, documentId, createdAt, updatedAt, publishedAt, __component, ...rest } = raw;
  return rest;
}

function transformOption(raw: any) {
  if (!raw) return null;
  const { id, documentId, createdAt, updatedAt, publishedAt, ...rest } = raw;
  if (rest.onTap) rest.onTap = transformAction(rest.onTap);
  return rest;
}

function transformAction(raw: any) {
  if (!raw) return null;
  const { id, documentId, createdAt, updatedAt, publishedAt, __component, ...rest } = raw;
  if (Array.isArray(rest.guards)) rest.guards = rest.guards.map((g: any) => g.ruleKey ?? g);
  return rest;
}

function buildNavigation(journey: any, step: any, sessionId?: string) {
  return {
    journeyKey: journey.journeyKey,
    sessionId: sessionId ?? null,
    current: step?.screen?.screenKey ?? null,
    screens: (journey.steps ?? [])
      .sort((a: any, b: any) => a.order - b.order)
      .map((s: any) => s.screen?.screenKey)
      .filter(Boolean),
    header: {
      title: step?.headerTitle ?? null,
      variant: step?.headerVariant ?? "default",
      showBack: step?.showBack ?? true,
      showClose: step?.showClose ?? true,
    },
    progress: step?.progressCurrent != null ? { current: step.progressCurrent, total: step.progressTotal } : null,
  };
}

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async getScreen(ctx: any) {
    try {
      const { screenKey } = ctx.params;
      const { journeyKey, sessionId } = ctx.query;

      const screen = await strapi.db.query("api::sdui-screen.sdui-screen").findOne({
        where: { screenKey, publishedAt: { $ne: null } },
        populate: ["content", "actions"],
        orderBy: { id: "desc" },
      });

      if (!screen) return ctx.notFound(`Screen not found: ${screenKey}`);

      let navigation = null;
      if (journeyKey) {
        const journey = await strapi.db.query("api::journey-definition.journey-definition").findOne({
          where: { journeyKey, publishedAt: { $ne: null } },
          populate: { steps: { populate: { screen: true } } },
        });
        if (journey) {
          const step = (journey.steps ?? []).find((s: any) => s.screen?.screenKey === screenKey);
          navigation = buildNavigation(journey, step, sessionId);
        }
      }

      ctx.body = {
        id: screen.id,
        screenKey: screen.screenKey,
        screenType: screen.screenType,
        ...(navigation ? { navigation } : {}),
        slots: {
          content: (screen.content ?? []).map(transformComponent),
          actions: (screen.actions ?? []).map(transformAction),
        },
      };
    } catch (err: any) {
      strapi.log.error("[sdui/getScreen] " + err.message);
      strapi.log.error(err.stack);
      ctx.internalServerError(err.message);
    }
  },

  async getJourney(ctx: any) {
    try {
      const journeyKey = ctx.params.journeyKey ?? ctx.query.journeyKey;

      const journey = await strapi.db.query("api::journey-definition.journey-definition").findOne({
        where: { journeyKey, publishedAt: { $ne: null } },
        populate: {
          steps: { populate: { screen: { populate: ["content", "actions"] } } },
          submissionContract: true,
          markets: true,
        },
      });

      if (!journey) return ctx.notFound(`Journey not found: ${journeyKey}`);

      const sortedSteps = (journey.steps ?? []).sort((a: any, b: any) => a.order - b.order);

      ctx.body = {
        journeyKey: journey.journeyKey,
        version: journey.version,
        name: journey.name,
        channel: journey.channel,
        stateSchema: journey.stateSchema,
        screens: sortedSteps.map((s: any) => s.screen?.screenKey).filter(Boolean),
        steps: sortedSteps.map((step: any) => ({
          order: step.order,
          analyticsTag: step.analyticsTag,
          header: {
            title: step.headerTitle ?? null,
            variant: step.headerVariant ?? "default",
            showBack: step.showBack ?? true,
            showClose: step.showClose ?? true,
          },
          progress: step.progressCurrent != null ? { current: step.progressCurrent, total: step.progressTotal } : null,
          screen: step.screen
            ? {
                id: step.screen.id,
                screenKey: step.screen.screenKey,
                screenType: step.screen.screenType,
                slots: {
                  content: (step.screen.content ?? []).map(transformComponent),
                  actions: (step.screen.actions ?? []).map(transformAction),
                },
              }
            : null,
        })),
      };
    } catch (err: any) {
      strapi.log.error("[sdui/getJourney] " + err.message);
      strapi.log.error(err.stack);
      ctx.internalServerError(err.message);
    }
  },
});
