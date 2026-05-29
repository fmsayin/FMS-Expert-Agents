/** Strategic Peace Recommendation Report template (stub). */
export interface SprrTemplate {
  executiveSummary: string;
  strategicAssessment: string;
  recommendations: string[];
  risks: string[];
  implementationPath: string;
}

export const DEFAULT_SPRR_TEMPLATE: SprrTemplate = {
  executiveSummary: "",
  strategicAssessment: "",
  recommendations: [],
  risks: [],
  implementationPath: "",
};
