const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uwsruiisuiiitgewwcld.supabase.co';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_cIL6dW-QEu0aYeWx1a-t1g_3fbHYvcf';

const supabase = createClient(url, key);

async function seed() {
  console.log('--- Seeding Supabase Database ---');

  // Read constants
  const rawConstants = fs.readFileSync('./src/lib/constants.ts', 'utf8');

  // 1. Members check & upsert
  const { data: existingMembers, error: memErr } = await supabase.from('members').select('id');
  if (memErr) {
    console.error('Error querying members:', memErr);
    return;
  }
  console.log(`Found ${existingMembers?.length || 0} existing members.`);

  // 2. Contributions
  // Extract INITIAL_CONTRIBUTIONS array by evaluating a JS snippet or JSON
  // Let's parse constants.ts directly
  const contribMatch = rawConstants.match(/export const INITIAL_CONTRIBUTIONS: Contribution\[\] = (\[[\s\S]*?\n\];)/);
  if (!contribMatch) {
    console.error('Could not parse INITIAL_CONTRIBUTIONS');
    return;
  }
  
  let contribJsonText = contribMatch[1]
    .replace(/\n\s*\/\/.*$/gm, '') // remove comments
    .replace(/;\s*$/, '');
    
  // eval safe object
  const initialContributions = eval(contribJsonText);
  console.log(`Extracted ${initialContributions.length} initial contribution records.`);

  const dbContributions = initialContributions.map(c => ({
    id: c.id,
    member_id: c.memberId,
    member_name: c.memberName,
    month: c.month,
    year: c.year,
    type: c.type,
    amount: c.amount,
    date_received: c.dateReceived,
    notes: c.notes || null,
    created_at: c.createdAt || new Date().toISOString()
  }));

  const { data: insertedContribs, error: cErr } = await supabase
    .from('contributions')
    .upsert(dbContributions, { onConflict: 'id' })
    .select('id');

  if (cErr) {
    console.error('Error inserting contributions:', cErr);
  } else {
    console.log(`Successfully upserted ${insertedContribs?.length || dbContributions.length} contributions.`);
  }

  // 3. Expenses
  const expMatch = rawConstants.match(/export const INITIAL_EXPENSES: Expense\[\] = (\[[\s\S]*?\n\];)/);
  if (expMatch) {
    let expJsonText = expMatch[1]
      .replace(/\n\s*\/\/.*$/gm, '')
      .replace(/;\s*$/, '');
    const initialExpenses = eval(expJsonText);
    console.log(`Extracted ${initialExpenses.length} initial expense records.`);

    const dbExpenses = initialExpenses.map(e => ({
      id: e.id,
      date: e.date,
      description: e.description,
      category: e.category,
      amount: e.amount,
      reference: e.reference || null,
      notes: e.notes || null,
      created_at: e.createdAt || new Date().toISOString()
    }));

    const { data: insertedExpenses, error: eErr } = await supabase
      .from('expenses')
      .upsert(dbExpenses, { onConflict: 'id' })
      .select('id');

    if (eErr) {
      console.error('Error inserting expenses:', eErr);
    } else {
      console.log(`Successfully upserted ${insertedExpenses?.length || dbExpenses.length} expenses.`);
    }
  }

  // 4. Special Projects
  const projMatch = rawConstants.match(/export const INITIAL_SPECIAL_PROJECTS: SpecialProject\[\] = (\[[\s\S]*?\n\];)/);
  if (projMatch) {
    let projJsonText = projMatch[1]
      .replace(/\n\s*\/\/.*$/gm, '')
      .replace(/;\s*$/, '');
    const initialProjects = eval(projJsonText);
    const dbProjects = initialProjects.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description || null,
      target_amount: p.targetAmount,
      status: p.status,
      started_at: p.startedAt,
      completed_at: p.completedAt || null,
      notes: p.notes || null
    }));

    const { error: pErr } = await supabase
      .from('special_projects')
      .upsert(dbProjects, { onConflict: 'id' });
    if (pErr) console.error('Error inserting special projects:', pErr);
    else console.log(`Upserted ${dbProjects.length} special projects.`);
  }

  // 5. Initial Audit Log
  const { error: aErr } = await supabase.from('audit_logs').upsert([
    {
      id: 'log-seed',
      actor: 'System',
      action: 'IMPORT',
      details: 'Historical records (April - August 2026) initialized in Supabase.',
      timestamp: new Date().toISOString()
    }
  ], { onConflict: 'id' });
  if (aErr) console.error('Error inserting audit log:', aErr);
  else console.log('Audit log initialized.');

  console.log('--- Supabase Seeding Complete! ---');
}

seed();
