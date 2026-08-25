'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DiscoveryReport as ReportType } from '@/lib/ai/types';
import { 
  Building2, 
  Users, 
  Cpu, 
  GitCommit, 
  AlertCircle, 
  Lightbulb, 
  Star, 
  CheckCircle2, 
  Download,
  FileText
} from 'lucide-react';

interface DiscoveryReportProps {
  report: ReportType;
  onRateQuality?: (score: number) => void;
}

export const DiscoveryReportView: React.FC<DiscoveryReportProps> = ({
  report,
  onRateQuality,
}) => {
  const [qualityScore, setQualityScore] = useState<number | null>(report.qualityScore || null);

  const handleRate = (score: number) => {
    setQualityScore(score);
    if (onRateQuality) onRateQuality(score);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-5xl mx-auto px-4 py-8 flex flex-col gap-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-borderDark pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-subtle mb-1">
            <FileText className="w-4 h-4 text-black" />
            <span>CONFIDENTIAL BUSINESS DISCOVERY REPORT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black">
            Operational Intelligence & Opportunity Analysis
          </h1>
          <p className="text-xs font-mono text-subtle mt-1">
            Generated on {new Date(report.createdAt).toLocaleDateString()} for {report.businessProfile.industry}
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-borderDark bg-surface text-black text-xs font-mono font-medium hover:bg-black hover:text-white transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export / Print</span>
        </button>
      </div>

      {/* 1. Executive Summary (PRD Section 20) */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-borderDark flex flex-col gap-3">
        <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-subtle">
          Executive Summary
        </h2>
        <p className="text-base text-black leading-relaxed font-medium">
          {report.executiveSummary}
        </p>
      </div>

      {/* 2. Business Profile & Team Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Profile */}
        <div className="glass-card p-6 rounded-2xl border border-borderDark flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-black border-b border-borderDark pb-3">
            <Building2 className="w-4 h-4 text-black" />
            <span>Business Profile</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 rounded-lg bg-surface border border-borderDark">
              <span className="text-subtle">INDUSTRY</span>
              <p className="font-semibold text-black text-sm mt-0.5">{report.businessProfile.industry}</p>
            </div>
            <div className="p-3 rounded-lg bg-surface border border-borderDark">
              <span className="text-subtle">TEAM SIZE</span>
              <p className="font-semibold text-black text-sm mt-0.5">{report.businessProfile.employeeCount} Employees</p>
            </div>
            <div className="p-3 rounded-lg bg-surface border border-borderDark">
              <span className="text-subtle">ESTIMATED CLIENTS</span>
              <p className="font-semibold text-black text-sm mt-0.5">{report.businessProfile.clientCount} Active Clients</p>
            </div>
            <div className="p-3 rounded-lg bg-surface border border-borderDark">
              <span className="text-subtle">MODEL</span>
              <p className="font-semibold text-black text-xs mt-0.5">{report.businessProfile.businessModel}</p>
            </div>
          </div>

          <div>
            <span className="text-xs font-mono text-subtle">SERVICES OFFERED</span>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {report.businessProfile.services.map((s, i) => (
                <span key={i} className="px-2.5 py-1 rounded-md bg-surface border border-borderDark text-xs font-medium text-black">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Team Structure */}
        <div className="glass-card p-6 rounded-2xl border border-borderDark flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-black border-b border-borderDark pb-3">
            <Users className="w-4 h-4 text-black" />
            <span>Team & Governance</span>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <div>
              <span className="font-mono text-subtle">ROLES & ORGANIZATION</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {report.teamStructure.roles.map((r, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-md bg-surface border border-borderDark font-medium text-black">
                    {r}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface border border-borderDark font-mono">
              <span className="text-subtle">TASK ASSIGNMENT METHOD</span>
              <p className="font-semibold text-black text-sm mt-0.5">{report.teamStructure.taskAssignment}</p>
            </div>

            <div className="p-3 rounded-lg bg-surface border border-borderDark font-mono">
              <span className="text-subtle">ACCOUNTABILITY METHOD</span>
              <p className="font-semibold text-black text-sm mt-0.5">{report.teamStructure.accountabilityMethod}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Technology Stack & Information Flow */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-borderDark flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm font-bold text-black border-b border-borderDark pb-3">
          <Cpu className="w-4 h-4 text-black" />
          <span>Technology Stack & Information Flow</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div>
            <span className="font-mono text-subtle">CORE SOFTWARE & TOOLS</span>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {report.technologyStack.coreTools.map((t, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg bg-black text-white font-mono font-medium">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="font-mono text-subtle">UNINTEGRATED MANUAL GAPS</span>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {report.technologyStack.manualGaps.map((g, i) => (
                <span key={i} className="px-2.5 py-1 rounded-md bg-surface border border-borderDark text-red-600 font-medium">
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-borderDark mt-2">
          <span className="text-xs font-mono font-semibold text-subtle">HOW INFORMATION MOVES BETWEEN TOOLS</span>
          <p className="text-sm font-medium text-black mt-1 leading-relaxed">
            {report.technologyStack.informationFlow}
          </p>
        </div>
      </div>

      {/* 4. Workflow Map */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-borderDark flex flex-col gap-6">
        <div className="flex items-center gap-2 text-sm font-bold text-black border-b border-borderDark pb-3">
          <GitCommit className="w-4 h-4 text-black" />
          <span>Operational Workflow Map</span>
        </div>

        {report.workflowMap.map((wf, idx) => (
          <div key={idx} className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-base font-bold text-black">{wf.name}</h3>
              <span className="text-xs font-mono text-subtle">Trigger: {wf.trigger}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {wf.steps.map((step) => (
                <div key={step.stepNumber} className="p-4 rounded-xl bg-surface border border-borderDark flex flex-col gap-2 relative">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center font-bold">
                      {step.stepNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${step.painLevel >= 7 ? 'bg-black text-white' : 'bg-white border text-black'}`}>
                      Pain {step.painLevel}/10
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-black">{step.name}</h4>
                  <div className="text-[11px] text-subtle font-mono mt-auto">
                    <div>Role: {step.role}</div>
                    <div>Tool: {step.tool}</div>
                  </div>
                </div>
              ))}
            </div>

            {wf.bottlenecks.length > 0 && (
              <div className="p-3 rounded-lg bg-surface border border-borderDark text-xs font-mono text-black flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-black" />
                <span>{wf.bottlenecks.join(', ')}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 5. Ranked Operational Problems (PRD Section 20 & 21) */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-borderDark flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-borderDark pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-black">
            <AlertCircle className="w-4 h-4 text-black" />
            <span>Ranked Operational Problems</span>
          </div>
          <span className="text-xs font-mono text-subtle">Ranked by Opportunity Score Formula</span>
        </div>

        <div className="flex flex-col gap-6">
          {report.rankedProblems.map((problem, idx) => (
            <div key={problem.id} className="p-6 rounded-xl border border-borderDark bg-white flex flex-col gap-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-black text-white font-mono font-bold text-xs flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-black">{problem.title}</h3>
                    <span className="text-xs font-mono text-subtle capitalize">Category: {problem.category.replace(/_/g, ' ')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-lg bg-black text-white text-xs font-mono font-bold">
                    Opportunity Score: {problem.score}/100
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-black leading-relaxed">
                {problem.description}
              </p>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded bg-surface border border-borderDark">
                  <span className="text-subtle block text-[10px]">SEVERITY</span>
                  <span className="font-bold text-black">{problem.severity}/10</span>
                </div>
                <div className="p-2.5 rounded bg-surface border border-borderDark">
                  <span className="text-subtle block text-[10px]">FREQUENCY</span>
                  <span className="font-bold text-black capitalize">{problem.frequency}</span>
                </div>
                <div className="p-2.5 rounded bg-surface border border-borderDark">
                  <span className="text-subtle block text-[10px]">TIME IMPACT</span>
                  <span className="font-bold text-black capitalize">{problem.timeImpact}</span>
                </div>
                <div className="p-2.5 rounded bg-surface border border-borderDark">
                  <span className="text-subtle block text-[10px]">EVIDENCE CONFIDENCE</span>
                  <span className="font-bold text-black">{Math.round(problem.confidence * 100)}%</span>
                </div>
              </div>

              {/* Workaround & Root Cause */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded bg-surface border border-borderDark">
                  <span className="font-mono text-subtle text-[10px] block">CURRENT WORKAROUND</span>
                  <p className="font-medium text-black mt-0.5">{problem.currentWorkaround}</p>
                </div>
                <div className="p-3 rounded bg-surface border border-borderDark">
                  <span className="font-mono text-subtle text-[10px] block">ROOT CAUSE ANALYSIS</span>
                  <p className="font-medium text-black mt-0.5">{problem.rootCause}</p>
                </div>
              </div>

              {/* Evidence citations */}
              {problem.evidenceList && problem.evidenceList.length > 0 && (
                <div className="border-t border-borderDark pt-3 mt-1">
                  <span className="text-[11px] font-mono text-subtle block mb-1">Supporting Interview Evidence:</span>
                  <ul className="list-disc list-inside text-xs text-subtle space-y-0.5">
                    {problem.evidenceList.map((ev, i) => (
                      <li key={i}>{ev}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 6. Opportunity Validation Roadmap */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-borderDark flex flex-col gap-6">
        <div className="flex items-center gap-2 text-sm font-bold text-black border-b border-borderDark pb-3">
          <Lightbulb className="w-4 h-4 text-black" />
          <span>Opportunity Validation Roadmap</span>
        </div>

        <div className="flex flex-col gap-4">
          {report.opportunityValidation.map((opp, idx) => (
            <div key={idx} className="p-5 rounded-xl bg-surface border border-borderDark flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-black text-white text-xs font-mono font-bold">
                  Validation Step {idx + 1}
                </span>
                <h4 className="text-sm font-bold text-black">{opp.areaToValidate}</h4>
              </div>

              <p className="text-xs text-black font-medium leading-relaxed">
                {opp.rationale}
              </p>

              <div>
                <span className="text-xs font-mono text-subtle block mb-1">RECOMMENDED EXPERIMENT:</span>
                <ul className="list-disc list-inside text-xs text-black font-mono space-y-1">
                  {opp.recommendedExperiments.map((exp, i) => (
                    <li key={i}>{exp}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Core Quality Score Feedback Prompt (PRD Section 39 Core Metric) */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-borderDark bg-surface flex flex-col items-center text-center gap-4">
        <h3 className="text-base font-bold text-black">
          How accurately did this interview identify the most important problems in your business?
        </h3>
        <p className="text-xs text-subtle font-mono max-w-lg">
          Your feedback powers the adaptive AI reasoning engine. (Rating scale 1 - 5)
        </p>

        <div className="flex items-center gap-3 my-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRate(star)}
              className={`p-3 rounded-xl border transition-all ${
                qualityScore && qualityScore >= star
                  ? 'bg-black text-white border-black scale-105'
                  : 'bg-white text-black border-borderDark hover:bg-surface'
              }`}
            >
              <Star className={`w-5 h-5 ${qualityScore && qualityScore >= star ? 'fill-white' : ''}`} />
            </button>
          ))}
        </div>

        {qualityScore && (
          <div className="flex items-center gap-2 text-xs font-mono text-black">
            <CheckCircle2 className="w-4 h-4" />
            <span>Thank you! Score of {qualityScore}/5 recorded.</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
