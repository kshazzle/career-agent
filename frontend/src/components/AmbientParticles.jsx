/**
 * Ultra-subtle floating dust — disabled when prefers-reduced-motion
 */
const COUNT = 28;

export default function AmbientParticles() {
  return (
    <div className="cinema-particles" aria-hidden>
      {Array.from({ length: COUNT }, (_, i) => (
        <span
          key={i}
          className="cinema-particle"
          style={{
            left: `${((i * 37 + 11) % 100)}%`,
            top: `${((i * 23 + 7) % 100)}%`,
            animationDelay: `${(i % 12) * 0.8}s`,
            animationDuration: `${14 + (i % 9)}s`,
          }}
        />
      ))}
    </div>
  );
}
