import { initializeApp } from "firebase-admin/app";

initializeApp();

export { dailyChallenge, getDailyChallenge } from "./dailyChallenge";
export { startDailyRun, submitDailyScore, getMyDailyStatus } from "./submitScore";
export { getTiers } from "./meta";
export { synthesizeSpeech } from "./speech";
export {
  adminGenerateChallenge,
  adminGetChallenges,
  adminGetChallengeRange,
  adminGetChallengeDetail,
  adminRerollRound,
  adminListLibrary,
  adminSaveLibraryEntry,
  adminDeleteLibraryEntry,
  adminSeedLibrary,
} from "./admin";
