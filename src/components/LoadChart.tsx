import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { CircuitoItem } from '../types';
import { Activity, Zap } from 'lucide-react';

interface LoadChartProps {
  circuitos: CircuitoItem[];
}

export const LoadChart: React.FC<LoadChartProps> = ({ circuitos }) => {
  // Sort or process the list of circuits for graph display
  const chartData = useMemo(() => {
    return circuitos.map((cir) => {
      const p = cir.potencia;
      // Truncate name for XAxis labels if too long
      const truncatedName = cir.nome.length > 12 ? cir.nome.substring(0, 10) + '...' : cir.nome;
      return {
        id: cir.id,
        fullName: cir.nome,
        name: truncatedName,
        potencia: p,
        corrente: Number(cir.corrente) || 0,
        kva: Number(cir.kva) || 0,
        bitola: cir.bitola
      };
    });
  }, [circuitos]);

  // Dynamic calculations for overall stats inside the chart container
  const stats = useMemo(() => {
    if (!circuitos.length) return { maxName: '', maxVal: 0 };
    const maxItem = [...circuitos].sort((a, b) => b.potencia - a.potencia)[0];
    return {
      maxName: maxItem.nome,
      maxVal: maxItem.potencia
    };
  }, [circuitos]);

  // Color selection based on circuit power capacity to convey warning levels visually (e.g., high-power devices)
  const getBarColor = (watts: number) => {
    if (watts >= 5000) return '#f59e0b'; // Amber / Warning high load
    if (watts >= 3000) return '#eab308'; // Yellow / Medium-high load
    if (watts >= 1500) return '#06b6d4'; // Cyan / Medium load
    return '#10b981'; // Emerald / Low load
  };

  if (!circuitos.length) {
    return (
      <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-3xl p-5 text-center flex flex-col items-center justify-center min-h-[220px]">
        <Zap className="w-8 h-8 text-neutral-600 mb-2 animate-pulse" />
        <p className="text-xs text-slate-500 font-medium">
          Nenhum circuito salvo no memorial para exibir.
        </p>
        <p className="text-[10px] text-slate-600 font-mono mt-1">
          Adicione circuitos acima para visualizar a distribuição de carga graficamente.
        </p>
      </div>
    );
  }

  // Custom tooltips to present info elegently with technical styling
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-xl shadow-2xl text-xs space-y-1 z-50">
          <p className="font-extrabold text-white text-[11px] uppercase tracking-wide border-b border-neutral-800 pb-1 mb-1">{data.fullName}</p>
          <div className="flex justify-between gap-6">
            <span className="text-slate-400">Potência:</span>
            <strong className="text-amber-400 font-mono text-right">{data.potencia} W</strong>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-slate-400">Corrente:</span>
            <strong className="text-cyan-400 font-mono text-right">{data.corrente.toFixed(2)} A</strong>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-slate-400">CVA Aparente:</span>
            <strong className="text-cyan-500/80 font-mono text-right">{data.kva.toFixed(2)} kVA</strong>
          </div>
          <div className="flex justify-between gap-6 pt-1 border-t border-neutral-850">
            <span className="text-slate-400">Cabo sugerido:</span>
            <strong className="text-emerald-400 font-mono text-right">{data.bitola}</strong>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-neutral-900/85 border border-neutral-800 rounded-3xl p-5 backdrop-blur-md relative overflow-hidden transition-all duration-300">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between mb-4 border-b border-neutral-800/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/10 text-amber-500 border border-amber-500/15 rounded-xl">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-display block leading-none">
              Balanço de Carga do Memorial
            </span>
            <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
              Comparação visual de potências ativas (Watts)
            </span>
          </div>
        </div>
      </div>

      {/* QUICK HIGHLIGHT */}
      <div className="text-[10px] text-slate-400 flex justify-between bg-neutral-950 p-2.5 rounded-lg border border-neutral-850 mb-4 font-mono">
        <span>Maior carga: <strong className="text-amber-400">{stats.maxName} ({stats.maxVal}W)</strong></span>
        <span>Escalonador ativo</span>
      </div>

      {/* RECHARTS PLOT FRAME */}
      <div className="w-full h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 5, left: -25, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#737373"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#a3a3a3', fontStyle: 'normal' }}
            />
            <YAxis
              stroke="#737373"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#a3a3a3' }}
              unit="W"
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: '#ffffff0a' }}
            />
            <Bar dataKey="potencia" radius={[6, 6, 0, 0]} maxBarSize={32}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.potencia)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* COLOR PILL INDEX */}
      <div className="flex items-center justify-center gap-3.5 flex-wrap pt-2.5 border-t border-neutral-850 text-[9px] text-neutral-400 font-semibold font-mono uppercase tracking-wider">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
          <span>Pesado (≥5kW)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]" />
          <span>Alto (≥3kW)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]" />
          <span>Médio (≥1.5kW)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
          <span>Leve (&lt;1.5kW)</span>
        </div>
      </div>

    </div>
  );
};
