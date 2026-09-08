/**
 * BayesStack Legal & Compliance Content (v0.1)
 *
 * Designed in compliance with:
 * - EU General Data Protection Regulation (GDPR - Regulation (EU) 2016/679)
 * - UK General Data Protection Regulation (UK GDPR / Data Protection Act 2018)
 * - US Family Educational Rights and Privacy Act (FERPA - 34 CFR Part 99)
 * - California Consumer Privacy Act / California Privacy Rights Act (CCPA/CPRA)
 * - International Data Protection & ISO/IEC 27001 Security Principles
 */

import { COMPANY_CONFIG } from "@bayesstack/assets";

export interface LegalSection {
  id: string;
  title: string;
  content: string[];
}

export interface LegalDocument {
  title: string;
  version: string;
  lastUpdated: string;
  summary: string;
  badge: string;
  sections: LegalSection[];
}

export const PRIVACY_POLICY: LegalDocument = {
  title: "Privacy Policy",
  version: "Version 1.0",
  lastUpdated: "September 2026",
  badge: "GDPR, UK GDPR & FERPA Compliant",
  summary:
    `${COMPANY_CONFIG.productName} is dedicated to safeguarding the privacy and data rights of students, educators, and researchers worldwide. This Privacy Policy details how personal and educational data is collected, processed, secured, and retained under global privacy frameworks.`,
  sections: [
    {
      id: "scope-and-roles",
      title: "1. Scope & Data Protection Roles (Controller vs. Processor)",
      content: [
        `Under the EU GDPR (Art. 28) and UK GDPR, ${COMPANY_CONFIG.legalName} (CIN: ${COMPANY_CONFIG.cin}, ${COMPANY_CONFIG.roc}) primarily operates as a Data Processor (or 'Service Provider' under CCPA/CPRA) on behalf of your educational institution, which acts as the Data Controller.`,
        `Your institution determines the administrative purposes and lawful policies for creating accounts, managing course enrolments, and processing academic records. For platform-level infrastructure telemetry, security auditing, and direct account inquiries, ${COMPANY_CONFIG.productName} (operated by ${COMPANY_CONFIG.legalName}) acts as a Data Controller.`,
        `For institutions governed by US federal education law, ${COMPANY_CONFIG.productName} operates as a 'School Official' with legitimate educational interests under FERPA (34 CFR § 99.31(a)(1)), maintaining student education records under the direct control of the institution.`,
      ],
    },
    {
      id: "data-collected",
      title: "2. Categories of Data Processed",
      content: [
        "Identity & Authentication Data: Full legal or institutional name, institutional email address (.edu / .ac.uk / .com domain), unique student/faculty identifier, role assignment (Learner, Faculty, Administrator), and cryptographically salted password hashes (Argon2id/bcrypt).",
        "Single Sign-On (SSO) Federation Metadata: SAML 2.0 / OIDC identity assertions, transient session tokens, and identity provider entity IDs transmitted during institutional authentication.",
        "Academic & Computational Activity: Course submissions, assessments, code repository executions, interactive computational notebook history, grading rubrics, and feedback annotations.",
        "Technical & Security Telemetry: Cryptographically signed HttpOnly session cookies, client IP addresses (anonymized for diagnostic metrics), browser user-agent headers, and authentication access timestamps used strictly for intrusion detection and session integrity.",
      ],
    },
    {
      id: "lawful-basis",
      title: "3. Lawful Bases for Processing (GDPR Art. 6)",
      content: [
        "Performance of a Contract (Art. 6(1)(b)): Processing is strictly necessary to deliver the educational software workspace, verify credentials, and enable curriculum participation per the institutional enterprise agreement.",
        "Legitimate Interests (Art. 6(1)(f)): Processing technical telemetry to maintain high platform availability, prevent brute-force attacks, mitigate unauthorized tenant boundary traversal, and ensure system security.",
        "Compliance with Legal Obligations (Art. 6(1)(c)): Retaining audit trail logs to comply with statutory financial, accessibility, and educational compliance mandates.",
      ],
    },
    {
      id: "data-subject-rights",
      title: "4. Your Global Privacy Rights (GDPR, UK GDPR, CCPA/CPRA)",
      content: [
        "Right of Access (GDPR Art. 15): You have the right to request confirmation of whether personal data is being processed and obtain an export of your personal and academic data.",
        "Right to Rectification (GDPR Art. 16): You may correct inaccurate or incomplete profile records directly via your account settings or institutional registrar.",
        "Right to Erasure / 'Right to be Forgotten' (GDPR Art. 17): You may request the deletion of your personal data upon completion of your academic term, subject to institutional record retention policies.",
        "Right to Restriction of Processing & Objection (GDPR Art. 18 & 21): You may contest processing activities that exceed essential educational delivery.",
        "Right to Data Portability (GDPR Art. 20): You may export your code artifacts, notebooks, and submission archives in standardized, machine-readable formats (JSON, ZIP, CSV).",
        "California Privacy Rights (CCPA/CPRA): We do NOT sell or share personal information with third parties for behavioral advertising or monetary consideration.",
      ],
    },
    {
      id: "security-standards",
      title: "5. Security Architecture & Encryption Standards",
      content: [
        "Encryption in Transit & at Rest: All data in transit is protected using TLS 1.3 with forward secrecy. All databases, persistent block storage, and backups are encrypted at rest using AES-256.",
        "Strict Tenant Isolation: Every institutional tenant is logically segregated with multi-tenant row-level access controls and tenant-scoped session validation.",
        "Session Security: Authentication sessions use cryptographically random tokens stored in HttpOnly, Secure, SameSite cookies with strict session lifetimes and automatic expiration.",
        "Zero Plaintext Credentials: Passwords are never stored in plaintext or logged. All credentials pass through secure memory-hard cryptographic hash algorithms.",
      ],
    },
    {
      id: "retention-and-transfers",
      title: "6. Data Retention, Minimization & International Transfers",
      content: [
        "Data Minimization: We only collect personal data strictly required to deliver the educational platform.",
        "Retention Period: Personal and academic data is retained for the duration of the institutional contract plus statutory retention buffers (typically 90 days post-contract termination for export, followed by cryptographic erasure).",
        `International Transfers: Where data is transferred across international borders, ${COMPANY_CONFIG.productName} relies on EU Standard Contractual Clauses (SCCs) and UK International Data Transfer Agreements (IDTA) with supplementary technical safeguards.`,
      ],
    },
    {
      id: "dpo-contact",
      title: "7. Data Protection Officer (DPO) & Contact",
      content: [
        `For data subject rights requests, institutional inquiries, or security disclosures, please contact the ${COMPANY_CONFIG.productName} Data Protection Officer at ${COMPANY_CONFIG.privacyEmail} or mail: ${COMPANY_CONFIG.dpoAddress}.`,
      ],
    },
  ],
};

