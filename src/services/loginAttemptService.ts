import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import app from "../config/firebase";

interface LoginAttempt {
  attempts: number;
  lastAttempt: Timestamp;
  lockedUntil: Timestamp | null;
}

const MAX_ATTEMPTS = 5;
const COOLDOWN_SECONDS = 60;

export class LoginAttemptService {
  private db = getFirestore(app);

  private getAttemptsRef(email: string) {
    return doc(this.db, "loginAttempts", email);
  }

  async checkAttempts(
    email: string
  ): Promise<{ canAttempt: boolean; remainingTime?: number }> {
    try {
      const docRef = this.getAttemptsRef(email);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // First attempt
        await setDoc(docRef, {
          attempts: 0,
          lastAttempt: serverTimestamp(),
          lockedUntil: null,
        });
        return { canAttempt: true };
      }

      const data = docSnap.data() as LoginAttempt;

      // Check if account is locked
      if (data.lockedUntil) {
        const now = Timestamp.now();

        if (now.seconds < data.lockedUntil.seconds) {
          const remainingTime = Math.ceil(
            data.lockedUntil.seconds - now.seconds
          );
          return {
            canAttempt: false,
            remainingTime,
          };
        }

        // Lock period has expired, reset attempts
        await this.resetAttempts(email);
        return { canAttempt: true };
      }

      // Check if max attempts reached
      if (data.attempts >= MAX_ATTEMPTS) {
        // Lock the account
        const now = Timestamp.now();
        const lockedUntil = new Timestamp(now.seconds + COOLDOWN_SECONDS, 0);
        await setDoc(docRef, {
          ...data,
          lockedUntil,
        });
        return {
          canAttempt: false,
          remainingTime: COOLDOWN_SECONDS,
        };
      }

      return { canAttempt: true };
    } catch {
      // Default to allowing the attempt if there's an error
      return { canAttempt: true };
    }
  }

  async recordAttempt(email: string, success: boolean): Promise<void> {
    try {
      const docRef = this.getAttemptsRef(email);
      let docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // Initialize attempts for new email
        await setDoc(docRef, {
          attempts: 0,
          lastAttempt: serverTimestamp(),
          lockedUntil: null,
        });
        docSnap = await getDoc(docRef);
      }

      if (success) {
        // Reset attempts on successful login
        await this.resetAttempts(email);
        return;
      }

      const data = docSnap.data() as LoginAttempt;
      const attempts = data.attempts + 1;
      let lockedUntil: Timestamp | null = null;

      if (attempts >= MAX_ATTEMPTS) {
        const now = Timestamp.now();
        lockedUntil = new Timestamp(now.seconds + COOLDOWN_SECONDS, 0);
      }

      await setDoc(docRef, {
        attempts,
        lastAttempt: serverTimestamp(),
        lockedUntil,
      });
    } catch (error) {
      console.error("Error recording attempt:", error);
    }
  }

  private async resetAttempts(email: string): Promise<void> {
    try {
      const docRef = this.getAttemptsRef(email);
      await setDoc(docRef, {
        attempts: 0,
        lastAttempt: serverTimestamp(),
        lockedUntil: null,
      });
    } catch (error) {
      console.error("Error resetting attempts:", error);
    }
  }

  async getRemainingAttempts(email: string): Promise<number> {
    try {
      const docRef = this.getAttemptsRef(email);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // First attempt
        await setDoc(docRef, {
          attempts: 0,
          lastAttempt: serverTimestamp(),
          lockedUntil: null,
        });
        return MAX_ATTEMPTS;
      }

      const data = docSnap.data() as LoginAttempt;

      // If account is locked, return 0
      if (data.lockedUntil) {
        const now = Timestamp.now();
        if (now.seconds < data.lockedUntil.seconds) {
          return 0;
        }
        // Lock period has expired, reset attempts
        await this.resetAttempts(email);
        return MAX_ATTEMPTS;
      }

      // Return remaining attempts
      const remainingAttempts = MAX_ATTEMPTS - data.attempts;
      if (remainingAttempts <= 0) {
        // Lock the account if no attempts remaining
        const now = Timestamp.now();
        const lockedUntil = new Timestamp(now.seconds + COOLDOWN_SECONDS, 0);
        await setDoc(docRef, {
          ...data,
          lockedUntil,
        });
        return 0;
      }

      return remainingAttempts;
    } catch (error) {
      console.error("Error getting remaining attempts:", error);
      return MAX_ATTEMPTS;
    }
  }
}

export const loginAttemptService = new LoginAttemptService();
