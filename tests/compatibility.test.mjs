import test from 'node:test';
import assert from 'node:assert/strict';
import {PROFILE_ITEMS,validProfile,traitScores,compareProfiles} from '../lib/compatibility.js';
test('requires complete bounded self reports',()=>{assert.equal(validProfile(Array(20).fill(2)),true);for(const x of [null,Array(19).fill(2),Array(20).fill(5),Array(20),Array(20).fill('2')])assert.equal(validProfile(x),false);assert.equal(compareProfiles(null,Array(20).fill(2)),null);});
test('official reverse keys and scale endpoints',()=>{const high=PROFILE_ITEMS.map(i=>i.reverse?0:4);const low=high.map(n=>4-n);assert.ok(traitScores(high).every(t=>t.value===5));assert.ok(traitScores(low).every(t=>t.value===1));assert.equal(compareProfiles(high,high).score,100);assert.equal(compareProfiles(high,low).score,0);assert.equal(compareProfiles(high,Array(20).fill(2)).score,50);});
test('comparison is symmetric and has five equal weight traits',()=>{const a=PROFILE_ITEMS.map((_,i)=>i%5),b=Array(20).fill(2);assert.equal(compareProfiles(a,b).score,compareProfiles(b,a).score);assert.equal(compareProfiles(a,b).traits.length,5);});
