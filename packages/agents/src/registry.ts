import type { AgentId } from "@fms/shared";
import type { AgentDefinition } from "./types.js";
import { aiPeace } from "./definitions/ai-peace.js";
import { chiefPeaceArchitect } from "./definitions/chief-peace-architect.js";
import { civilizationCulture } from "./definitions/civilization-culture.js";
import { diplomacyIr } from "./definitions/diplomacy-ir.js";
import { economicDev } from "./definitions/economic-dev.js";
import { educationYouth } from "./definitions/education-youth.js";
import { environmentalSecurity } from "./definitions/environmental-security.js";
import { ethicsRights } from "./definitions/ethics-rights.js";
import { humanitarian } from "./definitions/humanitarian.js";
import { mediaComms } from "./definitions/media-comms.js";
import { peaceConflict } from "./definitions/peace-conflict.js";
import { spaceFuture } from "./definitions/space-future.js";
import { strategicSecurity } from "./definitions/strategic-security.js";

/** AgentId → definition map for all 13 peace experts. */
export const AGENT_REGISTRY: Record<AgentId, AgentDefinition> = {
  chief_peace_architect: chiefPeaceArchitect,
  peace_conflict: peaceConflict,
  diplomacy_ir: diplomacyIr,
  strategic_security: strategicSecurity,
  humanitarian,
  ai_peace: aiPeace,
  economic_dev: economicDev,
  civilization_culture: civilizationCulture,
  education_youth: educationYouth,
  media_comms: mediaComms,
  environmental_security: environmentalSecurity,
  space_future: spaceFuture,
  ethics_rights: ethicsRights,
};

export function getAgentDefinition(id: AgentId): AgentDefinition {
  return AGENT_REGISTRY[id];
}
