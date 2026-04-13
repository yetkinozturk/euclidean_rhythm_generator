import { useState, useEffect, useRef, useCallback } from "react";
import * as Tone from "tone";
import { euclidean, rotatePattern } from "./euclidean.js";
import { PRESET_GROUPS } from "./presets.js";
import About from "./About.jsx";

// ── MIDI helpers ──
const MIDI_NOTES = [];
for (let oct = 0; oct <= 8; oct++) {
  for (const n of ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"]) {
    MIDI_NOTES.push(`${n}${oct}`);
    if (MIDI_NOTES.length >= 128) break;
  }
}

const DRUM_MAP = {
  36: "Kick", 37: "Side Stick", 38: "Snare", 39: "Clap",
  40: "Snare 2", 41: "Low Tom", 42: "Closed HH", 43: "Low Tom 2",
  44: "Pedal HH", 45: "Mid Tom", 46: "Open HH", 47: "Mid Tom 2",
  48: "Hi Tom", 49: "Crash", 50: "Hi Tom 2", 51: "Ride",
};

// ── Track colors ──
const TRACK_COLORS = [
  { h: "#e8ff47", a: "#bfd43a", ring: "rgba(232,255,71,0.15)", bg: "rgba(232,255,71,0.03)" },
  { h: "#47ffe8", a: "#36c4b3", ring: "rgba(71,255,232,0.15)", bg: "rgba(71,255,232,0.03)" },
  { h: "#ff6b6b", a: "#c45252", ring: "rgba(255,107,107,0.15)", bg: "rgba(255,107,107,0.03)" },
  { h: "#a78bfa", a: "#8468d8", ring: "rgba(167,139,250,0.15)", bg: "rgba(167,139,250,0.03)" },
  { h: "#ff9f43", a: "#cc7e35", ring: "rgba(255,159,67,0.15)", bg: "rgba(255,159,67,0.03)" },
  { h: "#54a0ff", a: "#4380cc", ring: "rgba(84,160,255,0.15)", bg: "rgba(84,160,255,0.03)" },
];

// ── Circle Sequencer Visualization ──
function CircleSequencer({ pattern, currentStep, rotation, color, size = 200, pulses, steps }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 18;
  const dotR = size > 160 ? 7 : 5;

  const points = pattern.map((val, i) => {
    const angle = ((2 * Math.PI) / pattern.length) * i - Math.PI / 2;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      active: val === 1,
      index: i,
    };
  });

  const activePoints = points.filter((p) => p.active);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r + 2} fill="none" stroke={color.ring} strokeWidth="4" opacity="0.4" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.60)" strokeWidth="1" />

      {activePoints.length > 2 && (
        <polygon
          points={activePoints.map((p) => `${p.x},${p.y}`).join(" ")}
          fill={color.ring}
          stroke={color.a}
          strokeWidth="1"
          opacity="0.5"
        />
      )}
      {activePoints.length === 2 && (
        <line
          x1={activePoints[0].x} y1={activePoints[0].y}
          x2={activePoints[1].x} y2={activePoints[1].y}
          stroke={color.a} strokeWidth="1" opacity="0.5"
        />
      )}

      {points.map((p, i) => {
        const isCurrent = i === currentStep;
        return (
          <g key={i}>
            {isCurrent && (
              <circle cx={p.x} cy={p.y} r={dotR + 5} fill="none"
                stroke={color.h} strokeWidth="2"
                className="pulse-ring"
              />
            )}
            <circle
              cx={p.x} cy={p.y}
              r={isCurrent ? dotR + 2 : dotR}
              fill={p.active ? (isCurrent ? "#fff" : color.h) : "rgba(255,255,255,0.30)"}
              stroke={p.active ? color.a : "rgba(255,255,255,0.60)"}
              strokeWidth={p.active ? 1.5 : 0.5}
              style={{ transition: "all 0.08s ease" }}
            />
          </g>
        );
      })}

      <text x={cx} y={cy - 4} textAnchor="middle" fill={color.h}
        style={{ fontSize: "16px", fontWeight: 700, fontFamily: "inherit" }}>
        {pulses},{steps}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="rgba(255,255,255,0.55)"
        style={{ fontSize: "10px", fontFamily: "inherit" }}>
        rot {rotation}
      </text>
    </svg>
  );
}

