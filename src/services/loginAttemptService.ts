import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import app from "../config/firebase"; // Import the initialized Firebase app

interface LoginAttempt {
  attempts: number;
  lastAttempt: Timestamp;
  lockedUntil: Timestamp | null;
}

const MAX_ATTEMPTS = 5;
const COOLDOWN_SECONDS = 60;

export class LoginAttemptService {
  private db = getFirestore(app); // Use the initialized Firebase app

  private getAttemptsRef(email: string) {
    return doc(this.db, "loginAttempts", email);
  }

  async checkAttempts(
    email: string
  ): Promise<{ canAttempt: boolean; remainingTime?: number }> {
    const docRef = this.getAttemptsRef(email);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { canAttempt: true };
    }

    const data = docSnap.data() as LoginAttempt;

    // Check if account is locked
    if (data.lockedUntil) {
      const now = Timestamp.now();

      if (now.seconds < data.lockedUntil.seconds) {
        const remainingTime = Math.ceil(data.lockedUntil.seconds - now.seconds);
        return {
          canAttempt: false,
          remainingTime,
        };
      }

      // Lock period has expired, reset attempts
      await this.resetAttempts(email);
      return { canAttempt: true };
    }

    return { canAttempt: data.attempts < MAX_ATTEMPTS };
  }

  async recordAttempt(email: string, success: boolean): Promise<void> {
    const docRef = this.getAttemptsRef(email);
    const docSnap = await getDoc(docRef);

    if (success) {
      // Reset attempts on successful login
      await this.resetAttempts(email);
      return;
    }

    const now = Timestamp.now();
    let attempts = 1;
    let lockedUntil: Timestamp | null = null;

    if (docSnap.exists()) {
      const data = docSnap.data() as LoginAttempt;
      attempts = data.attempts + 1;

      if (attempts >= MAX_ATTEMPTS) {
        lockedUntil = new Timestamp(now.seconds + COOLDOWN_SECONDS, 0);
      }
    }

    await setDoc(docRef, {
      attempts,
      lastAttempt: serverTimestamp(),
      lockedUntil: lockedUntil,
    });
  }

  private async resetAttempts(email: string): Promise<void> {
    const docRef = this.getAttemptsRef(email);
    await setDoc(docRef, {
      attempts: 0,
      lastAttempt: serverTimestamp(),
      lockedUntil: null,
    });
  }

  async getRemainingAttempts(email: string): Promise<number> {
    const docRef = this.getAttemptsRef(email);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return MAX_ATTEMPTS;
    }

    const data = docSnap.data() as LoginAttempt;
    return Math.max(0, MAX_ATTEMPTS - data.attempts);
  }
}

// Create a singleton instance
export const loginAttemptService = new LoginAttemptService();
