export interface OnboardingSlide {
  id: number;
  characterName: string;
  dialogText: string;
  subText?: string;
  characterImage: string;
  characterPosition: "left" | "right";
  requiresInput?: boolean;
  inputType?: "radio";
  inputOptions?: string[];
}

export const onboardingSlides: OnboardingSlide[] = [
  {
    id: 1,
    characterName: "???",
    dialogText: "snorkmimimi SNOOORKKKmimimi shooooo...",
    subText: "click to continue!",
    characterImage: "/background/bunny-sleeping.png",
    characterPosition: "left",
  },
  {
    id: 2,
    characterName: "???",
    dialogText: "Oh! Hello! You woke me from my sleep!",
    subText: "click to continue!",
    characterImage: "/background/bunny-shocked.png",
    characterPosition: "left",
  },
  {
    id: 3,
    characterName: "Pancake",
    dialogText: "Welcome to Hack Club's Sleepover, {your name}! I'm Pancake, I'm here to guide you around the platform :D",
    subText: "click to continue!",
    characterImage: "/background/bunny-happy.png",
    characterPosition: "left",
  },
  {
    id: 4,
    characterName: "Pancake",
    dialogText: "Sleepover is a Hack Club event by teen girls, for teen girls. It is part of the Athena Initiative at Hack Club!",
    subText: "click to continue!",
    characterImage: "/background/bunny-talking.png",
    characterPosition: "left",
  },
  {
    id: 5,
    characterName: "Pancake",
    dialogText: "Code 30 hours (just ten hours a month!) from now until April 20th and come to a sleepover-themed hackathon in Chicago :3",
    subText: "click to continue!",
    characterImage: "/background/bunny-talking-turned.png",
    characterPosition: "left",
  },
  {
    id: 6,
    characterName: "Pancake",
    dialogText: "Sleepover is for girls, but no matter your gender, feel free to look at the platform! What pronouns do you use?",
    characterImage: "/background/bunny-talking.png",
    characterPosition: "left",
    requiresInput: true,
    inputType: "radio",
    inputOptions: ["she/her", "he/him", "they/them"],
  },
  {
    id: 7,
    characterName: "Pancake",
    dialogText: "ready to get started? create your first project now!",
    subText: "click to continue!",
    characterImage: "/background/bunny-happy-turned.png",
    characterPosition: "left",
  },
];
