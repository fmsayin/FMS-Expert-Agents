import type { RoundTableChatMessage } from "@/components/roundtable/types";

/** Static transcript preview shown before a live debate starts */
export const SAMPLE_DEBATE_MESSAGES: RoundTableChatMessage[] = [
  {
    role: "assistant",
    figureId: "churchill",
    figureName: "Churchill",
    initials: "WSC",
    era: "1874–1965",
    content:
      "Peace is not a gift of the timid. It is the vigilance of free peoples who will not bargain away their liberties for a quiet decade. In our age, artificial intelligence is a new front: we must govern it before it governs us.",
  },
  {
    role: "assistant",
    figureId: "gandhi",
    figureName: "Gandhi",
    initials: "MG",
    era: "1869–1948",
    content:
      "You speak of vigilance, yet peace born only of fear is a truce, not reconciliation. True diplomacy begins when the strong restrain themselves and the weak are heard. No algorithm should decide whose dignity matters.",
  },
  {
    role: "assistant",
    figureId: "napoleon",
    figureName: "Napoleon",
    initials: "NB",
    era: "1769–1821",
    content:
      "Sentiment does not redraw maps. Order requires institutions with teeth—treaties enforced, balances maintained. The think tank's task is to design arrangements of power that make war irrational, not merely unfashionable.",
  },
  {
    role: "user",
    content:
      "Moderator: Gentlemen—how should multilateral bodies constrain autonomous systems in crisis diplomacy?",
  },
  {
    role: "assistant",
    figureId: "churchill",
    figureName: "Churchill",
    initials: "WSC",
    era: "1874–1965",
    content:
      "By binding the great powers in law before the machine acts. A council with veto and transparency—never secret algorithms negotiating fate in the dark.",
  },
];
