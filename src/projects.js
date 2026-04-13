/**
 * Project schema and localStorage persistence.
 *
 * A project is a complete snapshot of the sequencer state:
 * {
 *   name: "My groove",
 *   createdAt: "2026-04-13T...",
 *   updatedAt: "2026-04-13T...",
 *   bpm: 120,
 *   swing: 16,
 *   tracks: [
 *     {
 *       pulses: 3,
 *       steps: 8,
 *       rotation: 0,
 *       note: 42,
 *       channel: 10,
 *       velocity: 80,
 *       muted: false,
 *       midiOutput: "internal"
 *     },
 *     ...
 *   ]
 * }
 */

const STORAGE_KEY = "euclid-rhythm-projects";

/**
 * Default track for new projects
 */
export const DEFAULT_TRACKS = [
  { pulses: 3, steps: 8, rotation: 0, note: 42, channel: 10, velocity: 80, muted: false, midiOutput: "internal" },
  { pulses: 2, steps: 5, rotation: 1, note: 44, channel: 10, velocity: 62, muted: false, midiOutput: "internal" },
];

export const DEFAULT_BPM = 120;
export const DEFAULT_SWING = 16;

/**
 * Create a project object from current state
 */
export function createProject(name, bpm, swing, tracks) {
  const now = new Date().toISOString();
  return {
    id: `proj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: name || "Untitled",
    createdAt: now,
    updatedAt: now,
    bpm,
    swing,
    tracks: tracks.map(t => ({
      pulses: t.pulses,
      steps: t.steps,
      rotation: t.rotation,
      note: t.note,
      channel: t.channel,
      velocity: t.velocity,
      muted: t.muted,
      midiOutput: "internal", // always save as internal — device IDs change between sessions
    })),
  };
}

/**
 * Load all saved projects from localStorage
 */
export function loadProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const projects = JSON.parse(raw);
    if (!Array.isArray(projects)) return [];
    return projects;
  } catch (e) {
    console.warn("Failed to load projects:", e);
    return [];
  }
}

/**
 * Save a project (add or update by id)
 */
export function saveProject(project) {
  try {
    const projects = loadProjects();
    const idx = projects.findIndex(p => p.id === project.id);
    project.updatedAt = new Date().toISOString();
    if (idx >= 0) {
      projects[idx] = project;
    } else {
      projects.unshift(project); // newest first
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return projects;
  } catch (e) {
    console.warn("Failed to save project:", e);
    return loadProjects();
  }
}

/**
 * Delete a project by id
 */
export function deleteProject(id) {
  try {
    const projects = loadProjects().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return projects;
  } catch (e) {
    console.warn("Failed to delete project:", e);
    return loadProjects();
  }
}
