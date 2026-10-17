// The landing page's one illustration: a sample receipt — what every quiz
// ends with. Rows tick in, then the verdict stamps down (CSS, once, on
// load; skipped under reduced motion). It's labeled "sample" because it
// is an illustration, not a real result. Prompts are real questions from
// the bank so it reads like the product.
const ROWS = [
  [true, 'You get a warning label. What does it say?'],
  [true, 'Your group chat becomes a courtroom.'],
  [false, 'A ghost moves into your room.'],
  [true, 'Your life gets a loading-screen tip.'],
];

export default function Hero() {
  return (
    <div
      className="ticket"
      role="img"
      aria-label="Sample result: a friend scored 11 out of 15 on your quiz and earned the verdict Ride or die."
    >
      <div className="ticket-head" aria-hidden="true">
        <span>Jamie vs you</span>
        <small>sample</small>
      </div>
      {ROWS.map(([hit, label], k) => (
        <div
          key={label}
          className={'ticket-row ' + (hit ? 'hit' : 'missed')}
          style={{ '--d': `${0.15 + k * 0.17}s` }}
          aria-hidden="true"
        >
          <i>{hit ? '✓' : '✗'}</i>
          <span>{label}</span>
        </div>
      ))}
      <div className="ticket-foot" aria-hidden="true">
        <div className="ticket-score">
          11<span>/15</span>
        </div>
        <div className="stamp">Ride or die</div>
      </div>
    </div>
  );
}
