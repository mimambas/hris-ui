import assert from 'node:assert/strict';
import { escapePostgrestSearch, orIlike } from '../src/lib/server/query.ts';

// Injection attempt: comma + parentheses must not split the OR expression.
const injected = orIlike('a)or(b)and(c', ['name', 'code']);
assert.equal(injected.split(',').length, 2, `or must have exactly 2 clauses, got ${injected.split(',').length}`);
assert.ok(!injected.includes('(b)and'), 'raw parentheses must be escaped');

// LIKE wildcards must be escaped so search stays literal.
assert.equal(escapePostgrestSearch('100%'), '100\\%', 'percent must be escaped');
assert.equal(escapePostgrestSearch('a_b'), 'a\\_b', 'underscore must be escaped');
assert.equal(escapePostgrestSearch('a,b'), 'a\\,b', 'comma must be escaped');
assert.equal(escapePostgrestSearch('a\\b'), 'a\\\\b', 'backslash must be escaped');

// Normal text is unchanged.
assert.equal(escapePostgrestSearch('Rina Sari'), 'Rina Sari');

// Multi-column shape preserved.
assert.equal(orIlike('Doe', ['name', 'role', 'email']), 'name.ilike.%Doe%,role.ilike.%Doe%,email.ilike.%Doe%');

console.log('All query escaping tests passed.');
