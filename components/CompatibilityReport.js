export default function CompatibilityReport({report,makerName}) {
 if (!report) return null;
 return <section><h2>Compatibility snapshot</h2><p><b>{report.score}/100 personality similarity</b></p><p>How closely your self-described styles align. Differences can be useful too.</p><table><thead><tr><th>Trait</th><th>{makerName || 'Maker'}</th><th>Taker</th><th>Similarity</th></tr></thead><tbody>{report.traits.map(t=><tr key={t.name}><td>{t.name}</td><td>{t.maker}/5</td><td>{t.taker}/5</td><td>{t.similarity}/100</td></tr>)}</tbody></table><p className="note">These are self-ratings, not population percentiles. This custom score does not measure relationship quality or predict success. <a href="/compatibility">Scoring method</a></p></section>;
}
