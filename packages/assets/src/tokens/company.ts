/**
 * BayesStack & Company Global Brand Configuration
 *
 * Single source of truth for corporate legal identity, registration identifiers (CIN, ROC),
 * product naming, contact emails, and office addresses across all monorepo applications.
 */

export interface RegisteredAddress {
  line1: string;
  line2?: string;
  landmark: string;
  city: string;
  district: string;
  state: string;
  country: string;
  postalCode: string;
  fullAddress: string;
}

export interface CompanyConfig {
  /** Registered legal corporate entity name */
  legalName: string;
  /** Capitalized legal entity name */
  legalNameCaps: string;
  /** Short trade name or commercial brand name */
  tradeName: string;
  /** Flagship product / platform name */
  productName: string;
  /** Corporate Identification Number (CIN) as per MCA */
  cin: string;
  /** Date of company incorporation */
  incorporationDate: string;
  /** Country of incorporation / legal jurisdiction */
  jurisdiction: string;
  /** Registrar of Companies office */
  roc: string;
  /** Company entity type */
  entityType: string;
  /** Ministry of Corporate Affairs (MCA) industry classification */
  industryClassification: string;
  /** Current corporate registration status */
  entityStatus: string;
  /** Official domain name */
  domain: string;
  /** Support / Helpdesk email */
  supportEmail: string;
  /** Data Protection Officer / Privacy email */
  privacyEmail: string;
  /** Security vulnerability reporting email */
  securityEmail: string;
  /** Structured registered office address */
  registeredOffice: RegisteredAddress;
  /** Formatted full registered office address string */
  registeredAddress: string;
  /** Data Protection Office physical mailing address */
  dpoAddress: string;
}

export const COMPANY_CONFIG: CompanyConfig = {
  legalName: "Ahsinam Technologies Private Limited",
  legalNameCaps: "AHSINAM TECHNOLOGIES PRIVATE LIMITED",
  tradeName: "Ahsinam Technologies",
  productName: "BayesStack",
  cin: "U85500MH2024PTC424430",
  incorporationDate: "April 29, 2024",
  jurisdiction: "India",
  roc: "ROC Mumbai",
  entityType: "Private Limited Company",
  industryClassification: "Educational Support Services",
  entityStatus: "Active",
  domain: "bayesstack.com",
  supportEmail: "support@bayesstack.com",
  privacyEmail: "privacy@bayesstack.com",
  securityEmail: "security@bayesstack.com",
  registeredOffice: {
    line1: "B.K.-1588, ROOM NO-5, SECTION 27",
    landmark: "NEAR SATRAMDAS HOSPITAL",
    city: "Ulhasnagar-4",
    district: "Thane District",
    state: "Maharashtra",
    country: "India",
    postalCode: "421004",
    fullAddress:
      "B.K.-1588, ROOM NO-5, SECTION 27, NEAR SATRAMDAS HOSPITAL, Ulhasnagar-4, Thane District, Maharashtra, India, 421004",
  },
  registeredAddress:
    "B.K.-1588, ROOM NO-5, SECTION 27, NEAR SATRAMDAS HOSPITAL, Ulhasnagar-4, Thane District, Maharashtra, India, 421004",
  dpoAddress:
    "Data Protection Office, Ahsinam Technologies Private Limited, B.K.-1588, ROOM NO-5, SECTION 27, NEAR SATRAMDAS HOSPITAL, Ulhasnagar-4, Thane District, Maharashtra, India, 421004",
};

/** Shorthand constant for the registered company legal name */
export const COMPANY_NAME = COMPANY_CONFIG.legalName;

/** Shorthand constant for the registered legal entity */
export const LEGAL_ENTITY_NAME = COMPANY_CONFIG.legalName;

/** Shorthand constant for the platform product name */
export const PRODUCT_NAME = COMPANY_CONFIG.productName;

/** Shorthand constant for the trade name */
export const TRADE_NAME = COMPANY_CONFIG.tradeName;

/** Shorthand constant for the Corporate Identification Number (CIN) */
export const COMPANY_CIN = COMPANY_CONFIG.cin;

/** Shorthand constant for the registered office address */
export const COMPANY_REGISTERED_ADDRESS = COMPANY_CONFIG.registeredAddress;

/** Shorthand constant for the ROC jurisdiction */
export const COMPANY_ROC = COMPANY_CONFIG.roc;

/** Shorthand constant for the incorporation date */
export const COMPANY_INCORPORATION_DATE = COMPANY_CONFIG.incorporationDate;

/** Shorthand constant for the DPO mailing address */
export const COMPANY_DPO_ADDRESS = COMPANY_CONFIG.dpoAddress;

/**
 * Returns a standardized copyright string.
 * Example: "© 2026 Ahsinam Technologies Private Limited. All rights reserved."
 */
export function getCopyrightNotice(year: number = new Date().getFullYear()): string {
  return `© ${year} ${COMPANY_CONFIG.legalName}. All rights reserved.`;
}

/**
 * Returns a product and company combined copyright notice.
 * Example: "© 2026 BayesStack by Ahsinam Technologies Private Limited. All rights reserved."
 */
export function getProductCopyrightNotice(year: number = new Date().getFullYear()): string {
  return `© ${year} ${COMPANY_CONFIG.productName} by ${COMPANY_CONFIG.legalName}. All rights reserved.`;
}

/**
 * Returns full legal attribution with CIN and address.
 */
export function getLegalAttribution(): string {
  return `${COMPANY_CONFIG.legalName} (CIN: ${COMPANY_CONFIG.cin}, ${COMPANY_CONFIG.roc}) | Registered Office: ${COMPANY_CONFIG.registeredAddress}`;
}
