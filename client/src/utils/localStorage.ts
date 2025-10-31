import { IGenericObject } from "types";

export function loadState(KEY: string) {
  try {
    const serializedState = localStorage.getItem(KEY);
    if (!serializedState) return undefined;
    return JSON.parse(serializedState);
  } catch (e) {
    return undefined;
  }
}

export async function saveState(state: IGenericObject, KEY: string) {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(KEY, serializedState);
  } catch (e) {
    //
  }
}

export function getToken(): string | null {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // support either { token } or { auth: { token } }
    return parsed?.token || parsed?.auth?.token || null;
  } catch (e) {
    return null;
  }
}
