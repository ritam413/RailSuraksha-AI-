// src/components/AgentPipelineCanvas.tsx
import React from 'react';
import { Card } from './Common/Card';

interface AgentPipelineCanvasProps {
  isExecuting: boolean;
  onOpenDecisionLog: () => void;
}

export const AgentPipelineCanvas: React.FC<AgentPipelineCanvasProps> = ({ isExecuting, onOpenDecisionLog }) => {
  const steps = [
    { num: 1, title: 'Vision Hazard Detector', desc: 'YOLOv11 detects 1.2m Boulder @ 340m', active: true },
    { num: 2, title: 'Telemetry Aggregator', desc: 'Queries V=110 km/h, M=1400t, μ=0.35', active: isExecuting },
    { num: 3, title: 'Kavach Braking Agent', desc: 'RDSO formula calculates D_stop = 410m', active: isExecuting },
    { num: 4, title: 'Auto-Brake Actuator', desc: 'Solenoid signal dispatched to brakes', active: isExecuting }
  ];

  return (
    <Card title="4-Agent Safety Pipeline Execution Canvas" className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {steps.map((step) => (
          <div
            key={step.num}
            className={`p-4 rounded-xl border transition-all ${
              step.active
                ? 'bg-blue-50 border-[#2B7FFF] shadow-xs'
                : 'bg-slate-50 border-slate-200 opacity-60'
            }`}
            style={{ borderRadius: '12px' }}
          >
            <div className="flex items-center space-x-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-[#2B7FFF] text-white text-xs font-bold flex items-center justify-center">
                {step.num}
              </span>
              <h4 className="text-xs font-bold text-[#0F172A]">{step.title}</h4>
            </div>
            <p className="text-[11px] font-mono text-slate-600 leading-tight">{step.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onOpenDecisionLog}
          className="px-4 py-2 bg-[#F0F6FC] hover:bg-[#E6F0FA] text-[#0F172A] border border-[#D0DFEE] text-xs font-bold rounded-lg transition-all"
          style={{ borderRadius: '4px' }}
        >
          🔍 View Explainable Decision Log Drawer
        </button>
      </div>
    </Card>
  );
};
