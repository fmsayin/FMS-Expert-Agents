import { withBasePath } from "@/lib/base-path";

export function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  return fetch(withBasePath(input), init);
}
