'use client';

// Shared 1-5 "rate me" input, used both when the maker answers about
// themselves (app/page.js) and when a guesser tries to match it
// (app/q/[id]/page.js). Values are stored 0-4 internally, shown as 1-5.
//
// `selected` highlights the last pick as "locked in" — it is not a
// right/wrong signal (guessers never see the answer key).
export default function ScaleInput({ minLabel, maxLabel, selected, onSelect, disabled = false }) {
  return (
    <div className="scale">
      <div className="scale-row">
        {[0, 1, 2, 3, 4].map((v) => (
          <button
            key={v}
            className={'scale-btn' + (selected === v ? ' picked' : '')}
            onClick={() => onSelect(v)}
            disabled={disabled}
            aria-label={`${v + 1} out of 5`}
            aria-pressed={selected === v}
          >
            {v + 1}
          </button>
        ))}
      </div>
      <div className="scale-labels">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}
