'use client';

// Shared 1-5 "rate me" input, used both when the maker answers about
// themselves (app/page.js) and when a guesser tries to match it
// (app/q/[id]/page.js). Values are stored 0-4 internally, shown as 1-5.
export default function ScaleInput({ minLabel, maxLabel, selected, onSelect }) {
  return (
    <div className="scale">
      <div className="scale-row">
        {[0, 1, 2, 3, 4].map((v) => (
          <button
            key={v}
            className={'scale-btn' + (selected === v ? ' ok' : '')}
            onClick={() => onSelect(v)}
            aria-label={`${v + 1} out of 5`}
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
