// Public-domain Mini-IPIP items and scoring key: https://ipip.ori.org/MiniIPIPKey.htm
// Values are stored 0–4, equivalent to the published 1–5 response scale.
const groups = [
 ['Extraversion', [["Am the life of the party.", false], ["Talk to a lot of different people at parties.", false], ["Don't talk a lot.", true], ["Keep in the background.", true]]],
 ['Agreeableness', [["Sympathize with others' feelings.", false], ["Feel others' emotions.", false], ["Am not really interested in others.", true], ["Am not interested in other people's problems.", true]]],
 ['Conscientiousness', [["Get chores done right away.", false], ["Like order.", false], ["Often forget to put things back in their proper place.", true], ["Make a mess of things.", true]]],
 ['Emotional sensitivity', [["Have frequent mood swings.", false], ["Get upset easily.", false], ["Am relaxed most of the time.", true], ["Seldom feel blue.", true]]],
 ['Intellect / imagination', [["Have a vivid imagination.", false], ["Have difficulty understanding abstract ideas.", true], ["Am not interested in abstract ideas.", true], ["Do not have a good imagination.", true]]],
];
export const PROFILE_ITEMS = Array.from({length:4}, (_, i) => groups.map(([trait, items]) => ({trait, prompt:items[i][0], reverse:items[i][1]}))).flat();
export const PROFILE_OPTIONS = ['Very inaccurate', 'Moderately inaccurate', 'Neither accurate nor inaccurate', 'Moderately accurate', 'Very accurate'];
export function validProfile(v) { return Array.isArray(v) && v.length === 20 && Array.from(v).every(n => Number.isInteger(n) && n >= 0 && n <= 4); }
export function traitScores(v) {
 if (!validProfile(v)) return null;
 return groups.map(([name]) => ({name, value: PROFILE_ITEMS.reduce((sum,item,i) => sum + (item.trait === name ? (item.reverse ? 4-v[i] : v[i]) : 0),0)/4 + 1}));
}
export function compareProfiles(maker, taker) {
 const a=traitScores(maker), b=traitScores(taker);
 if (!a || !b) return null;
 const traits=a.map((t,i) => ({name:t.name,maker:t.value,taker:b[i].value,similarity:Math.round(100*(1-Math.abs(t.value-b[i].value)/4))}));
 const score=Math.round(100*(1-a.reduce((sum,t,i)=>sum+Math.abs(t.value-b[i].value),0)/20));
 return {version:'mini-ipip-similarity-v1',score,traits};
}
