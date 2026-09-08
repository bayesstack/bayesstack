import { describe, it, expect } from "vitest";
import {
  COMPANY_CONFIG,
  COMPANY_NAME,
  LEGAL_ENTITY_NAME,
  PRODUCT_NAME,
  TRADE_NAME,
  COMPANY_CIN,
  COMPANY_ROC,
  COMPANY_REGISTERED_ADDRESS,
  COMPANY_INCORPORATION_DATE,
  COMPANY_DPO_ADDRESS,
  getCopyrightNotice,
  getProductCopyrightNotice,
  getLegalAttribution,
} from "../../../assets/src";

describe("Company & Brand Global Configuration", () => {
  it("should have correct legal company name and product name configured", () => {
    expect(COMPANY_CONFIG.legalName).toBe("Ahsinam Technologies Private Limited");
    expect(COMPANY_CONFIG.legalNameCaps).toBe("AHSINAM TECHNOLOGIES PRIVATE LIMITED");
    expect(COMPANY_CONFIG.productName).toBe("BayesStack");
    expect(COMPANY_NAME).toBe("Ahsinam Technologies Private Limited");
    expect(LEGAL_ENTITY_NAME).toBe("Ahsinam Technologies Private Limited");
    expect(PRODUCT_NAME).toBe("BayesStack");
    expect(TRADE_NAME).toBe("Ahsinam Technologies");
  });

  it("should contain official MCA registration and CIN metadata", () => {
    expect(COMPANY_CONFIG.cin).toBe("U85500MH2024PTC424430");
    expect(COMPANY_CIN).toBe("U85500MH2024PTC424430");
    expect(COMPANY_CONFIG.roc).toBe("ROC Mumbai");
    expect(COMPANY_ROC).toBe("ROC Mumbai");
    expect(COMPANY_CONFIG.incorporationDate).toBe("April 29, 2024");
    expect(COMPANY_INCORPORATION_DATE).toBe("April 29, 2024");
    expect(COMPANY_CONFIG.jurisdiction).toBe("India");
    expect(COMPANY_CONFIG.entityType).toBe("Private Limited Company");
    expect(COMPANY_CONFIG.entityStatus).toBe("Active");
    expect(COMPANY_CONFIG.industryClassification).toBe("Educational Support Services");
  });

  it("should contain structured and full registered office addresses", () => {
    expect(COMPANY_CONFIG.registeredAddress).toBe(
      "B.K.-1588, ROOM NO-5, SECTION 27, NEAR SATRAMDAS HOSPITAL, Ulhasnagar-4, Thane District, Maharashtra, India, 421004"
    );
    expect(COMPANY_REGISTERED_ADDRESS).toBe(
      "B.K.-1588, ROOM NO-5, SECTION 27, NEAR SATRAMDAS HOSPITAL, Ulhasnagar-4, Thane District, Maharashtra, India, 421004"
    );
    expect(COMPANY_CONFIG.registeredOffice.city).toBe("Ulhasnagar-4");
    expect(COMPANY_CONFIG.registeredOffice.district).toBe("Thane District");
    expect(COMPANY_CONFIG.registeredOffice.state).toBe("Maharashtra");
    expect(COMPANY_CONFIG.registeredOffice.postalCode).toBe("421004");
    expect(COMPANY_CONFIG.registeredOffice.landmark).toBe("NEAR SATRAMDAS HOSPITAL");
    expect(COMPANY_DPO_ADDRESS).toContain("Ulhasnagar-4");
  });

  it("should generate standardized copyright notices", () => {
    const currentYear = new Date().getFullYear();
    expect(getCopyrightNotice(2026)).toBe("© 2026 Ahsinam Technologies Private Limited. All rights reserved.");
    expect(getCopyrightNotice()).toBe(`© ${currentYear} Ahsinam Technologies Private Limited. All rights reserved.`);
    expect(getProductCopyrightNotice(2026)).toBe("© 2026 BayesStack by Ahsinam Technologies Private Limited. All rights reserved.");
  });

  it("should generate legal attribution with CIN and ROC", () => {
    const attribution = getLegalAttribution();
    expect(attribution).toContain("Ahsinam Technologies Private Limited");
    expect(attribution).toContain("U85500MH2024PTC424430");
    expect(attribution).toContain("ROC Mumbai");
    expect(attribution).toContain("421004");
  });

  it("should contain compliance and contact emails", () => {
    expect(COMPANY_CONFIG.privacyEmail).toBe("privacy@bayesstack.com");
    expect(COMPANY_CONFIG.securityEmail).toBe("security@bayesstack.com");
    expect(COMPANY_CONFIG.supportEmail).toBe("support@bayesstack.com");
  });
});
