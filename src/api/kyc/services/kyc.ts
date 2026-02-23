/**
 * kyc service
 */

import axios from "axios";

export default ({ strapi }) => ({
  async getUserRegistrationState(externalUserId: string) {
    let externalData = null;

    try {
      const kycApiUrl = process.env.KYC_API_URL;
      const kycApiKey = process.env.KYC_API_KEY;

      if (kycApiUrl && kycApiKey) {
        const response = await axios.post(
          `${kycApiUrl}/user/status`,
          { userId: externalUserId },
          {
            headers: {
              Authorization: `Bearer ${kycApiKey}`,
            },
            timeout: 5000,
          },
        );
        externalData = response.data;
      } else {
        strapi.log.warn("KYC_API_URL or KYC_API_KEY not set");
      }
    } catch (error) {
      strapi.log.warn(`Failed to fetch external KYC status for user ${externalUserId}: ${error.message}`);
      externalData = null;
    }

    let localUser = null;
    try {
      localUser = await strapi.db.query("plugin::users-permissions.user").findOne({
        where: { externalUserId },
      });
    } catch (error) {
      strapi.log.error(`Failed to fetch local user for externalUserId ${externalUserId}: ${error.message}`);
    }

    // 3. Merge both sources
    const hasExternalData = !!externalData;
    const hasLocalUser = !!localUser;

    return {
      found: hasExternalData || hasLocalUser,
      hasCreditCard: externalData?.hasCreditCard ?? localUser?.hasCreditCard ?? false,
      hasAnyBankProduct: externalData?.hasAnyBankProduct ?? localUser?.hasAnyBankProduct ?? false,
      isRegisteredInApp: localUser?.isRegisteredInApp ?? false,
      source: hasExternalData ? "external_api" : "local_db",
    };
  },
});
