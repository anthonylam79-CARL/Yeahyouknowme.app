// The maker's "how you come across" report: self vs. others across a few
// personality traits, plus closeness/conflict style, blind spots, and who
// knows them best by area. All numbers come precomputed from /api/results
// (lib/insights.js); this component only lays them out.

const KIND_LEAD = {
  blind: 'People pick up on this more than you do.',
  hidden: "You know this about yourself, but it doesn't show as strongly.",
  flip: 'People read this the opposite way from how you see it.',
  agree: 'You and the people who know you agree.',
};

function lean(text) {
  return text ? ` ("${text.toLowerCase()}")` : '';
}

function TraitRow({ t, gapsReady }) {
  const label = gapsReady && t.others !== null
    ? `${t.label}: you ${t.self} out of 100, others ${t.others} out of 100`
    : `${t.label}: you ${t.self} out of 100`;
  return (
    <div className="trait">
      <div className="trait-head">
        <strong>{t.label}</strong>
        <small>
          {t.questions} {t.questions === 1 ? 'question' : 'questions'}
        </small>
      </div>
      <div className="trait-track" role="img" aria-label={label}>
        <span className="dot dot-you" style={{ left: `${t.self}%` }} />
        {gapsReady && t.others !== null && (
          <span className="dot dot-others" style={{ left: `${t.others}%` }} />
        )}
      </div>
      <div className="trait-ends">
        <small>{t.low}</small>
        <small>{t.high}</small>
      </div>
      <p className="trait-line">{t.sentence}</p>
    </div>
  );
}

function GapItem({ item }) {
  return (
    <div className="gap">
      <strong>{item.facet}.</strong> {KIND_LEAD[item.kind]}
      <div className="miss">
        "{item.prompt}" You said {item.self}/5{lean(item.selfLean)}; people guessed {item.others}/5
        {item.othersLean ? lean(item.othersLean) : ' (around the middle)'}.
      </div>
    </div>
  );
}

function spreadText(spread, who) {
  const parts = spread
    .filter((s) => s[who] > 0)
    .sort((a, b) => b[who] - a[who])
    .map((s) => `${s.label} ${s[who]}%`);
  return parts.join(' · ');
}

export default function PsychReport({ psych }) {
  if (!psych) return null;
  const { gapsReady, gapsNeeded, basedOn } = psych;

  return (
    <>
      <div className="sep" />
      <h2>How you come across</h2>
      <p className="note">
        {gapsReady
          ? `Your own answers next to how ${basedOn} people read you.`
          : `For now this is how you see yourself. How others see you appears once ${gapsNeeded} people have taken your quiz (${basedOn} so far).`}
      </p>

      {psych.card && psych.card.highlights.length > 0 && (
        <div className="paywall">
          <h2 style={{ marginTop: 0 }}>{psych.card.title}</h2>
          <p>{psych.card.intro}</p>
          {psych.card.highlights.map((h, k) => (
            <p key={k} style={{ marginBottom: 10 }}>
              <strong>{h.label}.</strong> {h.text}
            </p>
          ))}
        </div>
      )}

      {psych.profile.length > 0 && (
        <>
          <div className="legend">
            <span>
              <i className="dot dot-you" /> You
            </span>
            {gapsReady && (
              <span>
                <i className="dot dot-others" /> How others see you
              </span>
            )}
          </div>
          {psych.profile.map((t) => (
            <TraitRow key={t.key} t={t} gapsReady={gapsReady} />
          ))}
        </>
      )}

      {psych.styles.length > 0 && (
        <>
          <h2>Closeness and conflict</h2>
          {psych.styles.map((s) => (
            <div className="gap" key={s.key}>
              <strong>{s.label}.</strong> You lean "{s.selfTop.label}".
              {s.othersTop &&
                (s.match
                  ? ' The people who know you picked the same.'
                  : ` People more often picked "${s.othersTop.label}".`)}
              <div className="miss">You: {spreadText(s.spread, 'self')}</div>
              {gapsReady && <div className="miss">Others: {spreadText(s.spread, 'others')}</div>}
            </div>
          ))}
        </>
      )}

      {gapsReady && psych.blindSpots.length > 0 && (
        <>
          <h2>Blind spots</h2>
          {psych.blindSpots.map((x, k) => (
            <GapItem key={k} item={x} />
          ))}
        </>
      )}

      {gapsReady && psych.hiddenSides.length > 0 && (
        <>
          <h2>Hidden sides</h2>
          {psych.hiddenSides.map((x, k) => (
            <GapItem key={k} item={x} />
          ))}
        </>
      )}

      {gapsReady && psych.commonGround.length > 0 && (
        <>
          <h2>Where everyone agrees</h2>
          {psych.commonGround.map((x, k) => (
            <GapItem key={k} item={x} />
          ))}
        </>
      )}

      {psych.knowsBest.length > 0 && (
        <>
          <h2>Who knows you best, by area</h2>
          {psych.knowsBest.map((k) => (
            <p key={k.key} className="miss">
              <strong>{k.label}:</strong> {k.name} ({k.accuracy}% match)
            </p>
          ))}
        </>
      )}

      <p className="note">{psych.disclaimer}</p>
    </>
  );
}
