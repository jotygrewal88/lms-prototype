// Mock AI generator for training responses
// Reads REAL data from the store: signals, skills, sources, user records
// Branches by response type to generate different content structures

import type {
  TrainingResponse,
  TrainingResponseType,
  TrainingResponseSection,
  TrainingResponseLesson,
  TrainingResponseTarget,
  TrainingResponseUrgency,
  TrainingResponseTrigger,
  SkillAction,
  DeltaChange,
} from "@/types";
import {
  getOperationalSignalById,
  getSkillV2ById,
  getLibraryItems,
  getUser,
  getUserSkillRecordsByUserId,
  getJobTitleById,
  getOrganizationProfile,
  getOperationalSignals,
} from "@/lib/store";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function makeSection(
  idPrefix: string,
  idx: number,
  title: string,
  description: string,
  lessons: TrainingResponseLesson[],
  isAssessment: boolean,
  sourceAttributions: string[] = []
): TrainingResponseSection {
  return {
    id: `${idPrefix}_s${idx}`,
    title,
    description,
    estimatedMinutes: lessons.reduce((s, l) => s + l.estimatedMinutes, 0),
    lessons,
    isAssessment,
    sourceAttributions,
  };
}

function buildTargets(
  userIds: string[],
  skillIds: string[],
  skillAction: SkillAction
): TrainingResponseTarget[] {
  return userIds.map((uid) => ({
    userId: uid,
    status: "pending" as const,
    skillActions: skillIds.map((sid) => ({ skillId: sid, action: skillAction })),
  }));
}

function urgencyFromType(type: TrainingResponseType, severity?: string): TrainingResponseUrgency {
  if (severity === "critical") return "immediate";
  if (type === "incident_retraining") return "immediate";
  if (type === "corrective_training" || type === "regulatory_update") return "urgent";
  if (type === "role_change_gap") return "blocking";
  return "standard";
}

function deadlineDaysFromType(type: TrainingResponseType): number {
  switch (type) {
    case "incident_retraining": return 3;
    case "corrective_training": return 14;
    case "near_miss_briefing": return 7;
    case "regulatory_update": return 21;
    case "delta_renewal": return 30;
    case "rebuilt_renewal": return 45;
    case "clean_renewal": return 30;
    case "role_change_gap": return 14;
    case "new_equipment_process": return 21;
    case "path_refresh": return 30;
    default: return 14;
  }
}

export interface GenerateTrainingConfig {
  type: TrainingResponseType;
  signalId?: string;
  targetUserIds: string[];
  sourceIds: string[];
  affectedSkillIds: string[];
  additionalInstructions?: string;
  generatedByUserId: string;
  triggerType: TrainingResponseTrigger;
  triggeredByRenewalSkillId?: string;
  triggeredByRoleChangeUserId?: string;
  pathId?: string;
  refreshType?: "supplemental" | "partial" | "full";
}

