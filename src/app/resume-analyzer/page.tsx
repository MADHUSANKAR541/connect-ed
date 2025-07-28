'use client';
import { useState } from 'react';
import { Upload, FileText, Bot, Sparkles, Scan, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './page.module.scss';

export default function ResumeAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult('');
      setResumeText('');
      setError('');
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setResult('');
    setResumeText('');
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/ai/resume-analyzer', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to analyze resume');
      const data = await res.json();
      setResumeText(data.resumeText || '');
      setResult(data.aiFeedback || '');
    } catch (err: any) {
      setError(err.message || 'Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.raWrap}>
      {/* HERO SECTION */}
      <section className={styles.hero}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className={styles.heroContent}>
            <div className={styles.heroText}>
              <h1><Scan size={36} className={styles.heroIcon} /> Resume Analyzer</h1>
              <p>Let <b>AI</b> supercharge your resume. Get instant, actionable feedback and stand out from the crowd.</p>
            </div>
            <div className={styles.heroMockupWrap}>
              <div className={styles.mockup}>
                <div className={styles.mockupHeader}>
                  <span className={styles.dot1}></span>
                  <span className={styles.dot2}></span>
                  <span className={styles.dot3}></span>
                </div>
                <div className={styles.mockupContent}>
                  <div className={styles.mockupCard}>
                    <Bot size={28} className={styles.mockupBot} />
                    <div>
                      <div className={styles.mockupName}>Jane Doe</div>
                      <div className={styles.mockupRole}>AI Feedback Example</div>
                    </div>
                  </div>
                  <div className={styles.mockupStats}>
                    <div className={styles.stat}><span className={styles.statNum}>92</span><span className={styles.statLabel}>Score</span></div>
                    <div className={styles.stat}><span className={styles.statNum}>3</span><span className={styles.statLabel}>Suggestions</span></div>
                  </div>
                  <div className={styles.mockupAiBox}><Sparkles size={18} /> "Great experience section! Consider quantifying your achievements for more impact."</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className={styles.about}>
        <div className="container">
          <div className={styles.aboutIcon}><Bot size={28} /></div>
          <div>
            <h2>About</h2>
            <p>Our AI-powered Resume Analyzer reviews your resume, highlights strengths, and suggests improvements. Your data is processed securely and never stored.</p>
          </div>
        </div>
      </section>

      {/* HOW TO USE SECTION */}
      <section className={styles.howto}>
        <div className="container">
          <h2>How to Use</h2>
          <ol className={styles.howList}>
            <li><Upload size={18} /> Upload your PDF resume</li>
            <li><Scan size={18} /> Click Analyze Resume</li>
            <li><CheckCircle size={18} /> Review AI feedback and suggestions</li>
          </ol>
        </div>
      </section>

      {/* SCAN/UPLOAD SECTION */}
      <section className={styles.scanBox}>
        <div className="container">
          <h2>Scan Your Resume</h2>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className={styles.upload}
          />
          <button
            onClick={handleAnalyze}
            disabled={!file || loading}
            className={styles.analyzeBtn}
          >
            <Upload size={18} style={{ marginRight: 8, verticalAlign: -2 }} />
            {loading ? 'Analyzing...' : 'Analyze Resume'}
          </button>
          {error && <div className={styles.error}>{error}</div>}
          {resumeText && (
            <>
              <div className={styles.sectionTitle}>Extracted Resume Text</div>
              <textarea value={resumeText} readOnly className={styles.textarea} />
            </>
          )}
          {result && (
            <>
              <div className={styles.sectionTitle}>AI Feedback</div>
              <div className={styles.feedback}>{result}</div>
            </>
          )}
          {!file && !resumeText && !result && (
            <div className={styles.placeholderBox}>
              <Sparkles size={20} /> Upload your resume to see instant AI feedback here!
            </div>
          )}
        </div>
      </section>
    </div>
  );
} 