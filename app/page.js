"use client";
import { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const CopyGenerator = dynamic(() => import('../components/CopyGenerator'), { ssr: false });

function downloadDataUrl(filename, dataUrl) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function Home() {
  const canvasRef = useRef(null);
  const [title, setTitle] = useState('Transform Your Brand');
  const [subtitle, setSubtitle] = useState('Create stunning ads in seconds — free');
  const [cta, setCta] = useState('Get Started');
  const [bgColor, setBgColor] = useState('#0b1020');
  const [accentColor, setAccentColor] = useState('#3b82f6');
  const [textColor, setTextColor] = useState('#ffffff');
  const [image, setImage] = useState(null);
  const [size, setSize] = useState({ w: 1200, h: 1200 });
  const [fontFamily, setFontFamily] = useState('Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = size.w;
    canvas.height = size.h;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Optional image
    if (image) {
      const { naturalWidth: iw, naturalHeight: ih } = image;
      const scale = Math.min(canvas.width / iw, canvas.height / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (canvas.width - dw) / 2;
      const dy = (canvas.height - dh) / 2;
      ctx.globalAlpha = 0.9;
      ctx.drawImage(image, dx, dy, dw, dh);
      ctx.globalAlpha = 1;

      // overlay for contrast
      const grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grd.addColorStop(0, 'rgba(0,0,0,0.2)');
      grd.addColorStop(1, 'rgba(0,0,0,0.5)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Title
    const pad = Math.round(canvas.width * 0.08);
    ctx.fillStyle = textColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = `700 ${Math.round(canvas.width * 0.08)}px ${fontFamily}`;
    const titleLines = wrapText(ctx, title, canvas.width - pad * 2);
    let y = pad;
    titleLines.forEach(line => {
      ctx.fillText(line, pad, y);
      y += Math.round(canvas.width * 0.1);
    });

    // Subtitle
    ctx.font = `500 ${Math.round(canvas.width * 0.035)}px ${fontFamily}`;
    const subLines = wrapText(ctx, subtitle, canvas.width - pad * 2);
    subLines.forEach(line => {
      ctx.fillText(line, pad, y);
      y += Math.round(canvas.width * 0.055);
    });

    // CTA pill
    const btnPadX = Math.round(canvas.width * 0.02);
    const btnPadY = Math.round(canvas.width * 0.008);
    ctx.font = `700 ${Math.round(canvas.width * 0.03)}px ${fontFamily}`;
    const textWidth = ctx.measureText(cta).width;
    const btnW = textWidth + btnPadX * 2;
    const btnH = Math.round(canvas.width * 0.06);
    const btnY = y + Math.round(canvas.width * 0.03);

    roundRect(ctx, pad, btnY, btnW, btnH, btnH / 2, accentColor);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(cta, pad + btnW / 2, btnY + btnH / 2);
  }, [title, subtitle, cta, bgColor, textColor, accentColor, image, size, fontFamily]);

  function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let line = '';
    for (let i = 0; i < words.length; i++) {
      const testLine = line ? line + ' ' + words[i] : words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        lines.push(line);
        line = words[i];
      } else {
        line = testLine;
      }
    }
    if (line) lines.push(line);
    return lines.slice(0, 4);
  }

  function roundRect(ctx, x, y, w, h, r, fill) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => setImage(img);
    img.src = URL.createObjectURL(file);
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    const name = `ad-${size.w}x${size.h}.png`;
    downloadDataUrl(name, dataUrl);
  };

  return (
    <main className="container py-8 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">AI Ad Designer</h1>
        <a className="text-slate-300 underline" href="https://vercel.com" target="_blank" rel="noreferrer">Deploy on Vercel</a>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5 space-y-5">
          <h2 className="text-xl font-semibold">Design</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Title</label>
              <input className="input" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="label">Subtitle</label>
              <input className="input" value={subtitle} onChange={e => setSubtitle(e.target.value)} />
            </div>
            <div>
              <label className="label">CTA</label>
              <input className="input" value={cta} onChange={e => setCta(e.target.value)} />
            </div>
            <div>
              <label className="label">Background</label>
              <input type="color" className="input h-10 p-1" value={bgColor} onChange={e => setBgColor(e.target.value)} />
            </div>
            <div>
              <label className="label">Accent</label>
              <input type="color" className="input h-10 p-1" value={accentColor} onChange={e => setAccentColor(e.target.value)} />
            </div>
            <div>
              <label className="label">Text color</label>
              <input type="color" className="input h-10 p-1" value={textColor} onChange={e => setTextColor(e.target.value)} />
            </div>
            <div>
              <label className="label">Font</label>
              <select className="input" value={fontFamily} onChange={e => setFontFamily(e.target.value)}>
                <option value="Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial">Inter</option>
                <option value="Poppins, Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial">Poppins</option>
                <option value="Oswald, Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial">Oswald</option>
              </select>
            </div>
            <div>
              <label className="label">Upload background image</label>
              <input type="file" accept="image/*" className="input" onChange={handleImageUpload} />
            </div>
            <div>
              <label className="label">Size preset</label>
              <select className="input" value={`${size.w}x${size.h}`} onChange={e => {
                const [w,h] = e.target.value.split('x').map(n => parseInt(n,10));
                setSize({ w, h });
              }}>
                <option value="1200x1200">Instagram 1200x1200</option>
                <option value="1080x1920">Story 1080x1920</option>
                <option value="1200x628">Facebook 1200x628</option>
                <option value="1600x900">YouTube 1600x900</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="btn btn-primary" onClick={handleExport}>Export PNG</button>
          </div>
        </div>
        <div className="card p-4 overflow-auto">
          <canvas ref={canvasRef} className="w-full h-auto block rounded-lg border border-slate-800" />
        </div>
      </section>

      <section className="card p-5">
        <CopyGenerator onApply={({ headline, description, cta: gcta }) => {
          if (headline) setTitle(headline);
          if (description) setSubtitle(description);
          if (gcta) setCta(gcta);
        }} />
      </section>
    </main>
  );
}
