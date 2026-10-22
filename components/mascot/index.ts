// ============================================================================
// FEATURE: Mascot — public barrel export
// Import from "@/components/mascot" for the full feature.
// ============================================================================

export { GuideProvider, useGuideContext } from "./guide-context";
export { useGuide, useGlobalGuideListener } from "./use-guide";
export { UveriqMascot } from "./uveriq-mascot";
export { UveriqGuide } from "./uveriq-guide";
export { GuidedTour } from "./guided-tour";
export { GuideTooltip } from "./guide-tooltip";
export type { MascotMode, TourStep } from "./guide-config";
export {
  dashboardTour,
  chatbotCreationTour,
  playgroundTour,
  contextualMessages,
  idleMessages,
  chatFaqs,
} from "./guide-config";
