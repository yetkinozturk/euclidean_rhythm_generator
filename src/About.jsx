import { euclidean, rotatePattern } from "./euclidean.js";

const LINK_STYLE = {
  color: "#47ffe8",
  textDecoration: "none",
  borderBottom: "1px solid rgba(71,255,232,0.3)",
  transition: "border-color 0.15s",
};

const EXAMPLE_RHYTHMS = [
  { name: "Tresillo", pulses: 3, steps: 8, origin: "Cuba, Latin America" },
  { name: "Son Clave", pulses: 5, steps: 8, origin: "Cuban son, salsa" },
  { name: "Bembe", pulses: 7, steps: 12, origin: "West African bell" },
  { name: "Fume-fume", pulses: 5, steps: 12, origin: "Ashanti, Ghana" },
  { name: "Bossa Nova", pulses: 5, steps: 16, origin: "Brazil" },
  { name: "Take Five", pulses: 5, steps: 9, origin: "Jazz (Brubeck)" },
  { name: "Aksak", pulses: 4, steps: 9, origin: "Turkish" },
  { name: "Khafif-e-ramal", pulses: 2, steps: 5, origin: "Persian, Arabic" },
];

const TIMELINE = [
  {
    year: "c. 300 BCE",
    title: "Euclid's Algorithm",
    color: "#a78bfa",
    text: "Euclid describes the algorithm for finding the greatest common divisor in Book VII of the Elements. It works by repeated subtraction — take the larger number, subtract the smaller, repeat with the remainder. It is the oldest non-trivial algorithm still in widespread use.",
    link: { url: "https://en.wikipedia.org/wiki/Euclidean_algorithm", label: "Euclidean algorithm" },
  },
  {
    year: "1962",
    title: "Bresenham's Line Algorithm",
    color: "#54a0ff",
    text: "Jack Bresenham at IBM develops an algorithm for drawing lines on raster displays. It distributes a smaller number of pixels as evenly as possible across a span — structurally identical to distributing beats across time steps. Bresenham likely didn't know he was implementing Euclid's algorithm in a graphical domain.",
    link: { url: "https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm", label: "Bresenham's line algorithm" },
  },
  {
    year: "2003",
    title: "Bjorklund's Algorithm",
    color: "#e8ff47",
    text: "E. Bjorklund at Los Alamos National Laboratory develops a method for distributing timing pulses evenly across time slots in neutron accelerator circuits. His implementation uses the recursive structure of the Euclidean algorithm directly: split the sequence into groups, distribute remainders, and recurse until no remainder is left.",
    link: { url: "https://cgm.cs.mcgill.ca/~godfried/publications/banff.pdf", label: "Original Bjorklund paper (via Toussaint)" },
  },
  {
    year: "2004–2005",
    title: "Toussaint's Discovery",
    color: "#ff9f43",
    text: "Godfried Toussaint, a computer scientist at McGill University, realizes that Bjorklund's algorithm generates almost all of the world's most important traditional rhythms. His 2005 paper demonstrates that cultures across the globe independently converged on the same maximally-even distributions that the algorithm produces.",
    link: { url: "http://cgm.cs.mcgill.ca/~godfried/publications/banff.pdf", label: "The Euclidean Algorithm Generates Traditional Musical Rhythms (2005)" },
  },
  {
    year: "2013",
    title: "The Geometry of Musical Rhythm",
    color: "#ff6b6b",
    text: "Toussaint publishes his comprehensive book exploring the mathematical and geometric properties of musical rhythm, expanding on his earlier research with detailed analysis of rhythm similarity, distance measures, and the deep connections between geometry and musical structure across world cultures.",
    link: { url: "https://en.wikipedia.org/wiki/The_Geometry_of_Musical_Rhythm", label: "The Geometry of Musical Rhythm (book)" },
  },
];

function PatternViz({ pulses, steps, size = 80 }) {
  const pattern = euclidean(pulses, steps);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;

  const points = pattern.map((val, i) => {
    const angle = ((2 * Math.PI) / steps) * i - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), active: val === 1 };
  });

  const activePoints = points.filter(p => p.active);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      {activePoints.length > 2 && (
        <polygon
          points={activePoints.map(p => `${p.x},${p.y}`).join(" ")}
          fill="rgba(232,255,71,0.06)" stroke="rgba(232,255,71,0.25)" strokeWidth="0.8"
        />
      )}
      {activePoints.length === 2 && (
        <line x1={activePoints[0].x} y1={activePoints[0].y}
          x2={activePoints[1].x} y2={activePoints[1].y}
          stroke="rgba(232,255,71,0.25)" strokeWidth="0.8" />
      )}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.active ? 3.5 : 2}
          fill={p.active ? "#e8ff47" : "rgba(255,255,255,0.1)"}
          stroke={p.active ? "#bfd43a" : "none"} strokeWidth="0.5" />
      ))}
    </svg>
  );
}

