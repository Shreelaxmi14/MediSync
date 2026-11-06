import React, { useState } from 'react';
import {
  TrendingUp,
  Brain,
  Sparkles,
  AlertCircle,
  Clock,
  Pill,
  RefreshCw,
  Info
} from 'lucide-react';
import { PatientProfile, AdherenceInsight } from '../../types';
import { storageService } from '../../services/storageService';

interface MyInsightsProps {
  patient: PatientProfile;
}

export const MyInsights: React.FC<MyInsightsProps> = ({ patient }) => {
  const [insightData, setInsightData] = useState<AdherenceInsight>(() =>
    storageService.getAdherenceInsights(patient.id)
  );
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const { overallRate, weeklyRate, monthlyRate, dailyBreakdown, medicineBreakdown } =
    storageService.calculateAdherence(patient.id, 7);
  const rhythmSlots = storageService.getCareRhythmData(patient.id);

  // Generate or refresh AI Adherence Summary
  const handleGenerateAiSummary = async () => {
    setIsGeneratingAi(true);
    setAiError(null);

    try {
      const payload = {
        patientName: patient.fullName,
        adherenceRate: overallRate,
        slotsData: rhythmSlots.map(s => ({
          name: s.label,
          slot: s.slot,
          rate: s.adherenceRate,
          total: s.totalScheduled,
          confirmed: s.confirmed,
          missed: s.missed,
        })),
        medicinesData: medicineBreakdown,
        missedReasons: insightData.missedReasonsBreakdown,
      };

      const res = await fetch('/api/ai/adherence-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setInsightData({
          ...insightData,
          qualitativeSummary: data.summary || insightData.qualitativeSummary,
          patterns: data.patterns || insightData.patterns,
          recommendations: data.recommendations || insightData.recommendations,
          source: data.source || 'gemini-3.8-flash',
        });
      } else {
        throw new Error(data.error || 'Failed to generate AI adherence summary');
      }
    } catch (err: any) {
      console.warn('AI summary fetch failed, using clinical rule engine fallback:', err);
      // Fallback is already present in rule engine
      const freshRules = storageService.getAdherenceInsights(patient.id);
      setInsightData(freshRules);
      setAiError('Loaded verified rule-based adherence analytics.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
              Pattern Intelligence
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">My Adherence Insights</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Behavioral analysis of confirmation timing, missed-dose patterns, and routine habits
          </p>
        </div>

        <button
          onClick={handleGenerateAiSummary}
          disabled={isGeneratingAi}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs flex items-center gap-2 shrink-0 self-start md:self-auto disabled:opacity-75"
        >
          {isGeneratingAi ? (
            <RefreshCw className="w-4 h-4 animate-spin text-teal-400" />
          ) : (
            <Brain className="w-4 h-4 text-teal-400" />
          )}
          <span>{isGeneratingAi ? 'Analyzing Adherence...' : 'Generate AI Routine Summary'}</span>
        </button>
      </div>

      {aiError && (
        <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-500" />
          <span>{aiError}</span>
        </div>
      )}

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Overall Adherence</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {overallRate}%
            </span>
            <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
              Target &gt; 80%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-teal-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${overallRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">7-Day Weekly Adherence</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-bold font-mono text-teal-800 tabular-nums">
              {weeklyRate}%
            </span>
            <span className="text-xs text-slate-500">Past 7 days</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-teal-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${weeklyRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">30-Day Monthly Rate</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-bold font-mono text-slate-800 tabular-nums">
              {monthlyRate}%
            </span>
            <span className="text-xs text-slate-500">Past 30 days</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-slate-700 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${monthlyRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* AI / Intelligent Engine Summary Box */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <h3 className="font-semibold text-sm tracking-wide">
              Behavioral Pattern Synthesis
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-white/10 px-2 py-0.5 rounded-md">
            Engine: {insightData.source}
          </span>
        </div>

        <p className="text-xs text-slate-200 leading-relaxed">
          {insightData.qualitativeSummary}
        </p>

        {/* Identified Patterns */}
        <div className="pt-2 border-t border-slate-700/60">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-300 block mb-2">
            Identified Routine Trends
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {insightData.patterns.map((pat, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-slate-300">
                {pat}
              </div>
            ))}
          </div>
        </div>

        {/* Supportive Suggestions */}
        <div className="pt-2 border-t border-slate-700/60">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-300 block mb-2">
            Supportive Behavioral Suggestions
          </span>
          <div className="space-y-1.5">
            {insightData.recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="text-teal-400 font-bold shrink-0">→</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800">
          Clinical Notice: Patterns are derived strictly from logged confirmation events and do not constitute clinical diagnosis or prescription adjustment advice.
        </p>
      </div>

      {/* 7-Day Adherence Bar Chart */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Daily Confirmation Performance (Last 7 Days)</h3>
            <p className="text-xs text-slate-500">Proportion of scheduled medications confirmed on time each day</p>
          </div>
          <span className="text-xs text-slate-500 font-mono">Target: 100%</span>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 pt-6 px-2">
          {dailyBreakdown.map((day) => {
            const barHeightPercent = Math.max(day.rate, 8);
            const isHigh = day.rate >= 80;

            return (
              <div key={day.date} className="flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-xs font-mono font-semibold text-slate-700 tabular-nums">
                  {day.rate}%
                </span>
                <div className="w-full max-w-[42px] bg-slate-100 rounded-t-lg h-full flex items-end overflow-hidden">
                  <div
                    style={{ height: `${barHeightPercent}%` }}
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      isHigh ? 'bg-teal-600' : 'bg-amber-500'
                    }`}
                  />
                </div>
                <div className="text-center">
                  <span className="text-xs font-medium text-slate-800 block">{day.dayName}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{day.date.slice(5)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Routine Slot Comparison & Medicine-Wise Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Time-Slot Adherence Comparison */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-1">Time Slot Adherence Comparison</h3>
          <p className="text-xs text-slate-500 mb-4">Historical confirmation rate across daily routines</p>

          <div className="space-y-3">
            {rhythmSlots.map(slot => (
              <div key={slot.slot} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{slot.label}</span>
                  </span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    {slot.adherenceRate}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${
                      slot.adherenceRate >= 85
                        ? 'bg-teal-600'
                        : slot.adherenceRate >= 70
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${slot.adherenceRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
            <span className="font-semibold text-slate-900">Highest adherence:</span> Morning Routine ({insightData.bestSlotRate}%).
            <span className="font-semibold text-slate-900 ml-2">Needs support:</span> Evening Routine ({insightData.worstSlotRate}%).
          </div>
        </div>

        {/* Medicine-Wise Adherence */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-1">Medicine-Specific Adherence</h3>
          <p className="text-xs text-slate-500 mb-4">Consistency rates for each prescribed medication</p>

          <div className="space-y-3">
            {medicineBreakdown.map((med, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800 flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-slate-400" />
                    <span>{med.name}</span>
                  </span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    {med.rate}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-teal-700 h-2 rounded-full"
                    style={{ width: `${med.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Missed-Dose Reasons Breakdown */}
          {insightData.missedReasonsBreakdown.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 mb-2">Patient-Reported Missed Reasons</h4>
              <div className="space-y-1.5">
                {insightData.missedReasonsBreakdown.slice(0, 3).map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-xs text-slate-600">
                    <span className="truncate mr-2">• {r.reason}</span>
                    <span className="font-mono font-medium text-slate-900 shrink-0">
                      {r.count} ({r.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
