"use client";

import React, { useState } from 'react';
import styles from './page.module.scss';

const AnalyzeResumePage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Function to clean up text by removing asterisks and markdown formatting
  const cleanText = (text: string) => {
    return text
      .replace(/\*\*/g, '') // Remove double asterisks
      .replace(/\*/g, '')   // Remove single asterisks
      .replace(/`/g, '')    // Remove backticks
      .replace(/#{1,6}\s/g, '') // Remove markdown headers
      .trim();
  };

  // Function to parse feedback into structured sections
  const parseFeedback = (feedback: string) => {
    const sections = {
      skillGaps: '',
      formattingTips: '',
      improvementSuggestions: '',
      updatedResume: ''
    };

    // Split by common section headers
    const lines = feedback.split('\n');
    let currentSection = '';
    
    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      
      if (line.toLowerCase().includes('skill gaps') || line.toLowerCase().includes('skill gaps:')) {
        currentSection = 'skillGaps';
        continue;
      } else if (line.toLowerCase().includes('formatting tips') || line.toLowerCase().includes('formatting tips:')) {
        currentSection = 'formattingTips';
        continue;
      } else if (line.toLowerCase().includes('improvement suggestions') || line.toLowerCase().includes('improvement suggestions:')) {
        currentSection = 'improvementSuggestions';
        continue;
      } else if (line.toLowerCase().includes('updated version') || line.toLowerCase().includes('updated resume')) {
        currentSection = 'updatedResume';
        continue;
      }
      
      if (currentSection && sections[currentSection as keyof typeof sections] !== undefined) {
        sections[currentSection as keyof typeof sections] += line + '\n';
      }
    }

    return sections;
  };

  // Function to get score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  // Function to get score label
  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setFeedback(null);
      setScore(null);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setFeedback(null);
    setScore(null);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('http://localhost:8000/analyze-resume', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to analyze resume');
      const data = await res.json();
      setFeedback(cleanText(data.feedback));
      setScore(data.score);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const feedbackSections = feedback ? parseFeedback(feedback) : null;

  return (
    <div className={styles['analyze-resume-container']}>
      <h1>Resume Analyzer</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          required
        />
        <button type="submit" disabled={loading || !file}>
          {loading ? 'Analyzing...' : 'Analyze Resume'}
        </button>
      </form>
      {error && <div className={styles.error}>{error}</div>}
      {feedback && (
        <div className={styles['feedback-section']}>
          <h2>📋 Resume Analysis Report</h2>
          {feedbackSections ? (
            <div className={styles['feedback-content']}>
              {feedbackSections.skillGaps && (
                <div className={styles['feedback-card']}>
                  <div className={styles['card-header']}>
                    <span className={styles['card-icon']}>🎯</span>
                    <h3>Skill Gaps</h3>
                  </div>
                  <div className={styles['card-content']}>
                    {feedbackSections.skillGaps.split('\n').map((line, index) => 
                      line.trim() && <p key={index}>{line.trim()}</p>
                    )}
                  </div>
                </div>
              )}
              
              {feedbackSections.formattingTips && (
                <div className={styles['feedback-card']}>
                  <div className={styles['card-header']}>
                    <span className={styles['card-icon']}>✨</span>
                    <h3>Formatting Tips</h3>
                  </div>
                  <div className={styles['card-content']}>
                    {feedbackSections.formattingTips.split('\n').map((line, index) => 
                      line.trim() && <p key={index}>{line.trim()}</p>
                    )}
                  </div>
                </div>
              )}
              
              {feedbackSections.improvementSuggestions && (
                <div className={styles['feedback-card']}>
                  <div className={styles['card-header']}>
                    <span className={styles['card-icon']}>🚀</span>
                    <h3>Improvement Suggestions</h3>
                  </div>
                  <div className={styles['card-content']}>
                    {feedbackSections.improvementSuggestions.split('\n').map((line, index) => 
                      line.trim() && <p key={index}>{line.trim()}</p>
                    )}
                  </div>
                </div>
              )}
              
              {feedbackSections.updatedResume && (
                <div className={styles['feedback-card']}>
                  <div className={styles['card-header']}>
                    <span className={styles['card-icon']}>📝</span>
                    <h3>Updated Resume Version</h3>
                  </div>
                  <div className={styles['card-content']}>
                    <pre className={styles['resume-preview']}>
                      {feedbackSections.updatedResume}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={styles['fallback-feedback']}>
              <pre>{feedback}</pre>
            </div>
          )}
        </div>
      )}
      {score && (
        <div className={styles['score-section']}>
          <h2>Resume Score Analysis</h2>
          <div className={styles['score-grid']}>
            {Object.entries(score).map(([key, value]) => {
              const numValue = typeof value === 'number' ? value : 0;
              const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              return (
                <div key={key} className={styles['score-item']}>
                  <div className={styles['score-header']}>
                    <span className={styles['score-label']}>{formattedKey}</span>
                    <span className={styles['score-value']} style={{ color: getScoreColor(numValue) }}>
                      {numValue}/100
                    </span>
                  </div>
                  <div className={styles['progress-bar']}>
                    <div 
                      className={styles['progress-fill']}
                      style={{ 
                        width: `${numValue}%`,
                        backgroundColor: getScoreColor(numValue)
                      }}
                    />
                  </div>
                  <div className={styles['score-status']} style={{ color: getScoreColor(numValue) }}>
                    {getScoreLabel(numValue)}
                  </div>
                </div>
              );
            })}
          </div>
          <div className={styles['overall-score']}>
            <h3>Overall Assessment</h3>
            <div className={styles['overall-display']}>
              <span className={styles['overall-number']}>
                {score.overall_score || 0}
              </span>
              <span className={styles['overall-label']}>/ 100</span>
            </div>
            <div className={styles['overall-status']}>
              {getScoreLabel(score.overall_score || 0)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyzeResumePage; 