'use client'
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const EMOTIONS = [
  'Anxiety', 'Fear', 'Sadness', 'Anger', 'Guilt', 'Shame', 'Hurt', 'Frustration', 'Loneliness', 'Hopelessness', 'Other'
];
const DISTORTIONS = [
  'All-or-Nothing', 'Catastrophizing', 'Overgeneralization', 'Filtering', 'Mind Reading', 'Fortune Telling', 'Personalization', 'Emotional Reasoning', 'Should Statements', 'Labeling'
];

// Simplified fields - only keeping the specified steps
const FIELDS = [
  { key: 'situation', label: 'Situation', type: 'textarea', prompt: 'Describe the situation that triggered your thoughts.' },
  { key: 'ants', label: 'Automatic Negative Thoughts (ANTs)', type: 'textarea', prompt: 'What immediate negative thoughts did you have?' },
  { key: 'behaviors', label: 'Behaviors', type: 'textarea', prompt: 'How did you react or what did you feel like doing?' },
  { key: 'distortions', label: 'Cognitive Distortions', type: 'distortions', prompt: 'Which cognitive distortions might be present?' },
  { key: 'evidenceAgainst', label: 'Evidence Against', type: 'textarea', prompt: 'What factual evidence contradicts your negative thought?' },
  { key: 'friendsAdvice', label: 'Friend\'s Advice', type: 'textarea', prompt: 'What would you tell a friend in this situation?' },
  { key: 'balancedThought', label: 'Balanced Thought', type: 'textarea', prompt: 'Create a new, more realistic thought.' },
];

function AILabel() {
  return <span className="ml-1 inline-block align-middle" title="AI suggestion">🤖</span>;
}

// Define the interface for AISummaryPanel's props
interface AISummaryPanelProps {
  step: number;
  context: string;
  aiSummary: string | null;
  aiPointers: string[] | null;
  aiConclusion: string | null;
  isLoading: boolean;
}

