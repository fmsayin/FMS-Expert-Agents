import type { AgentId } from "@fms/shared";
import type { AgentDefinition } from "./types";
import { aiPeace } from "./definitions/ai-peace";
import { chiefPeaceArchitect } from "./definitions/chief-peace-architect";
import { civilizationCulture } from "./definitions/civilization-culture";
import { diplomacyIr } from "./definitions/diplomacy-ir";
import { economicDev } from "./definitions/economic-dev";
import { educationYouth } from "./definitions/education-youth";
import { environmentalSecurity } from "./definitions/environmental-security";
import { ethicsRights } from "./definitions/ethics-rights";
import { humanitarian } from "./definitions/humanitarian";
import { mediaComms } from "./definitions/media-comms";
import { peaceConflict } from "./definitions/peace-conflict";
import { spaceFuture } from "./definitions/space-future";
import { strategicSecurity } from "./definitions/strategic-security";

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