// ── Knob Control ──
function KnobControl({ value, min, max, onChange, label, color, size = 56 }) {
  const dragRef = useRef(null);
  const range = max - min;
  const norm = range > 0 ? (value - min) / range : 0;
  const angle = -135 + norm * 270;
  const r = size / 2 - 6;
  const cx = size / 2;
  const cy = size / 2;

  const handlePointerDown = (e) => {
    e.preventDefault();
    dragRef.current = { startY: e.clientY, startVal: value };
    const onMove = (ev) => {
      const dy = dragRef.current.startY - ev.clientY;
      const newVal = Math.round(Math.min(max, Math.max(min, dragRef.current.startVal + dy * (range / 150))));
      onChange(newVal);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, userSelect: "none" }}>
      <svg width={size} height={size} style={{ cursor: "ns-resize", touchAction: "none" }} onPointerDown={handlePointerDown}>
        <circle cx={cx} cy={cy} r={r} fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.30)" strokeWidth="2" />
        <line
          x1={cx} y1={cy}
          x2={cx + (r - 4) * Math.cos((angle - 90) * Math.PI / 180)}
          y2={cy + (r - 4) * Math.sin((angle - 90) * Math.PI / 180)}
          stroke={color} strokeWidth="2.5" strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={3} fill={color} opacity="0.6" />
      </svg>
      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.60)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </span>
      <span style={{ fontSize: "13px", color: "#fff", fontWeight: 600 }}>{value}</span>
    </div>
  );
}

// ── Track Row ──
function TrackRow({ track, index, color, currentStep, onUpdate, onRemove, midiOutputs }) {
  const [presetOpen, setPresetOpen] = useState(false);
  const presetBtnRef = useRef(null);
  const pattern = euclidean(track.pulses, track.steps);
  const rotated = rotatePattern(pattern, track.rotation);

  const applyPreset = (preset) => {
    onUpdate({ ...track, pulses: preset.pulses, steps: preset.steps, rotation: preset.rotation });
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 16,
      padding: "16px 20px",
      background: track.muted ? "rgba(255,255,255,0.10)" : color.bg,
      borderRadius: 12,
      border: `1px solid ${track.muted ? "rgba(255,255,255,0.60)" : "rgba(255,255,255,0.10)"}`,
      opacity: track.muted ? 0.45 : 1,
      transition: "all 0.2s",
      flexWrap: "wrap",
      position: "relative",
    }}>
      {/* Circle viz + preset button underneath */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <CircleSequencer
          pattern={rotated} currentStep={currentStep >= 0 ? currentStep % track.steps : -1} rotation={track.rotation}
          color={color} size={140} pulses={track.pulses} steps={track.steps}
        />
        <button
          ref={presetBtnRef}
          onClick={() => setPresetOpen(!presetOpen)}
          style={{
            padding: "3px 10px", borderRadius: 5, fontSize: 9,
            background: presetOpen ? `${color.ring}` : "rgba(0,0,0,0.25)",
            border: presetOpen ? `1px solid ${color.a}88` : `1px solid ${color.a}44`,
            color: color.h,
            cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
            letterSpacing: "0.06em", textTransform: "uppercase",
            transition: "all 0.15s",
          }}
        >
          ♫ Presets
        </button>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <KnobControl value={track.pulses} min={0} max={track.steps}
          onChange={(v) => onUpdate({ ...track, pulses: v })} label="Hits" color={color.h} />
        <KnobControl value={track.steps} min={1} max={32}
          onChange={(v) => onUpdate({ ...track, steps: v, pulses: Math.min(track.pulses, v), rotation: track.rotation % v })}
          label="Steps" color={color.h} />
        <KnobControl value={track.rotation} min={0} max={Math.max(track.steps - 1, 0)}
          onChange={(v) => onUpdate({ ...track, rotation: v })} label="Rot" color={color.h} />
        <KnobControl value={track.velocity} min={1} max={127}
          onChange={(v) => onUpdate({ ...track, velocity: v })} label="Vel" color={color.h} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 120 }}>
        <label className="ctrl-label">Note</label>
        <select value={track.note} onChange={(e) => onUpdate({ ...track, note: parseInt(e.target.value) })}
          style={selectStyle}>
          {Object.entries(DRUM_MAP).map(([num, name]) => (
            <option key={num} value={num}>{name} ({num})</option>
          ))}
          <option disabled>───────</option>
          {MIDI_NOTES.slice(24, 96).map((name, i) => (
            <option key={i + 24} value={i + 24}>{name}</option>
          ))}
        </select>

        <label className="ctrl-label" style={{ marginTop: 4 }}>MIDI Ch</label>
        <select value={track.channel} onChange={(e) => onUpdate({ ...track, channel: parseInt(e.target.value) })}
          style={selectStyle}>
          {Array.from({ length: 16 }, (_, i) => (
            <option key={i} value={i + 1}>Ch {i + 1}{i === 9 ? " (Drums)" : ""}</option>
          ))}
        </select>

        {midiOutputs.length > 0 && (
          <>
            <label className="ctrl-label" style={{ marginTop: 4 }}>Output</label>
            <select value={track.midiOutput || "internal"}
              onChange={(e) => onUpdate({ ...track, midiOutput: e.target.value })}
              style={selectStyle}>
              <option value="internal">Internal Synth</option>
              {midiOutputs.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginLeft: "auto" }}>
        <button onClick={() => onUpdate({ ...track, muted: !track.muted })}
          style={{
            width: 36, height: 36, borderRadius: 8,
            background: track.muted ? "rgba(255,107,107,0.15)" : "rgba(0,0,0,0.25)",
            border: track.muted ? "1px solid rgba(255,107,107,0.5)" : `1px solid ${color.a}44`,
            color: track.muted ? "#ff6b6b" : color.h,
            cursor: "pointer", fontSize: 14, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s",
          }}
          title={track.muted ? "Unmute" : "Mute"}>M</button>
        <button onClick={onRemove}
          style={{
            width: 36, height: 36, borderRadius: 8,
            background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,107,107,0.25)",
            color: "rgba(255,107,107,0.6)", cursor: "pointer", fontSize: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s",
          }}
          title="Remove track">×</button>
      </div>

      {/* Preset popover */}
      <TrackPresetPicker
        isOpen={presetOpen}
        onToggle={() => setPresetOpen(false)}
        onApplyPreset={applyPreset}
        color={color}
        triggerRef={presetBtnRef}
      />
    </div>
  );
}