// New component to display AI summary and pointers
function AISummaryPanel({ step, context, aiSummary, aiPointers, aiConclusion, isLoading }: AISummaryPanelProps) {
  if (step === 0) return null; // Don't show on first step
  
  return (
    <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
      <div className="flex items-center mb-2">
        <div className="text-lg font-medium text-blue-800 flex items-center">
          <AILabel /> AI Insights
        </div>
        {isLoading && (
          <div className="ml-2 animate-pulse">
            <div className="h-2 w-4 bg-blue-300 rounded"></div>
          </div>
        )}
      </div>
      
      {/* Summary of progress so far */}
      {aiSummary && (
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-blue-700 mb-1">Summary So Far</h4>
          <p className="text-sm text-gray-700">{aiSummary}</p>
        </div>
      )}
      
      {/* Pointers for current step */}
      {aiPointers && aiPointers.length > 0 && (
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-blue-700 mb-1">Consider These Points</h4>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {aiPointers.map((pointer, idx) => (
              <li key={idx}>{pointer}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Conclusion (only show on last step) */}
      {step === FIELDS.length && aiConclusion && (
        <div>
          <h4 className="text-sm font-semibold text-blue-700 mb-1">Conclusion</h4>
          <p className="text-sm text-gray-700">{aiConclusion}</p>
        </div>
      )}
    </div>
  );
}

function DistortionSelector({ distortions, setDistortions, aiSuggestions }: any) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {DISTORTIONS.map(d => (
          <label key={d} className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={distortions.includes(d)}
              onChange={() => {
                setDistortions(
                  distortions.includes(d)
                    ? distortions.filter((x: string) => x !== d)
                    : [...distortions, d]
                );
              }}
            />
            {d}
          </label>
        ))}
        {/* AI distortion suggestions as chips */}
        {aiSuggestions && aiSuggestions.length > 0 && (
          <>
            {aiSuggestions.map((s: string, idx: number) => (
              <button
                key={s + idx}
                type="button"
                className="px-2 py-1 rounded border border-blue-400 bg-blue-50 text-blue-700"
                onClick={() => {
                  if (!distortions.includes(s)) setDistortions([...distortions, s]);
                }}
              >
                {s} <AILabel />
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default function CBTThoughtTracker() {
  // State for each field
  const [situation, setSituation] = useState('');
  const [ants, setAnts] = useState('');
  const [behaviors, setBehaviors] = useState('');
  const [distortions, setDistortions] = useState<string[]>([]);
  const [evidenceAgainst, setEvidenceAgainst] = useState('');
  const [friendsAdvice, setFriendsAdvice] = useState('');
  const [balancedThought, setBalancedThought] = useState('');

  // Step state
  const [step, setStep] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState<string|null>(null);

  // AI state
  const [aiSuggestions, setAISuggestions] = useState<string[]>([]);
  const [aiLoading, setAILoading] = useState(false);
  const [aiError, setAIError] = useState<string|null>(null);
  
  // New AI summary state
  const [aiSummary, setAISummary] = useState<string>('');
  const [aiPointers, setAIPointers] = useState<string[]>([]);
  const [aiConclusion, setAIConclusion] = useState<string>('');
  const [aiSummaryLoading, setAISummaryLoading] = useState(false);

  // Compose context for AI
  function getContextForAI(fieldKey: string) {
    const context: Record<string, any> = {
      situation,
      ants,
      behaviors,
      distortions: distortions.join(', '),
      evidenceAgainst,
      friendsAdvice,
      balancedThought,
    };
    // Only include up to the previous field
    const idx = FIELDS.findIndex(f => f.key === fieldKey);
    const keys = FIELDS.slice(0, idx).map(f => f.key);
    const prevContext = keys.map(k => `${FIELDS.find(f => f.key === k)?.label}: ${context[k] || ''}`).join('\n');
    return prevContext;
  }

  // Get full context for AI summary
  function getFullContext() {
    const context: Record<string, any> = {
      situation,
      ants,
      behaviors,
      distortions: distortions.join(', '),
      evidenceAgainst,
      friendsAdvice,
      balancedThought,
    };
    
    // Only include fields that have been completed
    const completedFields = FIELDS.slice(0, step).map(f => f.key);
    return completedFields.map(k => `${FIELDS.find(f => f.key === k)?.label}: ${context[k] || ''}`).join('\n');
  }

  // Fetch AI summary and pointers for the current step
  useEffect(() => {
    if (step === 0) return; // Don't fetch for first step
    
    setAISummaryLoading(true);
    const fullContext = getFullContext();
    const currentField = FIELDS[step < FIELDS.length ? step : FIELDS.length - 1];
    
    fetch('/api/cbt-gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'field_suggestion',
        field: 'ai_summary',
        context: fullContext,
        prompt: `Provide a brief summary of the CBT process so far, and ${step < FIELDS.length ? `3 specific pointers for the user to consider when answering about their ${currentField.label.toLowerCase()}` : 'a conclusion about their thought process and the progress they\'ve made'}`,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.response) {
          // Parse the response
          const lines = data.response.split('\n').filter(Boolean);
          
          // Extract summary (first paragraph)
          const summaryLines = [];
          let i = 0;
          while (i < lines.length && !lines[i].match(/pointers|suggestions|consider|conclusion/i)) {
            if (lines[i].trim()) summaryLines.push(lines[i].trim());
            i++;
          }
          setAISummary(summaryLines.join(' '));
          
          // Extract pointers or conclusion
          const remainingLines = lines.slice(i).filter((line: string) => // Added type for 'line'
            line.trim() && 
            !line.match(/^(pointers|suggestions|consider|conclusion):/i)
          );
          
          if (step === FIELDS.length) {
            // It's the conclusion
            setAIConclusion(remainingLines.join(' '));
            setAIPointers([]);
          } else {
            // Extract pointers (numbered or bulleted list)
            const pointers = remainingLines
              .map((line: string) => line.replace(/^\d+\.\s*|\*\s*/, '').trim()) // Added type for 'line'
              .filter(Boolean);
            setAIPointers(pointers);
          }
        }
      })
      .catch(err => console.error('Error fetching AI summary:', err))
      .finally(() => setAISummaryLoading(false));
  }, [step]);

  // Fetch AI suggestions for the current step
  useEffect(() => {
    setAISuggestions([]);
    setAIError(null);
    setAILoading(false);
    if (step >= FIELDS.length) return;
    
    // Always fetch AI suggestions for every step except situation
    if (step > 0) {
      setAILoading(true);
      const field = FIELDS[step];
      
      // Use the full context instead of just the previous field's context
      // This ensures all past user responses are considered for AI suggestions
      const fullContext = getFullContext();
      
      fetch('/api/cbt-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'field_suggestion',
          field: field.key,
          context: fullContext,
          prompt: field.prompt,
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.response) {
            const suggestions = data.response.split(/\n|\d+\. /).map((s: string) => s.trim()).filter(Boolean);
            setAISuggestions(suggestions);
          } else if (data.error) {
            setAIError(data.error);
          }
        })
        .catch(err => setAIError('AI error: ' + err.message))
        .finally(() => setAILoading(false));
    }
  }, [step]);

  // Fetch history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('cbt_thought_records')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError('Failed to fetch history');
    else setHistory(data || []);
    setLoading(false);
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    setSuccess(null);
    const user_id = 'demo-user';
    const record = {
      id: uuidv4(),
      user_id,
      created_at: new Date().toISOString(),
      situation,
      ants,
      behaviors,
      distortions,
      evidence_against: evidenceAgainst,
      friends_advice: friendsAdvice,
      balanced_thought: balancedThought,
    };
    const { error } = await supabase.from('cbt_thought_records').insert([record]);
    if (error) setError('Failed to save record');
    else {
      setSuccess('Record saved!');
      fetchHistory();
      setStep(FIELDS.length); // Go to review
    }
    setLoading(false);
  }

  function resetForm() {
    setSituation('');
    setAnts('');
    setBehaviors('');
    setDistortions([]);
    setEvidenceAgainst('');
    setFriendsAdvice('');
    setBalancedThought('');
    setStep(0);
    setError(null);
    setSuccess(null);
    setAISummary('');
    setAIPointers([]);
    setAIConclusion('');
  }

  // Render current step
  let stepContent = null;
  const field = FIELDS[step];
  if (step < FIELDS.length) {
    stepContent = (
      <div className="space-y-4">
        <label className="block font-semibold mb-1">{field.label}</label>
        {field.type === 'textarea' && (
          <textarea
            className="w-full border rounded p-2"
            rows={3}
            value={(() => {
              switch (field.key) {
                case 'situation': return situation;
                case 'ants': return ants;
                case 'behaviors': return behaviors;
                case 'evidenceAgainst': return evidenceAgainst;
                case 'friendsAdvice': return friendsAdvice;
                case 'balancedThought': return balancedThought;
                default: return '';
              }
            })()}
            onChange={e => {
              switch (field.key) {
                case 'situation': setSituation(e.target.value); break;
                case 'ants': setAnts(e.target.value); break;
                case 'behaviors': setBehaviors(e.target.value); break;
                case 'evidenceAgainst': setEvidenceAgainst(e.target.value); break;
                case 'friendsAdvice': setFriendsAdvice(e.target.value); break;
                case 'balancedThought': setBalancedThought(e.target.value); break;
                default: break;
              }
            }}
          />
        )}
        {field.type === 'distortions' && (
          <DistortionSelector distortions={distortions} setDistortions={setDistortions} aiSuggestions={aiSuggestions} />
        )}
        
        {/* AI Suggestions for all fields */}
          <div>
            {aiLoading && <div className="text-center text-gray-500">Loading AI suggestions...</div>}
            {aiError && <div className="text-center text-red-600">{aiError}</div>}
            {aiSuggestions.length > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg mt-2">
                <div className="text-sm text-gray-700 flex items-center mb-1"><AILabel /> Suggestions:</div>
                <ul className="list-disc list-inside space-y-1">
                  {aiSuggestions.map((s, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span>{s}</span>
                      <button
                        type="button"
                        className="ml-2 px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs"
                        onClick={() => {
                          switch (field.key) {
                            case 'ants': setAnts(s); break;
                            case 'behaviors': setBehaviors(s); break;
                            case 'evidenceAgainst': setEvidenceAgainst(s); break;
                            case 'friendsAdvice': setFriendsAdvice(s); break;
                            case 'balancedThought': setBalancedThought(s); break;
                            default: break;
                          }
                        }}
                      >
                        Use
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
      </div>
    );
  } else {
    // Review step
    stepContent = (
      <div className="space-y-4">
        <div className="p-4 bg-green-50 rounded">
          <div className="font-semibold mb-2">Review</div>
          <div><b>Situation:</b> {situation}</div>
          <div><b>ANTs:</b> {ants}</div>
          <div><b>Behaviors:</b> {behaviors}</div>
          <div><b>Distortions:</b> {distortions.join(', ')}</div>
          <div><b>Evidence Against:</b> {evidenceAgainst}</div>
          <div><b>Friend's Advice:</b> {friendsAdvice}</div>
          <div><b>Balanced Thought:</b> {balancedThought}</div>
        </div>
        <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded" onClick={resetForm}>Start New Record</button>
      </div>
    );
  }

  // Progress bar
  const progress = Math.round((step / FIELDS.length) * 100);

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">CBT Thought Tracker</h2>
      <div className="mb-4 flex items-center gap-2">
        <div className="flex-1 h-2 rounded bg-gray-200 relative">
          <div className="h-2 rounded bg-blue-500" style={{ width: `${progress}%` }}></div>
        </div>
        <span className="ml-2 text-sm text-gray-600">Step {Math.min(step + 1, FIELDS.length + 1)} / {FIELDS.length + 1}</span>
      </div>
      {error && <div className="mb-2 text-red-600">{error}</div>}
      {success && <div className="mb-2 text-green-600">{success}</div>}
      
      {/* AI Summary Panel - Show after first step */}
      <AISummaryPanel 
        step={step} 
        context={getFullContext()} 
        aiSummary={aiSummary} 
        aiPointers={aiPointers} 
        aiConclusion={aiConclusion} 
        isLoading={aiSummaryLoading} 
      />
      
      <form
        onSubmit={e => {
          e.preventDefault();
          if (step === FIELDS.length) handleSubmit();
          else setStep(step + 1);
        }}
        className="space-y-4"
      >
        {stepContent}
        <div className="flex gap-2 mt-4">
          {step > 0 && step <= FIELDS.length && (
            <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}
          {step < FIELDS.length && (
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded" disabled={loading}>
              Next
            </button>
          )}
          {step === FIELDS.length && (
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded" disabled={loading}>
              {loading ? 'Saving...' : 'Submit'}
            </button>
          )}
        </div>
      </form>
      {/* History Section */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Your Past Thought Records</h3>
        {loading && <div>Loading...</div>}
        {history.length === 0 && !loading && <div className="text-gray-500">No records yet.</div>}
        <ul className="space-y-2">
          {history.map((rec, idx) => (
            <li key={rec.id || idx} className="p-2 border rounded bg-gray-50">
              <div className="text-sm text-gray-700"><b>Date:</b> {rec.created_at?.slice(0, 16).replace('T', ' ')}</div>
              <div className="text-sm"><b>Situation:</b> {rec.situation}</div>
              <div className="text-sm"><b>Balanced Thought:</b> {rec.balanced_thought}</div>
              <div className="text-xs text-gray-500">ANTs: {rec.ants}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
