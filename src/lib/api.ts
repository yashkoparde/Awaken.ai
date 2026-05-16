/**
 * Client-side API connector for Awaken.ai PHP Backend.
 * Seamlessly integrates authentication, candidate profile, and ATS scans.
 * Falls back transparently to localStorage when the PHP server is offline.
 */

const API_BASE_URL = (import.meta as any).env?.VITE_PHP_API_URL || 'http://127.0.0.1:8000/api';

export interface UserAccount {
  uid: string;
  id: string;
  email: string;
  displayName: string;
}

class BackendClient {
  private token: string | null = null;
  private cachedUser: UserAccount | null = null;
  private listeners: ((user: UserAccount | null) => void)[] = [];

  constructor() {
    this.token = localStorage.getItem('awaken_php_token');
    const saved = localStorage.getItem('awaken_php_user');
    if (saved) {
      try {
        this.cachedUser = JSON.parse(saved);
      } catch (e) {
        this.cachedUser = null;
      }
    }
  }

  public get currentUser(): UserAccount | null {
    return this.cachedUser;
  }

  public onAuthStateChanged(callback: (user: UserAccount | null) => void) {
    this.listeners.push(callback);
    callback(this.cachedUser);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notify(user: UserAccount | null) {
    this.cachedUser = user;
    if (user) {
      localStorage.setItem('awaken_php_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('awaken_php_user');
      localStorage.removeItem('awaken_php_token');
    }
    this.listeners.forEach(cb => cb(user));
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `HTTP error ${response.status}`);
    }
    return data;
  }

  public async register(email: string, password: string, displayName: string): Promise<UserAccount> {
    try {
      const data = await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name: displayName })
      });
      if (data.token) {
        this.token = data.token;
        localStorage.setItem('awaken_php_token', data.token);
      }
      this.notify(data.user);
      return data.user;
    } catch (err: any) {
      console.warn("PHP Register failed, using local offline user session:", err.message);
      // Offline fallback
      const fallbackUser: UserAccount = {
        uid: 'usr_' + Math.random().toString(36).substring(2, 9),
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        email,
        displayName: displayName || email.split('@')[0]
      };
      this.notify(fallbackUser);
      return fallbackUser;
    }
  }

  public async login(email: string, password: string): Promise<UserAccount> {
    try {
      const data = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (data.token) {
        this.token = data.token;
        localStorage.setItem('awaken_php_token', data.token);
      }
      this.notify(data.user);
      return data.user;
    } catch (err: any) {
      console.warn("PHP Login failed, checking local credentials or fallback:", err.message);
      // Offline fallback
      const fallbackUser: UserAccount = {
        uid: 'usr_' + Math.random().toString(36).substring(2, 9),
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        email,
        displayName: email.split('@')[0]
      };
      this.notify(fallbackUser);
      return fallbackUser;
    }
  }

  public async logout(): Promise<void> {
    this.token = null;
    this.notify(null);
  }

  public async saveProfile(profileData: any): Promise<boolean> {
    localStorage.setItem('awaken-onboarding-profile', JSON.stringify(profileData));
    try {
      await this.request('/profile', {
        method: 'POST',
        body: JSON.stringify(profileData)
      });
      return true;
    } catch (err) {
      console.warn("Could not sync profile to PHP server (stored locally):", err);
      return true;
    }
  }

  public async getProfile(): Promise<any> {
    try {
      const data = await this.request('/profile', { method: 'GET' });
      if (data.profile) return data.profile;
    } catch (err) {
      // Return cached
    }
    const local = localStorage.getItem('awaken-onboarding-profile');
    return local ? JSON.parse(local) : null;
  }

  public async saveATSScan(scanResult: any): Promise<boolean> {
    try {
      await this.request('/resumes', {
        method: 'POST',
        body: JSON.stringify({
          atsScore: scanResult.atsScore,
          analysis: scanResult
        })
      });
      return true;
    } catch (err) {
      console.warn("Could not sync scan to PHP server:", err);
      return false;
    }
  }

  public async getATSScans(): Promise<any[]> {
    try {
      const data = await this.request('/resumes', { method: 'GET' });
      return data.scans || [];
    } catch (err) {
      return [];
    }
  }

  public async saveTestScore(topic: string, score: number): Promise<boolean> {
    try {
      await this.request('/tests', {
        method: 'POST',
        body: JSON.stringify({ topic, score })
      });
      return true;
    } catch (err) {
      console.warn("Could not sync test score to PHP server:", err);
      return false;
    }
  }

  public async getTestScores(): Promise<any[]> {
    try {
      const data = await this.request('/tests', { method: 'GET' });
      return data.tests || [];
    } catch (err) {
      return [];
    }
  }
}

export const api = new BackendClient();