const selectStyle = {
  background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.18)",
  color: "#fff", borderRadius: 6, padding: "4px 8px", fontSize: 12,
  fontFamily: "inherit", outline: "none",
};

// ── Per-Track Preset Picker (inline popover) ──
function TrackPresetPicker({ isOpen, onToggle, onApplyPreset, color, triggerRef }) {
  const [expandedGroup, setExpandedGroup] = useState(-1);
  const ref = useRef(null);

  // Close on outside click — but not if clicking the trigger button itself
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target) &&
          !(triggerRef?.current && triggerRef.current.contains(e.target))) {
        onToggle();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onToggle, triggerRef]);

  if (!isOpen) return null;

  return (
    <div ref={ref} style={{
      position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4,
      zIndex: 50, maxHeight: 380, overflowY: "auto",
      background: "linear-gradient(180deg, #111118 0%, #0d0d14 100%)",
      border: `1px solid ${color.a}33`,
      borderRadius: 10, padding: "12px",
      boxShadow: `0 12px 40px rgba(0,0,0,0.6), 0 0 20px ${color.ring}`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: color.h, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Choose Pattern
        </span>
        <button onClick={onToggle} style={{
          background: "none", border: "none", color: "rgba(255,255,255,0.50)",
          cursor: "pointer", fontSize: 14, padding: 2, fontFamily: "inherit",
        }}>✕</button>
      </div>

      {PRESET_GROUPS.map((group, gi) => (
        <div key={gi} style={{ marginBottom: 4 }}>
          <button
            onClick={() => setExpandedGroup(expandedGroup === gi ? -1 : gi)}
            style={{
              width: "100%", textAlign: "left", padding: "7px 10px",
              background: expandedGroup === gi ? "rgba(255,255,255,0.10)" : "transparent",
              border: "1px solid rgba(255,255,255,0.60)", borderRadius: 6,
              color: "#fff", cursor: "pointer", fontFamily: "inherit",
            }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 600 }}>{group.name}</span>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.60)" }}>
                {expandedGroup === gi ? "▾" : "▸"} {group.presets.length}
              </span>
            </div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.60)", marginTop: 1 }}>
              {group.description}
            </div>
          </button>

          {expandedGroup === gi && (
            <div style={{ padding: "6px 0 2px 0", display: "flex", flexDirection: "column", gap: 1 }}>
              {group.presets.map((preset, pi) => {
                const pat = euclidean(preset.pulses, preset.steps);
                const rotated = rotatePattern(pat, preset.rotation);
                return (
                  <button
                    key={pi}
                    onClick={() => { onApplyPreset(preset); onToggle(); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "6px 10px", borderRadius: 5,
                      background: "rgba(255,255,255,0.10)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      color: "#fff", cursor: "pointer", fontFamily: "inherit",
                      textAlign: "left", transition: "all 0.12s",
                      width: "100%",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = `${color.ring}`; e.currentTarget.style.borderColor = `${color.a}44`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.10)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; }}
                  >
                    <div style={{ display: "flex", gap: 1.5, flexShrink: 0 }}>
                      {rotated.map((v, j) => (
                        <div key={j} style={{
                          width: 4, height: 12, borderRadius: 1,
                          background: v ? color.h : "rgba(255,255,255,0.60)",
                        }} />
                      ))}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {preset.name}
                        <span style={{ fontWeight: 400, color: "rgba(255,255,255,0.50)", marginLeft: 5 }}>
                          E({preset.pulses},{preset.steps})
                        </span>
                      </div>
                      <div style={{ fontSize: 8, color: "rgba(255,255,255,0.40)", marginTop: 1 }}>
                        {preset.origin}
                      </div>
                    </div>
                  </button>
                );
              })}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "3px 0", gap: 4,
              }}>
                <span style={{ fontSize: 8, color: "rgba(255,255,255,0.60)", letterSpacing: "0.1em" }}>
                  SPARSE → DENSE
                </span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main App ──
export default function App() {
  const [tracks, setTracks] = useState([
    { pulses: 3, steps: 8, rotation: 0, note: 42, channel: 10, velocity: 80, muted: false, midiOutput: "internal" },
    { pulses: 2, steps: 5, rotation: 1, note: 44, channel: 10, velocity: 62, muted: false, midiOutput: "internal" },
  ]);

  const [bpm, setBpm] = useState(120);
  const [swing, setSwing] = useState(16);
  const [playing, setPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [midiAccess, setMidiAccess] = useState(null);
  const [midiOutputs, setMidiOutputs] = useState([]);
  const [midiStatus, setMidiStatus] = useState("Not connected");
  const [page, setPage] = useState("sequencer"); // "sequencer" | "about"

  // ── All mutable engine state lives in refs, never in React state ──
  // This prevents any React re-render from interfering with the audio loop.
  const tracksRef = useRef(tracks);
  const bpmRef = useRef(bpm);
  const swingRef = useRef(swing);
  const playingRef = useRef(false);
  const midiAccessRef = useRef(null);
  const masterStepRef = useRef(0);

  // Keep refs in sync with state (one-way: state → ref)
  useEffect(() => { tracksRef.current = tracks; }, [tracks]);
  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { swingRef.current = swing; }, [swing]);
  useEffect(() => { midiAccessRef.current = midiAccess; }, [midiAccess]);

  // Audio nodes — created once, never recreated
  const audioCtxRef = useRef(null);
  const synthRef = useRef(null);
  const membraneSynthRef = useRef(null);
  const noiseSynthRef = useRef(null);
  const schedulerRef = useRef(null); // setInterval handle
  const nextNoteTimeRef = useRef(0);
  const midiClockCounterRef = useRef(0);

  // ── Initialize Tone.js synths once ──
  useEffect(() => {
    const vol = new Tone.Volume(-6).toDestination();
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.005, decay: 0.15, sustain: 0.05, release: 0.1 },
    }).connect(vol);
    membraneSynthRef.current = new Tone.MembraneSynth({
      pitchDecay: 0.05, octaves: 6,
      envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 },
    }).connect(vol);
    const noiseVol = new Tone.Volume(-12).connect(vol);
    noiseSynthRef.current = new Tone.NoiseSynth({
      noise: { type: "white" },
      envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.04 },
    }).connect(noiseVol);

    return () => {
      synthRef.current?.dispose();
      membraneSynthRef.current?.dispose();
      noiseSynthRef.current?.dispose();
      noiseVol.dispose();
      vol.dispose();
    };
  }, []);

  // ── Initialize MIDI once ──
  useEffect(() => {
    if (!navigator.requestMIDIAccess) {
      setMidiStatus("Not supported");
      return;
    }
    navigator.requestMIDIAccess({ sysex: false }).then(
      (access) => {
        setMidiAccess(access);
        const refresh = () => {
          const outs = Array.from(access.outputs.values());
          setMidiOutputs(outs);
          setMidiStatus(outs.length > 0 ? `${outs.length} output(s) found` : "No outputs");
        };
        refresh();
        access.onstatechange = refresh;
      },
      () => setMidiStatus("Access denied"),
    );
  }, []);

  // ── Pure functions called from the scheduler — no React deps ──

  function triggerNote(track, time) {
    if (track.muted) return;
    const midiNote = track.note;
    const vel = track.velocity;

    // External MIDI
    const midi = midiAccessRef.current;
    if (track.midiOutput !== "internal" && midi) {
      const output = midi.outputs.get(track.midiOutput);
      if (output) {
        const ch = (track.channel - 1) & 0xf;
        output.send([0x90 | ch, midiNote, vel]);
        // Schedule note-off 100ms later
        output.send([0x80 | ch, midiNote, 0], performance.now() + 100);
      }
    }

    // Internal synth
    if (track.midiOutput === "internal") {
      try {
        const freq = Tone.Frequency(midiNote, "midi").toFrequency();
        if (midiNote <= 40) {
          membraneSynthRef.current?.triggerAttackRelease(freq, "16n", time, vel / 127);
        } else if (midiNote >= 42 && midiNote <= 46) {
          noiseSynthRef.current?.triggerAttackRelease("32n", time, (vel / 127) * 0.4);
        } else if (midiNote === 38 || midiNote === 39) {
          noiseSynthRef.current?.triggerAttackRelease("16n", time, (vel / 127) * 0.6);
        } else {
          synthRef.current?.triggerAttackRelease(freq, "16n", time, vel / 127);
        }
      } catch (e) {
        // Swallow synth errors — don't let them crash the scheduler
        console.warn("Synth error:", e);
      }
    }
  }

  function sendMidiClock(msgByte) {
    const midi = midiAccessRef.current;
    if (!midi) return;
    for (const output of midi.outputs.values()) {
      try { output.send([msgByte]); } catch (e) { /* ignore */ }
    }
  }

  // ── The scheduler: a lookahead setInterval that schedules notes ahead of time ──
  // Based on Chris Wilson's "A Tale of Two Clocks" pattern.
  // This runs outside React's render cycle entirely.

  const SCHEDULE_AHEAD = 0.1;  // seconds to look ahead
  const SCHEDULER_INTERVAL = 25; // ms between scheduler ticks

  function scheduleStep(stepNum, time) {
    const tracks = tracksRef.current;
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      if (track.steps <= 0) continue;
      const pattern = euclidean(track.pulses, track.steps);
      const rotated = rotatePattern(pattern, track.rotation);
      const trackStep = stepNum % track.steps;
      if (rotated[trackStep] === 1) {
        triggerNote(track, time);
      }
    }
    // Update UI on the main thread — Tone.Draw schedules to animation frame
    Tone.getDraw().schedule(() => {
      setCurrentStep(stepNum);
    }, time);
  }

  function advanceScheduler() {
    const ctx = Tone.getContext().rawContext;
    if (!ctx) return;

    const currentTime = ctx.currentTime;
    const secondsPer16th = 60.0 / bpmRef.current / 4;

    // Schedule all steps that fall within the lookahead window
    while (nextNoteTimeRef.current < currentTime + SCHEDULE_AHEAD) {
      scheduleStep(masterStepRef.current, nextNoteTimeRef.current);

      // Send 6 MIDI clock ticks per 16th note (= 24 per quarter)
      for (let c = 0; c < 6; c++) {
        sendMidiClock(0xf8);
      }

      // Apply swing: delay every other 16th note
      const swingAmount = swingRef.current / 100;
      const isOdd = masterStepRef.current % 2 === 1;
      const swingDelay = isOdd ? secondsPer16th * swingAmount * 0.5 : 0;

      nextNoteTimeRef.current += secondsPer16th + swingDelay;
      masterStepRef.current += 1;
    }
  }

  // ── Start / Stop ──
  const startStop = useCallback(async () => {
    if (playingRef.current) {
      // ── STOP ──
      if (schedulerRef.current !== null) {
        clearInterval(schedulerRef.current);
        schedulerRef.current = null;
      }
      sendMidiClock(0xfc); // MIDI Stop
      masterStepRef.current = 0;
      playingRef.current = false;
      setPlaying(false);
      setCurrentStep(-1);
    } else {
      // ── START ──
      await Tone.start();
      const ctx = Tone.getContext().rawContext;
      masterStepRef.current = 0;
      nextNoteTimeRef.current = ctx.currentTime + 0.05; // small delay to let things settle
      midiClockCounterRef.current = 0;

      sendMidiClock(0xfa); // MIDI Start

      playingRef.current = true;
      setPlaying(true);

      // Start the scheduler loop
      schedulerRef.current = setInterval(advanceScheduler, SCHEDULER_INTERVAL);
    }
  }, []); // No deps — reads everything from refs

  // ── Cleanup on unmount ──
  useEffect(() => {
    return () => {
      if (schedulerRef.current !== null) {
        clearInterval(schedulerRef.current);
        schedulerRef.current = null;
      }
      playingRef.current = false;
    };
  }, []);

  // ── Keyboard shortcut: space to play/stop ──
  useEffect(() => {
    const handler = (e) => {
      if (e.code === "Space" && e.target.tagName !== "SELECT" && e.target.tagName !== "INPUT") {
        e.preventDefault();
        startStop();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [startStop]);

  const addTrack = () => {
    if (tracks.length >= 6) return;
    setTracks([...tracks, {
      pulses: 3, steps: 8, rotation: 0, note: 42, channel: 10,
      velocity: 80, muted: false, midiOutput: "internal",
    }]);
  };

  const updateTrack = (i, t) => {
    const next = [...tracks];
    next[i] = t;
    setTracks(next);
  };

  const removeTrack = (i) => {
    if (tracks.length <= 1) return;
    setTracks(tracks.filter((_, idx) => idx !== i));
  };

  if (page === "about") {
    return <About onBack={() => setPage("sequencer")} />;
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, rgb(10, 10, 15) 0%, rgb(92, 92, 158) 40%, rgb(10, 15, 18) 100%)",
      color: "#fff",
      fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
      padding: "24px",
    }}>
      {/* Grid bg */}
      <div style={{
        position: "fixed", inset: 0, opacity: 0.04, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      <style>{`
        .ctrl-label {
          font-size: 10px;
          color: rgba(255,255,255,0.55);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-family: inherit;
        }
        @keyframes pulse-expand {
          0% { r: 10; opacity: 0.7; stroke-width: 2.5; }
          100% { r: 18; opacity: 0; stroke-width: 0.5; }
        }
        .pulse-ring {
          animation: pulse-expand 0.4s ease-out infinite;
        }
      `}</style>

      <div style={{ maxWidth: 960, margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: 32, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.50)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Euclidean Rhythm Generator
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "6px 12px", borderRadius: 8,
              background: "rgba(255,255,255,0.60)", border: "1px solid rgba(255,255,255,0.60)",
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: midiOutputs.length > 0 ? "#47ffe8" : "rgba(255,255,255,0.40)",
                boxShadow: midiOutputs.length > 0 ? "0 0 8px rgba(71,255,232,0.5)" : "none",
              }} />
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.60)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                MIDI: {midiStatus}
              </span>
            </div>

            <button onClick={() => setPage("about")} style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 10,
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.30)",
              color: "rgba(255,255,255,0.60)", cursor: "pointer",
              fontFamily: "inherit", fontWeight: 600,
              letterSpacing: "0.06em", textTransform: "uppercase",
              transition: "all 0.15s",
            }}>About</button>

          </div>
        </div>

        {/* Transport */}
        <div style={{
          display: "flex", alignItems: "center", gap: 16, marginBottom: 24,
          padding: "16px 20px", borderRadius: 12,
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)",
          flexWrap: "wrap",
        }}>
          <button onClick={startStop} style={{
            width: 52, height: 52, borderRadius: 12,
            background: playing ? "linear-gradient(135deg, #ff6b6b, #c44444)" : "linear-gradient(135deg, #e8ff47, #bfd43a)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: playing ? "0 0 24px rgba(255,107,107,0.3)" : "0 0 24px rgba(232,255,71,0.2)",
            transition: "all 0.2s",
          }}>
            {playing ? (
              <svg width="18" height="18" viewBox="0 0 18 18">
                <rect x="3" y="3" width="4" height="12" fill="#fff" rx="1" />
                <rect x="11" y="3" width="4" height="12" fill="#fff" rx="1" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18">
                <polygon points="4,2 16,9 4,16" fill="#0a0a0f" />
              </svg>
            )}
          </button>

          <KnobControl value={bpm} min={40} max={240} onChange={setBpm} label="BPM" color="#e8ff47" size={52} />
          <KnobControl value={swing} min={0} max={100} onChange={setSwing} label="Swing" color="#47ffe8" size={52} />

          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.40)", marginLeft: "auto", letterSpacing: "0.05em" }}>
            SPACE to play/stop
          </div>
        </div>

        {/* Tracks */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tracks.map((track, i) => (
            <TrackRow
              key={i} track={track} index={i}
              color={TRACK_COLORS[i % TRACK_COLORS.length]}
              currentStep={currentStep}
              onUpdate={(t) => updateTrack(i, t)}
              onRemove={() => removeTrack(i)}
              midiOutputs={midiOutputs}
            />
          ))}
        </div>

        {tracks.length < 6 && (
          <button onClick={addTrack} style={{
            width: "100%", marginTop: 8, padding: "14px", borderRadius: 12,
            border: "1px dashed rgba(255,255,255,0.30)", background: "transparent",
            color: "rgba(255,255,255,0.60)", cursor: "pointer", fontSize: 13,
            fontFamily: "inherit", transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.40)"; e.target.style.color = "rgba(255,255,255,0.65)"; }}
          onMouseLeave={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.30)"; e.target.style.color = "rgba(255,255,255,0.60)"; }}
          >+ Add Track</button>
        )}

        {/* Pattern readout */}
        <div style={{
          marginTop: 20, padding: "12px 16px", borderRadius: 10,
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)",
        }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.50)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Pattern Readout
          </span>
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
            {tracks.map((track, i) => {
              const p = euclidean(track.pulses, track.steps);
              const rotated = rotatePattern(p, track.rotation);
              const color = TRACK_COLORS[i % TRACK_COLORS.length];
              const trackStep = currentStep >= 0 ? currentStep % track.steps : -1;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: color.h, fontSize: 11, width: 50 }}>T{i + 1}</span>
                  <div style={{ display: "flex", gap: 2 }}>
                    {rotated.map((v, j) => {
                      const isActive = j === trackStep;
                      return (
                        <span key={j} style={{
                          display: "inline-block", width: 14, height: 14,
                          lineHeight: "14px", textAlign: "center", fontSize: 9,
                          borderRadius: 3,
                          background: isActive ? "#fff" : (v ? color.h : "rgba(255,255,255,0.10)"),
                          color: isActive ? "#0a0a0f" : (v ? "#0a0a0f" : "rgba(255,255,255,0.30)"),
                          fontWeight: v ? 700 : 400,
                          boxShadow: isActive ? `0 0 6px ${color.h}` : "none",
                          transition: "all 0.05s ease",
                        }}>
                          {v ? "●" : "○"}
                        </span>
                      );
                    })}
                  </div>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.40)", marginLeft: 8 }}>
                    [{rotated.join("")}]
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <p style={{
          marginTop: 24, textAlign: "center", fontSize: 10,
          color: "rgba(255,255,255,0.30)", letterSpacing: "0.08em",
        }}>
          This tool is dedicated to the people who experiment and show us new ways on our journey.
        </p>
        <div style={{
          marginTop: 10, display: "flex", justifyContent: "center",
          gap: 12, alignItems: "center",
        }}>
          <a href="https://github.com/yetkinozturk/euclidean_rhythm_generator" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 9, color: "rgba(255,255,255,0.40)", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.30)" }}>GitHub</a>
          <a href="mailto:abgtjjmka@mozmail.com"
            style={{ fontSize: 9, color: "rgba(255,255,255,0.40)", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.30)" }}>Contact</a>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.60)" }}>v1.0</span>
        </div>
      </div>
    </div>
  );
}
