/**
 * Quest Verification & Anti-Cheat Service
 * 
 * Beginner Guide:
 * In a game-first application, the server must be the single source of truth.
 * The frontend timer is merely a visual presentation for the user.
 * This service runs on the backend to guarantee:
 * 1. Casual quests can be self-reported immediately.
 * 2. Timed quests require proof of elapsed server-time calculated from `quest.startedAt`.
 * 3. Verified quests require legitimate user-provided evidence/reflection.
 * 4. Completed quests cannot be completed twice to prevent double XP/Gold exploits.
 */

export function validateQuestCompletion(quest) {
  if (!quest) {
    return { isValid: false, message: 'Quest not found.' };
  }

  // Anti-Cheat: Prevent duplicate completion / double reward exploit
  if (quest.status === 'Completed') {
    return {
      isValid: false,
      message: 'This quest has already been conquered and rewards claimed!',
    };
  }

  const type = quest.verificationType || 'Casual';

  switch (type) {
    case 'Casual': {
      // Casual quests are self-reported and can be completed whenever the user is ready
      return { isValid: true };
    }

    case 'Timed': {
      // Timed quests must have a server-recorded start time
      if (!quest.startedAt) {
        return {
          isValid: false,
          message: 'This timed quest has not been started yet. You must start the focus timer first.',
        };
      }

      const startTime = new Date(quest.startedAt).getTime();
      const now = Date.now();
      const elapsedMs = now - startTime;
      const minDurationMinutes = quest.minDurationMinutes || 1;
      const requiredMs = minDurationMinutes * 60 * 1000;

      if (elapsedMs < requiredMs) {
        const elapsedSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
        const remainingSeconds = Math.ceil((requiredMs - elapsedMs) / 1000);
        const elapsedMin = Math.floor(elapsedSeconds / 60);
        const elapsedSec = elapsedSeconds % 60;
        
        return {
          isValid: false,
          message: `Focus time incomplete! Required: ${minDurationMinutes} min. Elapsed: ${elapsedMin}m ${elapsedSec}s. (${remainingSeconds}s remaining).`,
        };
      }

      return { isValid: true };
    }

    case 'Verified': {
      // Verified quests require a non-empty proof/reflection text
      if (!quest.proofSubmission || quest.proofSubmission.trim().length < 5) {
        return {
          isValid: false,
          message: 'Verification proof or reflection is required before claiming glory. Please submit your evidence first.',
        };
      }

      return { isValid: true };
    }

    default:
      return { isValid: true };
  }
}