export const TERMS_OF_SERVICE: LegalDocument = {
  title: "Terms of Service",
  version: "Version 1.0",
  lastUpdated: "September 2026",
  badge: "Enterprise Academic Agreement",
  summary:
    `These Terms of Service govern your access to and use of the ${COMPANY_CONFIG.productName} platform, including all multi-tenant workspaces, computational environments, and academic tools provided through your participating educational institution.`,
  sections: [
    {
      id: "acceptance-of-terms",
      title: "1. Acceptance of Terms & Institutional Authority",
      content: [
        `By accessing, signing into, or utilizing the ${COMPANY_CONFIG.productName} platform, you agree to be bound by these Terms of Service, our Privacy Policy, and any acceptable use policies established by your educational institution.`,
        "If you are using the platform on behalf of an institution, department, or laboratory, you represent that you possess the requisite authority to bind that entity to these Terms.",
      ],
    },
    {
      id: "account-integrity",
      title: "2. Authorized Access & Credential Responsibility",
      content: [
        "Accounts are issued solely for designated learners, faculty members, and authorized institutional administrators.",
        `You are responsible for maintaining the confidentiality of your authentication credentials. You must immediately notify institutional IT administrators or Security (${COMPANY_CONFIG.securityEmail}) of any suspected unauthorized access or session compromise.`,
      ],
    },
    {
      id: "acceptable-use",
      title: "3. Acceptable Use & Academic Integrity",
      content: [
        "Lawful Educational Purpose: The platform must be used exclusively for teaching, learning, computational research, and academic administration.",
        "Prohibited Activities: You agree not to: (a) reverse engineer, decompile, or extract source code from non-public platform components; (b) launch denial-of-service (DoS) attacks or deliberately overload shared computational infrastructure; (c) attempt unauthorized lateral privilege escalation across institutional tenant boundaries; or (d) upload malicious code, trojans, or unauthorized third-party proprietary data.",
        "Academic Honesty: Users must adhere to their institution's academic honor codes and plagiarism regulations during evaluations and assignments.",
      ],
    },
    {
      id: "intellectual-property",
      title: "4. Intellectual Property & Content Ownership",
      content: [
        `Institutional & User Ownership: You and your educational institution retain 100% ownership of all curricula, course materials, assignment submissions, research code, datasets, and intellectual work created or stored on the platform. ${COMPANY_CONFIG.productName} claims zero ownership over user-generated academic content.`,
        `Platform Intellectual Property: All platform software, UI components, API designs, documentation, and brand marks remain the exclusive intellectual property of ${COMPANY_CONFIG.legalName} and its licensors.`,
      ],
    },
    {
      id: "service-availability",
      title: "5. Service Availability, SLAs & Maintenance",
      content: [
        "We strive to maintain 99.9% platform availability for production academic workspaces.",
        "Scheduled maintenance windows are announced in advance and performed during low-traffic periods. Emergency security patches may be deployed without prior notice to protect infrastructure integrity.",
      ],
    },
    {
      id: "liability-disclaimer",
      title: "6. Limitation of Liability & Warranty Disclaimers",
      content: [
        `To the maximum extent permitted by applicable law, ${COMPANY_CONFIG.productName} provides the platform on an 'as is' and 'as available' basis without warranties of uninterrupted operation.`,
        `In no event shall ${COMPANY_CONFIG.legalName} or ${COMPANY_CONFIG.productName} be liable for indirect, incidental, special, or consequential damages arising from service interruptions, subject to mandatory consumer and statutory educational protections.`,
      ],
    },
    {
      id: "termination",
      title: "7. Termination & Data Portability",
      content: [
        "Upon graduation, course conclusion, or termination of an institutional license, users are provided standard transition windows to export their academic records, code repositories, and project portfolios.",
      ],
    },
    {
      id: "governing-law",
      title: "8. Governing Law & Dispute Resolution",
      content: [
        `These Terms are governed by applicable institutional enterprise contracts, the laws of ${COMPANY_CONFIG.jurisdiction} (${COMPANY_CONFIG.roc}), and relevant commercial arbitration laws, respecting local student consumer protection rights.`,
      ],
    },
  ],
};