export default function About({ onBack }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0a0a0f 0%, #0f0f1a 40%, #0a0f12 100%)",
      color: "#fff",
      fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
      padding: "24px",
    }}>
      {/* Grid bg */}
      <div style={{
        position: "fixed", inset: 0, opacity: 0.03, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      <div style={{ maxWidth: 720, margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: 40, display: "flex", alignItems: "flex-start", justifyContent: "flex-end" }}>
          <button onClick={onBack} style={{
            padding: "6px 16px", borderRadius: 8, fontSize: 11,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.5)", cursor: "pointer",
            fontFamily: "inherit", fontWeight: 600,
            letterSpacing: "0.06em", textTransform: "uppercase",
          }}>← Back</button>
        </div>

        {/* Intro */}
        <section style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>
            The Euclidean rhythm algorithm distributes a given number of pulses
            as evenly as possible across a given number of time steps. The result
            is a maximally even pattern — one where the gaps between hits are as
            uniform as they can be.
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: "rgba(255,255,255,0.7)" }}>
            What makes this remarkable is that these mathematically optimal
            patterns match the rhythms that musicians across the world arrived at
            independently over centuries. Cuban clave, West African bell patterns,
            Turkish aksak, Brazilian bossa nova — they are all Euclidean rhythms.
            Human ears gravitate toward the patterns this algorithm produces
            because the even spacing creates rhythmic tension without chaos.
          </p>
        </section>

        {/* Timeline */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{
            fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 24,
          }}>
            Timeline
          </h2>

          <div style={{ position: "relative", paddingLeft: 28 }}>
            {/* Vertical line */}
            <div style={{
              position: "absolute", left: 5, top: 8, bottom: 8, width: 1,
              background: "linear-gradient(180deg, rgba(167,139,250,0.4), rgba(255,107,107,0.4))",
            }} />

            {TIMELINE.map((item, i) => (
              <div key={i} style={{ marginBottom: i < TIMELINE.length - 1 ? 32 : 0, position: "relative" }}>
                {/* Dot */}
                <div style={{
                  position: "absolute", left: -28 + 2, top: 6, width: 8, height: 8,
                  borderRadius: "50%", background: item.color,
                  boxShadow: `0 0 10px ${item.color}44`,
                }} />

                <div style={{
                  fontSize: 11, fontWeight: 700, color: item.color,
                  letterSpacing: "0.06em", marginBottom: 4,
                }}>
                  {item.year}
                </div>
                <div style={{
                  fontSize: 15, fontWeight: 700, color: "#fff",
                  marginBottom: 8,
                }}>
                  {item.title}
                </div>
                <p style={{
                  fontSize: 13, lineHeight: 1.75, color: "rgba(255,255,255,0.55)",
                  margin: "0 0 8px 0",
                }}>
                  {item.text}
                </p>
                <a href={item.link.url} target="_blank" rel="noopener noreferrer" style={LINK_STYLE}>
                  {item.link.label} ↗
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* The Algorithm */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{
            fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20,
          }}>
            How It Works
          </h2>

          <div style={{
            padding: "20px 24px", borderRadius: 10,
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
            marginBottom: 16,
          }}>
            <p style={{ fontSize: 13, lineHeight: 1.75, color: "rgba(255,255,255,0.6)", margin: 0 }}>
              Given <span style={{ color: "#e8ff47", fontWeight: 600 }}>k</span> pulses
              and <span style={{ color: "#47ffe8", fontWeight: 600 }}>n</span> steps,
              Bjorklund's algorithm works like dealing cards:
            </p>
            <ol style={{
              fontSize: 13, lineHeight: 2, color: "rgba(255,255,255,0.55)",
              margin: "12px 0 0 0", paddingLeft: 20,
            }}>
              <li>Start with <span style={{ color: "#e8ff47" }}>k</span> groups
                  of [<span style={{ color: "#e8ff47" }}>1</span>] and (<span style={{ color: "#47ffe8" }}>n</span>-<span style={{ color: "#e8ff47" }}>k</span>)
                  groups of [<span style={{ color: "rgba(255,255,255,0.3)" }}>0</span>]</li>
              <li>Distribute the shorter pile onto the longer pile, one per group</li>
              <li>The leftovers become the new shorter pile</li>
              <li>Repeat until only 0 or 1 remainder groups are left</li>
              <li>Concatenate everything — that's your rhythm</li>
            </ol>
          </div>

          <div style={{
            padding: "16px 20px", borderRadius: 10,
            background: "rgba(232,255,71,0.03)", border: "1px solid rgba(232,255,71,0.08)",
            fontFamily: "inherit", fontSize: 12, color: "rgba(255,255,255,0.5)",
            lineHeight: 1.8,
          }}>
            <div style={{ color: "rgba(255,255,255,0.3)", marginBottom: 8, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Example: E(3, 8) → Tresillo
            </div>
            <div>Start: &nbsp;&nbsp;[1] [1] [1] [0] [0] [0] [0] [0]</div>
            <div>Step 1:&nbsp; [1,0] [1,0] [1,0] [0] [0]</div>
            <div>Step 2:&nbsp; [1,0,0] [1,0,0] [1,0]</div>
            <div>Done: &nbsp;&nbsp;<span style={{ color: "#e8ff47" }}>1 0 0 1 0 0 1 0</span></div>
          </div>
        </section>

        {/* World Rhythms Grid */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{
            fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20,
          }}>
            World Rhythms as Euclidean Patterns
          </h2>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 8,
          }}>
            {EXAMPLE_RHYTHMS.map((r, i) => {
              const pat = euclidean(r.pulses, r.steps);
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px", borderRadius: 8,
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
                }}>
                  <PatternViz pulses={r.pulses} steps={r.steps} size={56} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>
                      {r.name}
                    </div>
                    <div style={{ fontSize: 10, color: "#e8ff47", marginTop: 1 }}>
                      E({r.pulses},{r.steps})
                    </div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
                      {r.origin}
                    </div>
                    <div style={{ display: "flex", gap: 1.5, marginTop: 4 }}>
                      {pat.map((v, j) => (
                        <div key={j} style={{
                          width: 4, height: 10, borderRadius: 1,
                          background: v ? "#e8ff47" : "rgba(255,255,255,0.06)",
                        }} />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Why it matters */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{
            fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16,
          }}>
            Why It Matters
          </h2>
          <p style={{ fontSize: 13, lineHeight: 1.8, color: "rgba(255,255,255,0.55)" }}>
            The convergence is striking: 2,300-year-old mathematics, a 1960s
            graphics algorithm, a 2003 physics lab timing tool, and centuries of
            musical tradition across every inhabited continent all arrive at the
            same structure. These cultures didn't know about Euclid's algorithm,
            but human perception favors patterns where the spacing between events
            is as uniform as possible — maximally even distributions feel balanced
            but not mechanical. The gaps create groove.
          </p>
        </section>

        {/* References */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{
            fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16,
          }}>
            References & Further Reading
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { url: "http://cgm.cs.mcgill.ca/~godfried/publications/banff.pdf", title: "The Euclidean Algorithm Generates Traditional Musical Rhythms", author: "Toussaint, G. (2005)" },
              { url: "http://cgm.cs.mcgill.ca/~godfried/publications/banff-extended.pdf", title: "The Euclidean Algorithm Generates Traditional Musical Rhythms (extended)", author: "Toussaint, G. (2005)" },
              { url: "https://ics-web.sns.ornl.gov/timing/Rep-Rate%20Tech%20Note.pdf", title: "The Theory of Rep-Rate Pattern Generation in the SNS Timing System", author: "Bjorklund, E. (2003) — Original algorithm" },
              { url: "http://cgm.cs.mcgill.ca/~godfried/rhythm-and-mathematics.html", title: "Rhythm and Mathematics", author: "Toussaint, G. — McGill University" },
              { url: "https://en.wikipedia.org/wiki/Euclidean_rhythm", title: "Euclidean rhythm", author: "Wikipedia" },
              { url: "https://en.wikipedia.org/wiki/Euclidean_algorithm", title: "Euclidean algorithm", author: "Wikipedia" },
              { url: "https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm", title: "Bresenham's line algorithm", author: "Wikipedia" },
              { url: "https://en.wikipedia.org/wiki/The_Geometry_of_Musical_Rhythm", title: "The Geometry of Musical Rhythm", author: "Toussaint, G. (2013) — Book" },
            ].map((ref, i) => (
              <a key={i} href={ref.url} target="_blank" rel="noopener noreferrer" style={{
                display: "block", padding: "10px 14px", borderRadius: 6,
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.03)",
                textDecoration: "none", transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(71,255,232,0.04)"; e.currentTarget.style.borderColor = "rgba(71,255,232,0.12)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.03)"; }}
              >
                <div style={{ fontSize: 12, color: "#47ffe8", fontWeight: 600 }}>
                  {ref.title} ↗
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
                  {ref.author}
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div style={{
          padding: "20px 0", borderTop: "1px solid rgba(255,255,255,0.04)",
          textAlign: "center",
        }}>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.15)", letterSpacing: "0.08em" }}>
            EUCLID — Euclidean Rhythm Generator • Built with React, Tone.js & Web MIDI API
          </p>
        </div>
      </div>
    </div>
  );
}