export async function generateTrainingResponse(
  config: GenerateTrainingConfig
): Promise<Omit<TrainingResponse, "id" | "createdAt" | "updatedAt">> {
  await delay(1500 + Math.random() * 1000);

  const signal = config.signalId ? getOperationalSignalById(config.signalId) : undefined;
  const skillNames = config.affectedSkillIds
    .map((id) => getSkillV2ById(id))
    .filter(Boolean)
    .map((s) => s!.name);
  const org = getOrganizationProfile();
  const sources = getLibraryItems().filter((s) => config.sourceIds.includes(s.id));
  const sourceAttributions = sources.map((s) => s.id);
  const severity = signal?.severity;

  const urgency = urgencyFromType(config.type, severity);
  const deadlineDays = deadlineDaysFromType(config.type);
  const deadline = new Date(Date.now() + deadlineDays * 86400000).toISOString();
  const idPrefix = `gen_${Date.now()}`;

  let sections: TrainingResponseSection[] = [];
  let title = "";
  let description = "";
  let assessmentRequired = true;
  let passingScore = 80;
  let skillAction: SkillAction = "none";
  let deltaChanges: DeltaChange[] | undefined;

  switch (config.type) {
    case "incident_retraining": {
      const incidentTitle = signal?.title || "Safety Incident";
      title = `Incident Retraining — ${skillNames.join(", ")}`;
      description = `Incident-specific retraining following: ${incidentTitle}. Covers correct procedures, root cause analysis, and prevention.`;
      skillAction = "suspend_until_complete";
      passingScore = 85;
      sections = [
        makeSection(idPrefix, 1, "Incident Review: What Happened",
          `Review of the incident: ${signal?.description || "Details pending."}`,
          [
            { title: "Incident Timeline & Contributing Factors", estimatedMinutes: 5, isAssessment: false },
            { title: "Risk Analysis: Potential Outcomes", estimatedMinutes: 5, isAssessment: false },
          ], false, sourceAttributions),
        makeSection(idPrefix, 2, "Why It Was Wrong: Procedure Violations",
          `Analysis of which procedure steps were skipped or performed incorrectly.`,
          [
            { title: "Regulatory Requirements Review", estimatedMinutes: 5, isAssessment: false },
            { title: "Procedure Deviation Analysis", estimatedMinutes: 5, isAssessment: false },
          ], false, sourceAttributions),
        makeSection(idPrefix, 3, "Correct Procedure",
          `Step-by-step walkthrough of the correct procedure for ${skillNames.join(", ")}.`,
          [
            { title: "Updated Standard Procedure", estimatedMinutes: 8, isAssessment: false },
            { title: "Practical Application Scenarios", estimatedMinutes: 7, isAssessment: false },
          ], false, sourceAttributions),
        makeSection(idPrefix, 4, "Prevention & Assessment",
          "Prevention strategies and recertification assessment.",
          [
            { title: "Prevention Checklist & Best Practices", estimatedMinutes: 5, isAssessment: false },
            { title: "Recertification Assessment", estimatedMinutes: 5, isAssessment: true },
          ], true, sourceAttributions),
      ];
      break;
    }

    case "corrective_training": {
      title = `Corrective Training — ${signal?.title || skillNames.join(", ")}`;
      description = `Corrective training to address procedure changes: ${signal?.description || "Updated procedures require retraining."}`;
      skillAction = "flag_until_complete";
      sections = [
        makeSection(idPrefix, 1, "What Changed",
          `Overview of the changes affecting ${skillNames.join(", ")}.`,
          [
            { title: "Change Overview & Impact", estimatedMinutes: 5, isAssessment: false },
            { title: "Updated Requirements", estimatedMinutes: 5, isAssessment: false },
          ], false, sourceAttributions),
        makeSection(idPrefix, 2, "Updated Procedure",
          "Detailed walkthrough of the new procedures.",
          [
            { title: "New Procedure Step-by-Step", estimatedMinutes: 8, isAssessment: false },
            { title: "Key Differences from Previous", estimatedMinutes: 5, isAssessment: false },
          ], false, sourceAttributions),
        makeSection(idPrefix, 3, "Key Differences & Assessment",
          "Summary of differences and competency assessment.",
          [
            { title: "Side-by-Side Comparison", estimatedMinutes: 5, isAssessment: false },
            { title: "Corrective Training Assessment", estimatedMinutes: 5, isAssessment: true },
          ], true, sourceAttributions),
      ];
      break;
    }

    case "near_miss_briefing": {
      title = `Safety Briefing — ${signal?.title || "Near-Miss Event"}`;
      description = `Quick safety briefing following: ${signal?.description || "A near-miss event."} No assessment required.`;
      assessmentRequired = false;
      skillAction = "none";
      sections = [
        makeSection(idPrefix, 1, "What Happened",
          `Summary of the near-miss event and contributing factors.`,
          [
            { title: "Event Summary", estimatedMinutes: 3, isAssessment: false },
            { title: "Contributing Factors", estimatedMinutes: 2, isAssessment: false },
          ], false, sourceAttributions),
        makeSection(idPrefix, 2, "What to Watch For",
          "Key safety reminders and awareness points.",
          [
            { title: "Safety Reminders & Best Practices", estimatedMinutes: 3, isAssessment: false },
            { title: "Situational Awareness Techniques", estimatedMinutes: 2, isAssessment: false },
          ], false, sourceAttributions),
      ];
      break;
    }

    case "regulatory_update": {
      title = `Regulatory Update — ${signal?.title || skillNames.join(", ")}`;
      description = `Training on regulatory changes affecting ${skillNames.join(", ")} per ${org.regulatoryFrameworks?.join(", ") || "regulatory bodies"}.`;
      skillAction = "flag_until_complete";
      passingScore = 85;
      deltaChanges = signal
        ? [
            {
              changeType: "regulatory",
              description: signal.description,
              signalId: signal.id,
            },
          ]
        : [];
      sections = [
        makeSection(idPrefix, 1, "Regulation Overview",
          "What changed and why it matters.",
          [
            { title: "Summary of Regulatory Change", estimatedMinutes: 5, isAssessment: false },
            { title: "Effective Dates & Enforcement", estimatedMinutes: 3, isAssessment: false },
          ], false, sourceAttributions),
        makeSection(idPrefix, 2, "New Requirements",
          "Detailed breakdown of new requirements.",
          [
            { title: "New Compliance Requirements", estimatedMinutes: 8, isAssessment: false },
            { title: "Documentation & Recordkeeping Changes", estimatedMinutes: 5, isAssessment: false },
          ], false, sourceAttributions),
        makeSection(idPrefix, 3, "Practical Impact",
          `How these changes affect your daily work at ${org.companyName || "the company"}.`,
          [
            { title: "Day-to-Day Procedure Changes", estimatedMinutes: 5, isAssessment: false },
            { title: "Facility-Specific Implementation", estimatedMinutes: 5, isAssessment: false },
          ], false, sourceAttributions),
        makeSection(idPrefix, 4, "Delta Summary & Assessment",
          "Summary of all changes and assessment.",
          [
            { title: "Changes Summary", estimatedMinutes: 3, isAssessment: false },
            { title: "Regulatory Update Assessment", estimatedMinutes: 7, isAssessment: true },
          ], true, sourceAttributions),
      ];
      break;
    }

    case "delta_renewal": {
      const skill = config.affectedSkillIds[0]
        ? getSkillV2ById(config.affectedSkillIds[0])
        : undefined;
      title = `Delta Renewal — ${skill?.name || skillNames.join(", ")}`;
      description = `Abbreviated renewal focusing on changes since last certification for ${skill?.name || "skill"}.`;
      skillAction = "renew";
      passingScore = 85;
      const signalsSinceCert = getOperationalSignals().filter(
        (s) => s.affectedSkillIds.some((sid) => config.affectedSkillIds.includes(sid))
      );
      deltaChanges = signalsSinceCert.slice(0, 5).map((s) => ({
        changeType: s.type === "regulatory_change" ? "regulatory" as const : "incident" as const,
        description: s.title,
        signalId: s.id,
      }));
      sections = [
        makeSection(idPrefix, 1, "Core Refresher",
          `Abbreviated review of ${skill?.name || "skill"} fundamentals.`,
          [
            { title: "Key Concepts Refresher", estimatedMinutes: 5, isAssessment: false },
            { title: "Procedure Quick Review", estimatedMinutes: 5, isAssessment: false },
          ], false, sourceAttributions),
        makeSection(idPrefix, 2, "What's Changed Since Last Certification",
          `Key changes affecting ${skill?.name || "this skill"} since your last cert.`,
          signalsSinceCert.slice(0, 3).map((s) => ({
            title: `Change: ${s.title}`,
            estimatedMinutes: 5,
            isAssessment: false,
          })).concat(signalsSinceCert.length === 0 ? [{ title: "Minor Updates Review", estimatedMinutes: 5, isAssessment: false }] : []),
          false, sourceAttributions),
        makeSection(idPrefix, 3, "Renewal Assessment",
          "Covers both core knowledge and recent changes.",
          [
            { title: "Renewal Certification Assessment", estimatedMinutes: 10, isAssessment: true },
          ], true, sourceAttributions),
      ];
      break;
    }

    case "rebuilt_renewal": {
      const skill = config.affectedSkillIds[0]
        ? getSkillV2ById(config.affectedSkillIds[0])
        : undefined;
      title = `Full Renewal — ${skill?.name || skillNames.join(", ")}`;
      description = `Full retraining for ${skill?.name || "skill"} renewal due to significant changes since last certification.`;
      skillAction = "renew";
      passingScore = 85;
      sections = [
        makeSection(idPrefix, 1, "Fundamentals",
          `Complete review of ${skill?.name || "skill"} fundamentals.`,
          [
            { title: "Core Concepts & Theory", estimatedMinutes: 15, isAssessment: false },
            { title: "Regulatory Framework", estimatedMinutes: 10, isAssessment: false },
          ], false, sourceAttributions),
        makeSection(idPrefix, 2, "Procedures & Practical Application",
          "Detailed procedural walkthrough.",
          [
            { title: "Standard Operating Procedures", estimatedMinutes: 15, isAssessment: false },
            { title: "Practical Scenarios", estimatedMinutes: 10, isAssessment: false },
          ], false, sourceAttributions),
        makeSection(idPrefix, 3, "Recent Changes & Updates",
          "All changes since your last certification.",
          [
            { title: "Industry & Regulatory Updates", estimatedMinutes: 10, isAssessment: false },
            { title: "Facility-Specific Changes", estimatedMinutes: 5, isAssessment: false },
          ], false, sourceAttributions),
        makeSection(idPrefix, 4, "Final Assessment",
          "Comprehensive recertification assessment.",
          [
            { title: "Full Certification Assessment", estimatedMinutes: 15, isAssessment: true },
          ], true, sourceAttributions),
      ];
      break;
    }

    case "clean_renewal": {
      const skill = config.affectedSkillIds[0]
        ? getSkillV2ById(config.affectedSkillIds[0])
        : undefined;
      title = `Standard Renewal — ${skill?.name || skillNames.join(", ")}`;
      description = `Standard renewal for ${skill?.name || "skill"}. No significant changes since last certification.`;
      skillAction = "renew";
      passingScore = 80;
      sections = [
        makeSection(idPrefix, 1, "Quick Refresher",
          `Brief review of ${skill?.name || "skill"} essentials.`,
          [
            { title: "Key Concepts Review", estimatedMinutes: 5, isAssessment: false },
            { title: "Procedure Refresher", estimatedMinutes: 5, isAssessment: false },
          ], false, sourceAttributions),
        makeSection(idPrefix, 2, "Renewal Assessment",
          "Standard renewal assessment.",
          [
            { title: "Renewal Assessment", estimatedMinutes: 10, isAssessment: true },
          ], true, sourceAttributions),
      ];
      break;
    }

    case "path_refresh": {
      title = "Onboarding Path Refresh";
      description = `Refreshed onboarding path content based on ${config.refreshType || "supplemental"} analysis.`;
      assessmentRequired = false;
      skillAction = "none";
      sections = [
        makeSection(idPrefix, 1, "Updated Content Summary",
          "Overview of content changes applied to the onboarding path.",
          [
            { title: "Changes Applied", estimatedMinutes: 5, isAssessment: false },
          ], false, sourceAttributions),
      ];
      break;
    }

    case "role_change_gap": {
      const user = config.triggeredByRoleChangeUserId
        ? getUser(config.triggeredByRoleChangeUserId)
        : undefined;
      const userName = user ? `${user.firstName} ${user.lastName}` : "Employee";
      title = `Role Transition Training — ${userName}`;
      description = `Gap training for ${userName} transitioning to new role. Covers ${skillNames.length} missing skill(s): ${skillNames.join(", ")}.`;
      skillAction = "grant";
      passingScore = 80;
      sections = config.affectedSkillIds.map((sid, i) => {
        const skill = getSkillV2ById(sid);
        const sName = skill?.name || sid;
        return makeSection(idPrefix, i + 1, sName,
          `Training module for ${sName}${skill?.regulatoryRef ? ` (${skill.regulatoryRef})` : ""}.`,
          [
            { title: `${sName} — Fundamentals`, estimatedMinutes: 10, isAssessment: false },
            { title: `${sName} — Practical Application`, estimatedMinutes: 10, isAssessment: false },
            { title: `${sName} — Assessment`, estimatedMinutes: 5, isAssessment: true },
          ], true, sourceAttributions);
      });
      break;
    }

    case "new_equipment_process": {
      title = `New Equipment/Process Training — ${signal?.title || skillNames.join(", ")}`;
      description = `Training for new equipment or process: ${signal?.description || "New process introduction."}`;
      skillAction = "grant";
      sections = [
        makeSection(idPrefix, 1, "Equipment/Process Overview",
          "Introduction to the new equipment or process.",
          [
            { title: "Overview & Safety Requirements", estimatedMinutes: 10, isAssessment: false },
            { title: "Components & Features", estimatedMinutes: 10, isAssessment: false },
          ], false, sourceAttributions),
        makeSection(idPrefix, 2, "Operating Procedures",
          "Standard operating procedures for the new equipment/process.",
          [
            { title: "Setup & Pre-Operation Checks", estimatedMinutes: 10, isAssessment: false },
            { title: "Standard Operation", estimatedMinutes: 10, isAssessment: false },
            { title: "Shutdown & Maintenance", estimatedMinutes: 5, isAssessment: false },
          ], false, sourceAttributions),
        makeSection(idPrefix, 3, "Safety & Assessment",
          "Safety considerations and competency assessment.",
          [
            { title: "Safety Protocols", estimatedMinutes: 5, isAssessment: false },
            { title: "Competency Assessment", estimatedMinutes: 10, isAssessment: true },
          ], true, sourceAttributions),
      ];
      break;
    }
  }

  const totalEstimatedMinutes = sections.reduce((s, sec) => s + sec.estimatedMinutes, 0);

  return {
    type: config.type,
    status: "draft",
    title,
    description,
    urgency,
    triggerType: config.triggerType,
    triggeredBySignalId: config.signalId,
    triggeredByRenewalSkillId: config.triggeredByRenewalSkillId,
    triggeredByRoleChangeUserId: config.triggeredByRoleChangeUserId,
    sections,
    totalEstimatedMinutes,
    assessmentRequired,
    passingScore: assessmentRequired ? passingScore : undefined,
    targetUserIds: config.targetUserIds,
    targets: buildTargets(config.targetUserIds, config.affectedSkillIds, skillAction),
    affectedSkillIds: config.affectedSkillIds,
    skillAction,
    sourceIds: config.sourceIds,
    sourceAttributions,
    deltaChanges,
    generatedByUserId: config.generatedByUserId,
    deadline,
    pathId: config.pathId,
    refreshType: config.refreshType,
  };
}
