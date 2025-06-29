// src/OcrUpload.js
import React, { useState } from 'react';
import Tesseract from 'tesseract.js';

function OcrUpload({ onExtract }) {
  const [image, setImage] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      recognizeText(file);
    }
  };

  const recognizeText = async (file) => {
    setLoading(true);
    const { data: { text } } = await Tesseract.recognize(file, 'eng', {
      logger: m => console.log(m)
    });
    setText(text);
    setLoading(false);

    const parsed = parseText(text);
    if (onExtract) onExtract(parsed);
  };

  const parseText = (rawText) => {
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    const parsed = {
      datum: '',
      fiskalni: '',
      sunmi: '',
      virmanText: '',
      rashodiText: '',
      kesDobitText: ''
    };

    lines.forEach(line => {
      const lineLower = line.toLowerCase();
      if (lineLower.includes('datum')) {
        parsed.datum = line.split(':')[1]?.trim() || '';
      } else if (lineLower.includes('fiskalni')) {
        parsed.fiskalni = extractNumber(line);
      } else if (lineLower.includes('sunmi')) {
        parsed.sunmi = extractNumber(line);
      } else if (lineLower.includes('viza') || lineLower.includes('fakture')) {
        parsed.virmanText += line + '\n';
      } else if (lineLower.includes('rashod') || lineLower.includes('trošak')) {
        parsed.rashodiText += line + '\n';
      } else if (lineLower.includes('dobit') || lineLower.includes('keš')) {
        parsed.kesDobitText += line + '\n';
      }
    });

    return parsed;
  };

  const extractNumber = (line) => {
    const match = line.replace(',', '.').match(/[-+]?\d+(\.\d+)?/);
    return match ? match[0] : '';
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <h3>📸 Učitaj sliku sa papira</h3>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      {loading && <p>⏳ Prepoznajem tekst...</p>}
      {image && <img src={image} alt="preview" style={{ maxWidth: '100%', marginTop: 10 }} />}
      {text && (
        <details style={{ marginTop: '10px' }}>
          <summary>📄 Prikaz prepoznatog teksta</summary>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{text}</pre>
        </details>
      )}
    </div>
  );
}

export default OcrUpload;
