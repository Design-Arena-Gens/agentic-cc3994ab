"use client";
import { useState, useMemo } from 'react';

export default function CopyGenerator({ onApply }) {
  const [product, setProduct] = useState('All-in-one AI-powered design tool for small businesses.');
  const [tone, setTone] = useState('Friendly, bold, benefit-driven, concise');
  const [loading, setLoading] = useState(false);
  const [headlines, setHeadlines] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  const [ctas, setCtas] = useState([]);

  const generator = useMemo(() => ({ ready: false, pipe: null }), []);

  async function ensurePipe() {
    if (generator.ready) return generator.pipe;
    setLoading(true);
    const transformers = await import('@xenova/transformers');
    const { pipeline } = transformers;
    const pipe = await pipeline('text-generation', 'Xenova/distil-gpt2');
    generator.pipe = pipe;
    generator.ready = true;
    setLoading(false);
    return pipe;
  }

  async function gen(prompt, opts = {}) {
    const pipe = await ensurePipe();
    const res = await pipe(prompt, {
      max_new_tokens: opts.max_new_tokens ?? 44,
      temperature: 0.9,
      top_k: 40,
      do_sample: true,
      repetition_penalty: 1.2
    });
    const text = Array.isArray(res) ? res[0]?.generated_text || '' : String(res);
    return cleanup(text, prompt);
  }

  function cleanup(text, prompt) {
    let out = text.replace(prompt, '').trim();
    out = out.replace(/\n+/g, '\n').replace(/\s{2,}/g, ' ').trim();
    return out;
  }

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const base = `Product: ${product}\nTone: ${tone}\n`; 
      const [h, d, c] = await Promise.all([
        gen(base + 'Generate 8 short punchy ad headlines as a bulleted list.'),
        gen(base + 'Generate 6 benefit-focused ad descriptions, one per line.'),
        gen(base + 'Generate 8 strong call-to-actions, terse, one per line.'),
      ]);
      const hs = h.split(/\n|\r/).map(s => s.replace(/^[-*•]\s?/, '').trim()).filter(Boolean).slice(0, 8);
      const ds = d.split(/\n|\r/).map(s => s.replace(/^[-*•]\s?/, '').trim()).filter(Boolean).slice(0, 6);
      const cs = c.split(/\n|\r/).map(s => s.replace(/^[-*•]\s?/, '').trim()).filter(Boolean).slice(0, 8);
      setHeadlines(hs);
      setDescriptions(ds);
      setCtas(cs);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">AI Copy Generator</h2>
        <button disabled={loading} className="btn btn-primary" onClick={handleGenerate}>
          {loading ? 'Loading model…' : (generator.ready ? 'Regenerate' : 'Generate')}
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="label">Product or offer</label>
          <textarea className="input min-h-[120px]" value={product} onChange={e => setProduct(e.target.value)} />
          <label className="label mt-3">Tone & style</label>
          <input className="input" value={tone} onChange={e => setTone(e.target.value)} />
        </div>

        <List title="Headlines" items={headlines} onApply={val => onApply?.({ headline: val })} />
        <List title="Descriptions" items={descriptions} onApply={val => onApply?.({ description: val })} />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <List title="CTAs" items={ctas} onApply={val => onApply?.({ cta: val })} />
      </div>

      <p className="text-xs text-slate-400">Runs fully in your browser using Transformers.js (DistilGPT-2). No server needed.</p>
    </div>
  );
}

function List({ title, items, onApply }) {
  return (
    <div className="card p-3 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{title}</h3>
      </div>
      <div className="space-y-2 max-h-64 overflow-auto pr-1">
        {items.length === 0 ? (
          <p className="text-sm text-slate-400">Click Generate to get suggestions.</p>
        ) : (
          items.map((it, i) => (
            <div key={i} className="flex items-center gap-2">
              <button className="btn px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700" onClick={() => onApply?.(it)}>Use</button>
              <span className="text-sm">{it}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
