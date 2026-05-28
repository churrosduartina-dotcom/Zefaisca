/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  Activity,
  Calculator,
  Printer,
  BookOpen,
  User,
  MapPin,
  Calendar,
  Building,
  CheckCircle2,
  Sliders,
  Scale,
  Gauge,
  Info,
  Undo,
  Trash2,
  Plus,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  Cpu,
  Share2,
  Layers,
  ChevronDown,
  TrendingDown,
  Clock,
  PrinterIcon
} from 'lucide-react';
import { AppliancePreset, CircuitoItem } from './types';
import appLogo from './assets/images/app_logo_1779886943076.png';
import { LoadChart } from './components/LoadChart';

// Accurate NBR 5410 PVC Conductor Capacities for Copper & Aluminum under different reference installation methods
// Columns index different loaded conductors configurations (2 loaded vs 3 loaded)
interface MaterialAmpacity {
  copper2L: number;
  copper3L: number;
  alu2L: number;
  alu3L: number;
}

const NBR_AMPACITY_TABLE: Record<'A1' | 'B1' | 'C' | 'D', Record<number, MaterialAmpacity>> = {
  A1: {
    1.5: { copper2L: 14.5, copper3L: 13.5, alu2L: 11, alu3L: 10 },
    2.5: { copper2L: 19.5, copper3L: 18, alu2L: 15, alu3L: 13.5 },
    4.0: { copper2L: 26, copper3L: 24, alu2L: 20, alu3L: 18 },
    6.0: { copper2L: 34, copper3L: 31, alu2L: 26, alu3L: 24 },
    10.0: { copper2L: 46, copper3L: 42, alu2L: 35, alu3L: 32 },
    16.0: { copper2L: 61, copper3L: 56, alu2L: 47, alu3L: 43 },
    25.0: { copper2L: 80, copper3L: 73, alu2L: 61, alu3L: 56 },
    35.0: { copper2L: 99, copper3L: 89, alu2L: 76, alu3L: 68 },
    50.0: { copper2L: 119, copper3L: 108, alu2L: 91, alu3L: 83 }
  },
  B1: {
    1.5: { copper2L: 17.5, copper3L: 15.5, alu2L: 13.5, alu3L: 12 },
    2.5: { copper2L: 24, copper3L: 21, alu2L: 18.5, alu3L: 16 },
    4.0: { copper2L: 32, copper3L: 28, alu2L: 25, alu3L: 22 },
    6.0: { copper2L: 41, copper3L: 36, alu2L: 32, alu3L: 28 },
    10.0: { copper2L: 57, copper3L: 50, alu2L: 44, alu3L: 39 },
    16.0: { copper2L: 76, copper3L: 68, alu2L: 59, alu3L: 53 },
    25.0: { copper2L: 101, copper3L: 89, alu2L: 78, alu3L: 69 },
    35.0: { copper2L: 125, copper3L: 110, alu2L: 96, alu3L: 85 },
    50.0: { copper2L: 151, copper3L: 134, alu2L: 117, alu3L: 103 }
  },
  C: {
    1.5: { copper2L: 19.5, copper3L: 17.5, alu2L: 15, alu3L: 13.5 },
    2.5: { copper2L: 27, copper3L: 24, alu2L: 21, alu3L: 18.5 },
    4.0: { copper2L: 36, copper3L: 32, alu2L: 28, alu3L: 25 },
    6.0: { copper2L: 46, copper3L: 41, alu2L: 36, alu3L: 32 },
    10.0: { copper2L: 63, copper3L: 57, alu2L: 49, alu3L: 44 },
    16.0: { copper2L: 85, copper3L: 76, alu2L: 66, alu3L: 59 },
    25.0: { copper2L: 112, copper3L: 101, alu2L: 87, alu3L: 78 },
    35.0: { copper2L: 138, copper3L: 125, alu2L: 107, alu3L: 96 },
    50.0: { copper2L: 168, copper3L: 151, alu2L: 131, alu3L: 117 }
  },
  D: {
    1.5: { copper2L: 22, copper3L: 18.5, alu2L: 17, alu3L: 14.5 },
    2.5: { copper2L: 29, copper3L: 24, alu2L: 23, alu3L: 18.5 },
    4.0: { copper2L: 38, copper3L: 31, alu2L: 29, alu3L: 24 },
    6.0: { copper2L: 47, copper3L: 39, alu2L: 36, alu3L: 30 },
    10.0: { copper2L: 63, copper3L: 52, alu2L: 49, alu3L: 40 },
    16.0: { copper2L: 81, copper3L: 67, alu2L: 62, alu3L: 52 },
    25.0: { copper2L: 104, copper3L: 86, alu2L: 80, alu3L: 66 },
    35.0: { copper2L: 125, copper3L: 103, alu2L: 96, alu3L: 79 },
    50.0: { copper2L: 148, copper3L: 122, alu2L: 114, alu3L: 94 }
  }
};

const SECTIONS_LIST = [1.5, 2.5, 4.0, 6.0, 10.0, 16.0, 25.0, 35.0, 50.0];

// Extensive appliance presets representing Brazilian households and utility connections
const APPLIANCE_PRESETS: AppliancePreset[] = [
  {
    id: 'chuveiro_padrao',
    name: 'Chuveiro Comum',
    potencia: 5500,
    fatorPotencia: 1.0,
    description: 'Chuveiro elétrico padrão. Carga puramente resistiva.'
  },
  {
    id: 'chuveiro_turbo',
    name: 'Chuveiro Turbo',
    potencia: 7500,
    fatorPotencia: 1.0,
    description: 'Chuveiro de alta potência para aquecimento rápido.'
  },
  {
    id: 'ar_condicionado',
    name: 'Ar Condicionado (12k BTU)',
    potencia: 1400,
    fatorPotencia: 0.85,
    description: 'Condicionador de ar inverter convencional.'
  },
  {
    id: 'motor_monofasico',
    name: 'Bomba / Motor (2 cv)',
    potencia: 1500,
    fatorPotencia: 0.82,
    description: 'Motobomba monofásica ou trifásica.'
  },
  {
    id: 'tomada_cozinha',
    name: 'Circuito Cozinha (TUE)',
    potencia: 4400,
    fatorPotencia: 0.95,
    description: 'Circuito para eletrodomésticos pesados (forno, microondas).'
  },
  {
    id: 'tomada_geral',
    name: 'Tomadas Gerais (TUG)',
    potencia: 2200,
    fatorPotencia: 0.92,
    description: 'Circuito padrão de tomadas de uso comum em salas e quartos.'
  }
];

export default function App() {
  // Real-time parameters
  const [potencia, setPotencia] = useState<number>(5000);
  const [tensao, setTensao] = useState<number>(220);
  const [distancia, setDistancia] = useState<number>(20);
  const [fatorPotencia, setFatorPotencia] = useState<number>(0.92);

  // New highly functional advanced inputs
  const [fases, setFases] = useState<number>(1); // 1 = Monofásico, 2 = Bifásico, 3 = Trifásico
  const [material, setMaterial] = useState<'cobre' | 'aluminio'>('cobre');
  const [metodoInstalacao, setMetodoInstalacao] = useState<'A1' | 'B1' | 'C' | 'D'>('B1'); // NBR 5410 reference method
  const [limiteQueda, setLimiteQueda] = useState<number>(4); // default 4% limit as per NBR 5410
  const [breakerActive, setBreakerActive] = useState<boolean>(true); // interactive circuit breaker
  const [customCircuitName, setCustomCircuitName] = useState<string>('Circuito 1');

  // Client and Project metadata for PDF/Print report
  const [nomeCliente, setNomeCliente] = useState<string>('');
  const [enderecoObra, setEnderecoObra] = useState<string>('');
  const [observacoes, setObservacoes] = useState<string>('');
  const [eletricista, setEletricista] = useState<string>('Donizete Meireles');
  const [dataCalculo, setDataCalculo] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Circuit history state
  const [circuitosSalvos, setCircuitosSalvos] = useState<CircuitoItem[]>([]);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Read saved circuits on mount
  useEffect(() => {
    const stored = localStorage.getItem('eletricista-calculos-v1');
    if (stored) {
      try {
        setCircuitosSalvos(JSON.parse(stored));
      } catch (e) {
        console.error('Falha ao ler cache local', e);
      }
    }
  }, []);

  // Save changes to localStorage
  const saveToStorage = (updated: CircuitoItem[]) => {
    setCircuitosSalvos(updated);
    localStorage.setItem('eletricista-calculos-v1', JSON.stringify(updated));
  };

  // Calculations
  const corrente = useMemo(() => {
    if (!breakerActive) return '0.00';
    if (tensao <= 0 || fatorPotencia <= 0) return '0.00';

    if (fases === 3) {
      // Trifásico: I = P / (√3 * V * cos φ)
      return (potencia / (1.73205 * tensao * fatorPotencia)).toFixed(2);
    } else {
      // Monofásico / Bifásico comum: I = P / (V * cos φ)
      return (potencia / (tensao * fatorPotencia)).toFixed(2);
    }
  }, [potencia, tensao, fatorPotencia, fases, breakerActive]);

  const kva = useMemo(() => {
    if (!breakerActive) return '0.00';
    if (fatorPotencia <= 0) return '0.00';
    return (potencia / 1000 / fatorPotencia).toFixed(2);
  }, [potencia, fatorPotencia, breakerActive]);

  // Exact function requested by the user originally (Rule 1: Donizete Simplificada)
  const calcularBitolaSimplificada = (correnteVal: number, distanciaVal: number) => {
    const quedaVal = distanciaVal * correnteVal;
    if (quedaVal <= 200) return '2.5 mm²';
    if (quedaVal <= 400) return '4.0 mm²';
    if (quedaVal <= 700) return '6.0 mm²';
    if (quedaVal <= 1000) return '10.0 mm²';
    if (quedaVal <= 1600) return '16.0 mm²';
    if (quedaVal <= 2500) return '25.0 mm²';
    return '35.0 mm² ou superior';
  };

  const bitolaSimplificada = useMemo(() => {
    return calcularBitolaSimplificada(Number(corrente), Number(distancia));
  }, [corrente, distancia]);

  // Dynamic formula helper for NBR 5410 compliance drop percentage
  const getQuedaDeTensaoSpecs = (section: number, currentVal: number) => {
    const rho = material === 'cobre' ? 0.0172 : 0.0282; // copper or aluminium resistivity
    const factorN = fases === 3 ? 1.73205 : 2; // phase loop factor
    
    // Voltage drop formula: ∆V = (N * rho * L * I) / S
    const dropVolts = (factorN * rho * distancia * currentVal) / section;
    const dropPercent = tensao > 0 ? (dropVolts / tensao) * 100 : 0;
    
    // NBR 5410 ampacity limit check for the selected installation method
    const methodTable = NBR_AMPACITY_TABLE[metodoInstalacao] || NBR_AMPACITY_TABLE['B1'];
    const limitStruct = methodTable[section] || { copper2L: 10, copper3L: 10, alu2L: 5, alu3L: 5 };
    let maxCurrentLimit = limitStruct.copper2L;
    if (material === 'cobre') {
      maxCurrentLimit = fases === 3 ? limitStruct.copper3L : limitStruct.copper2L;
    } else {
      maxCurrentLimit = fases === 3 ? limitStruct.alu3L : limitStruct.alu2L;
    }

    return {
      dropVolts: parseFloat(dropVolts.toFixed(2)),
      dropPercent: parseFloat(dropPercent.toFixed(2)),
      ampacityLimit: maxCurrentLimit,
      isOverload: currentVal > maxCurrentLimit,
      isDropUnsafe: dropPercent > limiteQueda
    };
  };

  // Real-time list of all wires sections with compliance diagnostics
  const tableComparison = useMemo(() => {
    const activeCurrNum = Number(corrente);
    return SECTIONS_LIST.map((sec) => {
      const specs = getQuedaDeTensaoSpecs(sec, activeCurrNum);
      return {
        section: sec,
        label: `${sec.toFixed(1)} mm²`,
        ...specs
      };
    });
  }, [corrente, distancia, tensao, fases, material, limiteQueda, metodoInstalacao]);

  // Recommended NBR 5410 compliance gauge: smallest section with no overload and safe voltage drop
  const bitolaNBR5410 = useMemo(() => {
    const currentNum = Number(corrente);
    if (currentNum <= 0) return '1.5 mm²';
    
    const matched = tableComparison.find(c => !c.isOverload && !c.isDropUnsafe);
    if (matched) return matched.label;
    
    // If all standard sections up to 50 overload or leak, recommend custom high rating
    return '50.0 mm² ou superior';
  }, [tableComparison, corrente]);

  // Select optimal diameter visual mapping for graphics rendering
  const diameterRenderStats = useMemo(() => {
    const matchedSec = parseFloat(bitolaNBR5410);
    if (isNaN(matchedSec)) return { size: 'w-16 h-16', border: 'border-[6px]', diameter: 'Ø ~5mm' };
    
    if (matchedSec <= 1.5) return { size: 'w-7 h-7', border: 'border-2', diameter: 'Ø 1.38mm' };
    if (matchedSec <= 2.5) return { size: 'w-9 h-9', border: 'border-2', diameter: 'Ø 1.78mm' };
    if (matchedSec <= 4.0) return { size: 'w-11 h-11', border: 'border-3', diameter: 'Ø 2.26mm' };
    if (matchedSec <= 6.0) return { size: 'w-13 h-13', border: 'border-[4px]', diameter: 'Ø 2.76mm' };
    if (matchedSec <= 10.0) return { size: 'w-16 h-16', border: 'border-[5px]', diameter: 'Ø 3.57mm' };
    if (matchedSec <= 16.0) return { size: 'w-20 h-20', border: 'border-[6px]', diameter: 'Ø 4.51mm' };
    if (matchedSec <= 25.0) return { size: 'w-24 h-24', border: 'border-[7px]', diameter: 'Ø 5.64mm' };
    if (matchedSec <= 35.0) return { size: 'w-28 h-28', border: 'border-[8px]', diameter: 'Ø 6.70mm' };
    return { size: 'w-32 h-32', border: 'border-[10px]', diameter: 'Ø >8.0mm' };
  }, [bitolaNBR5410]);

  // Apply a convenient appliance preset
  const handleApplyPreset = (preset: AppliancePreset) => {
    setPotencia(preset.potencia);
    setFatorPotencia(preset.fatorPotencia);
    setCustomCircuitName(preset.name);
  };

  // Reset parameters to original values requested by the user
  const handleResetToDefaults = () => {
    setPotencia(5000);
    setTensao(220);
    setDistancia(20);
    setFatorPotencia(0.92);
    setFases(1);
    setMaterial('cobre');
    setMetodoInstalacao('B1');
    setLimiteQueda(4);
    setBreakerActive(true);
    setCustomCircuitName('Circuito 1');
  };

  // Save current dynamic calculation to historical local listing
  const handleSaveCircuit = () => {
    if (Number(corrente) <= 0) return;

    const selectedSpecs = getQuedaDeTensaoSpecs(parseFloat(bitolaNBR5410) || 2.5, Number(corrente));

    const item: CircuitoItem = {
      id: `cir-${Date.now()}`,
      nome: customCircuitName || `Circuito ${potencia}W`,
      potencia,
      tensao,
      fases,
      distancia,
      fatorPotencia,
      material,
      bitola: bitolaNBR5410,
      corrente,
      kva,
      quedaPercentual: `${selectedSpecs.dropPercent}%`,
      data: new Date().toLocaleDateString('pt-BR'),
      // Store the installation method
      metodo: metodoInstalacao
    };

    const nextList = [item, ...circuitosSalvos];
    saveToStorage(nextList);
    
    // Visual success spark trigger
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);

    // Auto increment default serial label
    setCustomCircuitName(`Circuito ${nextList.length + 1}`);
  };

  // Delete individual historical item
  const handleDeleteCircuit = (id: string) => {
    const nextList = circuitosSalvos.filter(c => c.id !== id);
    saveToStorage(nextList);
  };

  // Clear entire historical log
  const handleClearAllHistory = () => {
    if (confirm('Deseja realmente limpar toda a lista de circuitos salvos?')) {
      saveToStorage([]);
    }
  };

  // Sum total power variables to show aggregates
  const historyAggregates = useMemo(() => {
    return circuitosSalvos.reduce((acc, curr) => {
      acc.potenciaTotal += curr.potencia;
      acc.kvaTotal += parseFloat(curr.kva) || 0;
      return acc;
    }, { potenciaTotal: 0, kvaTotal: 0 });
  }, [circuitosSalvos]);

  // Current flow anim speed
  const animDuration = useMemo(() => {
    const corrVal = Number(corrente);
    if (corrVal <= 0) return 0;
    // Faster current = faster animation speed
    const duration = 20 / corrVal; // clamp between 0.3s and 4.0s
    return Math.max(0.3, Math.min(4.0, duration));
  }, [corrente]);

  return (
    <div className="min-h-screen bg-[#0d0f12] text-slate-100 font-sans p-3 sm:p-6 lg:p-8 selection:bg-yellow-500 selection:text-neutral-950">
      
      {/* BACKGROUND GRAPHIC DESIGN GLOWS */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 no-print">
        <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[50%] rounded-full bg-amber-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute top-[40%] right-[10%] w-[30%] h-[30%] rounded-full bg-cyan-500/5 blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* TOP COMPACT BRANDING BAR */}
        <header className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-neutral-800/80 pb-5 no-print">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500 rounded-xl blur-md opacity-30 animate-pulse" />
              <img
                src={appLogo}
                alt="Donizete Meireles Cálculos Elétricos"
                className="relative w-14 h-14 object-cover rounded-xl border border-neutral-700/60 shadow-lg ring-1 ring-white/15"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Profissional NBR 5410
                </span>
                <span className="text-[10px] bg-neutral-800 text-neutral-400 font-mono px-2 py-0.5 rounded-full">
                  v2.0
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight mt-0.5 leading-none">
                Cálculos Elétricos
              </h1>
              <span className="text-xs text-amber-500 font-mono font-medium block mt-0.5">
                Donizete Meireles
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handleResetToDefaults}
              className="px-3.5 py-2 text-xs font-semibold bg-neutral-800/80 hover:bg-neutral-800 text-slate-300 rounded-xl border border-neutral-700/60 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              title="Zerar todos os coeficientes"
            >
              <Undo className="w-3.5 h-3.5" />
              Zerar Valores
            </button>

            <button
              onClick={() => window.print()}
              className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-neutral-950 fill-neutral-950/20" />
              Imprimir Relatório
            </button>
          </div>
        </header>

        {/* DYNAMIC METADATA INPUT CARD AND HEADER SECTION */}
        <section className="mb-6 bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 sm:p-5 no-print relative overflow-hidden shadow-xs">
          <div className="absolute right-0 top-0 text-amber-500/2 opacity-5 font-black text-7xl select-none uppercase pointer-events-none">
            Donizete
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            
            <div className="md:col-span-1 space-y-1">
              <h2 className="text-sm font-bold text-slate-300 font-display flex items-center gap-1.5">
                <User className="text-amber-500 w-4 h-4" />
                Dono do Projeto
              </h2>
              <input
                type="text"
                value={nomeCliente}
                onChange={(e) => setNomeCliente(e.target.value)}
                placeholder="Nome do Cliente (ex: Sr. Donizete Meireles)"
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 outline-none rounded-xl p-2.5 text-xs text-white transition-all focus:ring-1 focus:ring-amber-500/25"
              />
            </div>

            <div className="md:col-span-1 space-y-1">
              <h2 className="text-sm font-bold text-slate-300 font-display flex items-center gap-1.5">
                <MapPin className="text-amber-500 w-4 h-4" />
                Local da Obra/Instalação
              </h2>
              <input
                type="text"
                value={enderecoObra}
                onChange={(e) => setEnderecoObra(e.target.value)}
                placeholder="Endereço ou Identificação do Condomínio"
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 outline-none rounded-xl p-2.5 text-xs text-white transition-all focus:ring-1 focus:ring-amber-500/25"
              />
            </div>

            <div className="md:col-span-1 space-y-1">
              <h2 className="text-sm font-bold text-slate-300 font-display flex items-center gap-1.5">
                <Calendar className="text-amber-500 w-4 h-4" />
                Responsável Técnico
              </h2>
              <input
                type="text"
                value={eletricista}
                onChange={(e) => setEletricista(e.target.value)}
                placeholder="Eletricista Responsável"
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 outline-none rounded-xl p-2.5 text-xs text-white transition-all focus:ring-1 focus:ring-amber-500/25"
              />
            </div>

          </div>
        </section>

        {/* PRIMARY BENTO GRID INTERFACE */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT BENTO RAIL: INPUT CONTROLS (7 cols) */}
          <main className="lg:col-span-7 space-y-6 no-print">

            {/* PRESETS CONTAINER */}
            <div className="bg-neutral-900/85 border border-neutral-800 rounded-3xl p-5 relative overflow-hidden backdrop-blur-md">
              <div className="flex items-center justify-between mb-4.5">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/15">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-200 tracking-wider uppercase font-display">Tabela Prática de Cargas</h3>
                    <p className="text-[10px] text-slate-400">Atalhos rápidos de equipamentos e TUGs</p>
                  </div>
                </div>
              </div>

              <div id="quick-presets" className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {APPLIANCE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset)}
                    className={`p-3 rounded-2xl border text-left transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer ${
                      potencia === preset.potencia && fatorPotencia === preset.fatorPotencia
                        ? 'bg-amber-500 border-amber-500 text-neutral-950 shadow-md ring-2 ring-amber-500/20'
                        : 'bg-neutral-950 border-neutral-800/80 hover:border-neutral-700 text-slate-300'
                    }`}
                  >
                    <div className="font-extrabold text-xs truncate">{preset.name}</div>
                    <div className={`text-[9px] mt-1 font-mono font-black ${
                      potencia === preset.potencia && fatorPotencia === preset.fatorPotencia
                        ? 'text-neutral-800'
                        : 'text-amber-500'
                    }`}>
                      {preset.potencia}W • FP {preset.fatorPotencia}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* PARAMETERS CONFIG CARD */}
            <div className="bg-neutral-900/85 border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-6 backdrop-blur-md relative">
              <div className="flex items-center justify-between border-b border-neutral-800/70 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500/10 text-amber-500 border border-amber-500/15 rounded-xl">
                    <Cpu className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black font-display text-white uppercase tracking-wider">Parâmetros das Instalações</h3>
                    <p className="text-[11px] text-slate-400">Entre com os dados reais do seu circuito elétrico</p>
                  </div>
                </div>
                
                {/* Circuit interactive breaker */}
                <button
                  type="button"
                  onClick={() => setBreakerActive(!breakerActive)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 border transition-all ${
                    breakerActive
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
                  }`}
                  title="Clique para desenergizar e testar"
                >
                  <div className={`w-2 h-2 rounded-full ${breakerActive ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                  Disjuntor: {breakerActive ? 'Ligado' : 'Desligado'}
                </button>
              </div>

              {/* LIVE INPUT FIELDS CONTROLS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* NOME CIRCUITO */}
                <div className="space-y-1.5 sm:col-span-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Identificador / Nome do Circuito
                    </label>
                    <span className="text-[9px] text-slate-400 font-mono">Para salvar no memorial</span>
                  </div>
                  <input
                    type="text"
                    value={customCircuitName}
                    onChange={(e) => setCustomCircuitName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800/80 focus:border-amber-500 text-slate-100 font-bold outline-none rounded-xl p-3 text-sm transition-all focus:ring-1 focus:ring-amber-500/30"
                    placeholder="Ex: Circuito Chuveiro Suíte"
                  />
                </div>

                {/* POTENCIA */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="pot-inp" className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Potência Ativa (Watts)
                    </label>
                    <HelpCircle className="w-3.5 h-3.5 text-neutral-500 hover:text-amber-500 cursor-help" title="Carga ativa total em Watts instalada no final do cabo" />
                  </div>
                  <div className="relative">
                    <input
                      id="pot-inp"
                      type="number"
                      value={potencia || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPotencia(val === '' ? 0 : Math.max(0, Number(val)));
                      }}
                      className="w-full bg-neutral-950 border border-neutral-800/80 focus:border-amber-500 text-white font-mono font-black text-lg outline-none rounded-2xl p-3.5 px-4 transition-all focus:ring-2 focus:ring-amber-500/20"
                      placeholder="0"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center text-[10px] font-black text-amber-500 uppercase">
                      Watts
                    </div>
                  </div>
                </div>

                {/* DISTANCIA */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="dist-inp" className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Distância Linear (Metros)
                    </label>
                    <HelpCircle className="w-3.5 h-3.5 text-neutral-500 hover:text-amber-500 cursor-help" title="Distância total do cabo entre o quadro de disjuntores e a carga conectada" />
                  </div>
                  <div className="relative">
                    <input
                      id="dist-inp"
                      type="number"
                      value={distancia || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDistancia(val === '' ? 0 : Math.max(0, Number(val)));
                      }}
                      className="w-full bg-neutral-950 border border-neutral-800/80 focus:border-amber-500 text-white font-mono font-black text-lg outline-none rounded-2xl p-3.5 px-4 transition-all focus:ring-2 focus:ring-amber-500/20"
                      placeholder="20"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-amber-500 uppercase">
                      Metros
                    </div>
                  </div>
                </div>

                {/* TENSÃO TOGGLE GRIDS */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Tensão Nominal (Volts)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[127, 220, 380].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setTensao(v)}
                        className={`py-3 rounded-xl font-mono font-black text-xs transition-all text-center border cursor-pointer ${
                          tensao === v
                            ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-sm'
                            : 'bg-neutral-950 border-neutral-850 text-slate-400 hover:border-neutral-700'
                        }`}
                      >
                        {v}V
                      </button>
                    ))}
                  </div>
                </div>

                {/* TIPO DE REDE / FASES */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Configuração de Fases
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 1, label: 'Monofásico' },
                      { val: 2, label: 'Bifásico' },
                      { val: 3, label: 'Trifásico' }
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => setFases(item.val)}
                        className={`py-3 px-1 rounded-xl font-bold text-xs transition-all text-center border cursor-pointer truncate ${
                          fases === item.val
                            ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                            : 'bg-neutral-950 border-neutral-850 text-slate-400 hover:border-neutral-700'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* FATOR DE POTENCIA AND MATERIAL */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="fp-inp" className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Fator de Potência (cos φ)
                    </label>
                    <span className="text-[9px] text-neutral-500">Resistivo = 1.0</span>
                  </div>
                  <input
                    id="fp-inp"
                    type="number"
                    step="0.01"
                    min="0.1"
                    max="1.0"
                    value={fatorPotencia || ''}
                    onChange={(e) => {
                      const inputVal = e.target.value;
                      if (inputVal === '') {
                        setFatorPotencia(0);
                        return;
                      }
                      let val = Number(inputVal);
                      if (val > 1) val = 1;
                      if (val < 0) val = 0;
                      setFatorPotencia(val);
                    }}
                    className="w-full bg-neutral-950 border border-neutral-800/80 focus:border-amber-500 text-white font-mono font-bold text-sm outline-none rounded-xl p-3 transition-all focus:ring-1 focus:ring-amber-500/20"
                    placeholder="0.92"
                  />
                </div>

                {/* MATERIAL DO CONDUTOR */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Liga Metálica do Cabo
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'cobre', label: '🟤 Cobre (Nacional)' },
                      { id: 'aluminio', label: '⚪ Alumínio (AL)' }
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMaterial(m.id as 'cobre' | 'aluminio')}
                        className={`py-3 px-1 rounded-xl font-bold text-xs transition-all text-center border cursor-pointer ${
                          material === m.id
                            ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                            : 'bg-neutral-950 border-neutral-850 text-slate-400 hover:border-neutral-700'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* MÉTODO DE INSTALAÇÃO (NBR 5410) */}
                <div className="space-y-3 sm:col-span-2 bg-[#12161a] border border-neutral-800/80 rounded-2xl p-4">
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-850">
                    <div>
                      <h3 className="text-xs font-black uppercase text-slate-200 tracking-wider">
                        Método de Instalação de Referência (NBR 5410)
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Selecione o método físico de montagem elétrica para o dimensionamento preciso da ampacidade.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-amber-500 font-extrabold uppercase bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      Tabela 36 / 33
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {[
                      {
                        id: 'A1',
                        name: 'Método A1',
                        sub: 'Embutido em parede isolante',
                        desc: 'Condutores isolados em eletroduto dentro de parede termicamente isolante (Ex: Drywall com gesso).'
                      },
                      {
                        id: 'B1',
                        name: 'Método B1 (Padrão)',
                        sub: 'Embutido em alvenaria',
                        desc: 'Condutores isolados ou cabos unipolares em eletroduto de seção circular sobrepostos ou embutidos na alvenaria.'
                      },
                      {
                        id: 'C',
                        name: 'Método C',
                        sub: 'Sobreposto na parede',
                        desc: 'Cabos unipolares ou multipolares fixados diretamente sobre parede, teto ou em canaletas/bandejas.'
                      },
                      {
                        id: 'D',
                        name: 'Método D',
                        sub: 'Enterrado / Subterrâneo',
                        desc: 'Cabos unipolares ou multipolares protegidos por eletrodutos embutidos diretamente no solo ou valas.'
                      }
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMetodoInstalacao(m.id as 'A1' | 'B1' | 'C' | 'D')}
                        className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between h-auto cursor-pointer relative ${
                          metodoInstalacao === m.id
                            ? 'bg-amber-500/5 border-amber-500 shadow-sm text-white'
                            : 'bg-neutral-950/60 border-neutral-850 hover:border-neutral-700 text-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-center w-full mb-1">
                          <span className="text-xs font-black uppercase text-amber-500 tracking-wide">{m.name}</span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${metodoInstalacao === m.id ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-900 border border-neutral-800 text-slate-400'}`}>
                            {m.id === metodoInstalacao ? 'Ativo' : 'Usar'}
                          </span>
                        </div>
                        <div>
                          <span className="block font-bold text-xs text-slate-200">{m.sub}</span>
                          <span className="block text-[10px] leading-relaxed text-slate-400 mt-1">{m.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="bg-neutral-950 rounded-xl p-3 border border-neutral-850 mt-2 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-[10px] font-black uppercase text-slate-300 tracking-wider">
                        Resumo Técnico da Tabela 36 (Ampacidades)
                      </span>
                      <span className="text-[9px] font-mono text-slate-400">
                        Valores para condutor <strong className="text-amber-500 capitalize">{material}</strong> PVC 70°C ({fases === 3 ? '3' : '2'} condutores carregados)
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-[10px] font-mono whitespace-nowrap">
                        <thead>
                          <tr className="border-b border-neutral-800 text-neutral-400 uppercase font-black">
                            <th className="pb-1.5 font-sans">Seção nominal</th>
                            <th className="pb-1.5 text-center px-2">Método A1</th>
                            <th className="pb-1.5 text-center px-2">Método B1</th>
                            <th className="pb-1.5 text-center px-2">Método C</th>
                            <th className="pb-1.5 text-center px-2">Método D</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-900 text-slate-300">
                          {SECTIONS_LIST.map((sec) => {
                            const getAmpValue = (met: 'A1' | 'B1' | 'C' | 'D') => {
                              const table = NBR_AMPACITY_TABLE[met] || NBR_AMPACITY_TABLE['B1'];
                              const cap = table[sec];
                              if (!cap) return 0;
                              if (material === 'cobre') {
                                return fases === 3 ? cap.copper3L : cap.copper2L;
                              } else {
                                return fases === 3 ? cap.alu3L : cap.alu2L;
                              }
                            };

                            const a1Val = getAmpValue('A1');
                            const b1Val = getAmpValue('B1');
                            const cVal = getAmpValue('C');
                            const dVal = getAmpValue('D');

                            return (
                              <tr key={sec} className="hover:bg-neutral-900/40 transition-colors">
                                <td className="py-1.5 font-bold font-sans text-slate-200">
                                  {sec.toFixed(1)} mm²
                                </td>
                                <td className={`py-1.5 text-center px-2 rounded-l ${metodoInstalacao === 'A1' ? 'text-amber-400 font-extrabold bg-amber-500/10' : ''}`}>
                                  {a1Val} A
                                </td>
                                <td className={`py-1.5 text-center px-2 ${metodoInstalacao === 'B1' ? 'text-amber-400 font-extrabold bg-amber-500/10' : ''}`}>
                                  {b1Val} A
                                </td>
                                <td className={`py-1.5 text-center px-2 ${metodoInstalacao === 'C' ? 'text-amber-400 font-extrabold bg-amber-500/10' : ''}`}>
                                  {cVal} A
                                </td>
                                <td className={`py-1.5 text-center px-2 rounded-r ${metodoInstalacao === 'D' ? 'text-amber-400 font-extrabold bg-amber-500/10' : ''}`}>
                                  {dVal} A
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="text-[9px] text-slate-400 bg-neutral-900/40 p-2 rounded-lg border border-neutral-850/50 leading-relaxed font-sans">
                      💡 <strong>Como escolher?</strong> Para fiações padrão embutidas na alvenaria ou duto em gesso, use <strong>B1</strong>. Para passagens subterrâneas externas, use <strong>D</strong>. A ampacidade máxima admissível mudará dinamicamente indicando sobrecarga caso a corrente do circuito exceda o limite de condução térmica do método físico.
                    </div>
                  </div>
                </div>

                {/* LIMITE QUEDA ADMITIDA */}
                <div className="space-y-1.5 sm:col-span-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                    <label>Limite Regulamentar de Queda Máxima (%): {limiteQueda}%</label>
                    <span className="text-[9px] font-mono text-amber-500">Norma NBR 5410: ≤ 4% residencial</span>
                  </div>
                  <div className="flex items-center gap-4 bg-neutral-950 p-2.5 rounded-xl border border-neutral-800/80">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="0.5"
                      value={limiteQueda}
                      onChange={(e) => setLimiteQueda(Number(e.target.value))}
                      className="w-full accent-amber-500 h-1 bg-neutral-850 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="bg-neutral-900 border border-neutral-800 py-1.5 px-3 rounded-lg font-mono font-extrabold text-xs text-amber-400 shrink-0">
                      ∆V ≤ {limiteQueda}%
                    </div>
                  </div>
                </div>

              </div>

              {/* HISTORY MEMORIAL ACTION LAUNCH CARD */}
              <div className="pt-4 border-t border-neutral-800/60 flex flex-col sm:flex-row items-center gap-3.5">
                <button
                  type="button"
                  onClick={handleSaveCircuit}
                  className="w-full sm:w-auto flex-1 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 p-3.5 rounded-xl border-t border-white/20 text-xs font-black uppercase shadow-lg shadow-amber-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-neutral-950 stroke-[3px]" />
                  Adicionar ao Memorial Técnico
                </button>
                
                {saveSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2.5 rounded-xl flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Adicionado com sucesso!
                  </motion.div>
                )}
              </div>

            </div>

            {/* LIVE DYNAMIC ELECTRIC WAVE & CHARGE VISUALIZER */}
            <div className="bg-neutral-900/85 border border-slate-800/35 rounded-3xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg">
                    <Activity className="w-4 h-4 animate-pulse" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#a5f3fc]">
                    Simulador Ativo do Fluxo Eletrônico NBR
                  </span>
                </div>
                {breakerActive ? (
                  <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded animate-pulse">
                    ENERGIZADO
                  </span>
                ) : (
                  <span className="text-[9px] text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                    DESENERGIZADO / SEGURO
                  </span>
                )}
              </div>

              {/* Animated cable line connecting breaker to consumer load appliance */}
              <div className="bg-neutral-950 border border-neutral-850 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
                
                {/* Breaker element */}
                <div className="flex flex-col items-center">
                  <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col items-center shadow-xs">
                    <div className="w-3 h-5 bg-neutral-800 rounded-xs flex items-center justify-center p-0.5">
                      <div className={`w-full rounded-xs transition-transform ${breakerActive ? 'h-3 bg-emerald-400/80' : 'h-3 bg-neutral-600 translate-y-1'}`} />
                    </div>
                    <span className="text-[9px] font-mono mt-1 text-slate-500 uppercase">Disjuntor</span>
                  </div>
                </div>

                {/* Flow Wire Wire visualizer path (animate dashoffset) */}
                <div className="flex-1 w-full flex flex-col items-center relative">
                  {/* Gauge stats bubble */}
                  <div className="text-[9px] bg-neutral-900 text-slate-300 font-mono border border-neutral-800 px-2.5 py-1 rounded-full text-center z-10 -translate-y-2 mb-2">
                    Condutor de {material === 'cobre' ? 'Cobre 🟤' : 'Alumínio ⚪'} • {bitolaNBR5410}
                  </div>

                  {/* Electron Pipeline container */}
                  <div className="relative w-full h-5 bg-neutral-900 border border-neutral-850 rounded-full flex items-center overflow-hidden">
                    {breakerActive && Number(corrente) > 0 ? (
                      <div className="absolute inset-0 flex items-center">
                        {/* Moving particles represent current speed */}
                        <div 
                          className="w-full h-1.5 flex justify-around items-center"
                          style={{
                            backgroundImage: 'radial-gradient(circle, #f59e0b 2px, transparent 2.5px)',
                            backgroundSize: '24px 100%',
                            animation: `moveElectrons ${animDuration}s linear infinite`,
                          }}
                        />
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-neutral-950 flex items-center justify-center text-[10px] text-slate-500 italic font-mono uppercase tracking-widest">
                        Sem Tensão nos Polos
                      </div>
                    )}
                  </div>

                  <style>{`
                    @keyframes moveElectrons {
                      from { background-position: 0px 0px; }
                      to { background-position: 120px 0px; }
                    }
                  `}</style>

                  <div className="flex justify-between w-full text-[9px] font-mono text-neutral-500 mt-2">
                    <span>Queda: ~{getQuedaDeTensaoSpecs(parseFloat(bitolaNBR5410) || 2.5, Number(corrente)).isDropUnsafe ? '⚠️ Unsafe' : '✅ Conformado'}</span>
                    <span>Intensidade: {corrente}A</span>
                  </div>
                </div>

                {/* Consumer load element */}
                <div className="flex flex-col items-center">
                  <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col items-center shadow-xs">
                    <Lightbulb className={`w-5 h-5 transition-colors ${breakerActive && Number(corrente) > 0 ? 'text-amber-400 fill-amber-400/20 active-glow' : 'text-slate-600'}`} style={{
                      filter: breakerActive && Number(corrente) > 0 ? 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.45))' : 'none'
                    }} />
                    <span className="text-[9px] font-mono mt-1 text-slate-500 uppercase">Equipamento</span>
                  </div>
                </div>

              </div>
            </div>

          </main>

          {/* RIGHT BENTO RAIL: REAL-TIME COMPUTATION METRICS & GAUGE COMPARATOR (5 cols) */}
          <aside className="lg:col-span-5 space-y-6">
            
            {/* COMFORT PANEL: VISUAL COPPER/ALU ELECTRICITY METER GAUGE */}
            <div className="bg-[#12161c] text-white rounded-3xl p-5 sm:p-6 border border-neutral-800 relative overflow-hidden shadow-2xl">
              <div className="absolute -right-3 -top-3 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between mb-4 no-print">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                    Multímetro de Dimensionamento
                  </span>
                </div>
                <div className="text-[9px] bg-neutral-800 border border-neutral-700/60 font-mono text-neutral-300 px-2 py-0.5 rounded-md uppercase">
                  Isolador PVC
                </div>
              </div>

              {/* RESULTS GRID CORE NUMERICS */}
              <div className="grid grid-cols-2 gap-3.5 mb-5 no-print">
                
                {/* AMPERES */}
                <div className="bg-neutral-900/60 border border-neutral-800/80 p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide">Corrente de Projeto</span>
                    <div className="text-3xl font-black font-mono mt-1 text-slate-100 flex items-baseline gap-1 tracking-tight">
                      {corrente}
                      <span className="text-sm font-black text-amber-500">A</span>
                    </div>
                  </div>
                  <div className="text-[9px] text-slate-500 mt-2.5 flex items-center gap-1 leading-tight border-t border-neutral-800/50 pt-1.5">
                    <Activity className="w-3 h-3 text-amber-500 shrink-0" />
                    Amperes (carga cos φ)
                  </div>
                </div>

                {/* POTENCIA EM KVA */}
                <div className="bg-neutral-900/60 border border-neutral-800/80 p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide">Potência Aparente</span>
                    <div className="text-3xl font-black font-mono mt-1 text-slate-100 flex items-baseline gap-1 tracking-tight">
                      {kva}
                      <span className="text-xs font-black text-cyan-400">kVA</span>
                    </div>
                  </div>
                  <div className="text-[9px] text-slate-500 mt-2.5 flex items-center gap-1 leading-tight border-t border-neutral-800/50 pt-1.5">
                    <Gauge className="w-3 h-3 text-cyan-400 shrink-0" />
                    Potência Total de Saída
                  </div>
                </div>

              </div>

              {/* RECOMMENDED HERO VALUE */}
              <div className="bg-linear-to-b from-amber-500/15 via-amber-600/5 to-transparent border border-amber-500/25 rounded-2xl p-4.5 text-center shadow-lg">
                <span className="text-[10px] text-amber-300 font-black tracking-widest uppercase">
                  ⚡ Bitola NBR 5410 Recomendada
                </span>
                <p className="text-3xl sm:text-4xl font-mono font-black text-amber-400 mt-1 drop-shadow-[0_2px_12px_rgba(245,158,11,0.2)]">
                  {bitolaNBR5410}
                </p>
                <div className="mt-2 text-[10px] text-slate-300 flex items-center justify-center gap-1 flex-wrap">
                  Comprimento: <strong className="text-white font-mono">{distancia}m</strong>
                  <span className="text-slate-500">•</span>
                  Material: <strong className="text-white uppercase">{material}</strong>
                </div>
              </div>

              {/* ORIGINAL USER FORMULA COMPATIBILITY FIELD */}
              <div className="bg-neutral-950/40 p-3 rounded-xl border border-neutral-800/40 mt-3 flex items-center justify-between text-xs text-slate-400 font-mono no-print">
                <span>Cálculo Donizete:</span>
                <span className="font-extrabold text-amber-400">{bitolaSimplificada}</span>
              </div>

              {/* CABLE CROSS SECTION DIAGRAM GRAPHIC */}
              <div className="bg-neutral-950/60 rounded-2xl p-4 mt-4 border border-neutral-850 text-center flex flex-col items-center">
                <span className="text-[9px] text-neutral-400 uppercase font-black tracking-widest mb-3">Seção Geométrica Escalonada</span>
                
                <div className="min-h-[110px] flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={bitolaNBR5410}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ type: "spring", damping: 14 }}
                      className={`rounded-full bg-linear-to-tr from-amber-500 via-amber-600 to-yellow-400 flex flex-col items-center justify-center text-neutral-950 shadow-xl border-slate-900 ${diameterRenderStats.size} ${diameterRenderStats.border}`}
                    >
                      <span className="text-[9px] font-black drop-shadow-xs text-neutral-950 font-mono mt-0.5">
                        {material === 'cobre' ? 'Cu' : 'Al'}
                      </span>
                    </motion.div>
                  </AnimatePresence>
                </div>
                
                <div className="text-[10px] text-slate-400 mt-2 font-mono">
                  {bitolaNBR5410} • Diâmetro aproximado: <strong className="text-slate-200">{diameterRenderStats.diameter}</strong>
                </div>
              </div>

            </div>

            {/* REAL-TIME COMPARISON LIST OF ALL WIRE GAUGES */}
            <div className="bg-neutral-900/85 border border-neutral-800 rounded-3xl p-5 backdrop-blur-md relative no-print">
              <div className="flex items-center justify-between mb-4 border-b border-neutral-800/60 pb-3">
                <div className="flex items-center gap-1.5">
                  <Scale className="text-amber-500 w-4.5 h-4.5" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-display">Tabela Diagnóstica por Bitola</span>
                </div>
                <HelpCircle className="w-3.5 h-3.5 text-neutral-500 cursor-help" title="Dimensionamento completo para cada bitola comercial de cobre ou alumínio conformados na rede elétrica" />
              </div>

              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {tableComparison.map((item) => {
                  const isRecommended = item.label === bitolaNBR5410;
                  
                  // Gauge diagnostics color index
                  let cardBorder = 'border-neutral-850';
                  let dropColor = 'text-slate-300';
                  let badge = '';

                  if (item.isOverload) {
                    cardBorder = 'border-rose-500/30 bg-rose-500/2';
                    dropColor = 'text-rose-400';
                    badge = '🔥 Sobrecarga';
                  } else if (item.isDropUnsafe) {
                    cardBorder = 'border-amber-500/20 bg-amber-500/2';
                    dropColor = 'text-amber-400 font-bold';
                    badge = '⚠️ Queda Alta';
                  } else if (isRecommended) {
                    cardBorder = 'border-emerald-500/40 bg-emerald-500/5';
                    dropColor = 'text-emerald-400 font-bold';
                    badge = '⭐️ Recomendado';
                  } else {
                    cardBorder = 'border-neutral-800 bg-neutral-950/20';
                    dropColor = 'text-emerald-500/90';
                    badge = 'Disponível';
                  }

                  return (
                    <div
                      key={item.section}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all ${cardBorder} ${isRecommended ? 'ring-1 ring-emerald-500/10' : ''}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          item.isOverload ? 'bg-rose-500' : item.isDropUnsafe ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} />
                        <div>
                          <strong className="text-xs text-white font-mono">{item.label}</strong>
                          <div className="text-[10px] text-slate-400 flex gap-2">
                            <span>Queda: <span className={dropColor}>{item.dropPercent}%</span></span>
                            <span>• Cap: {item.ampacityLimit}A</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[9px] font-mono font-medium text-slate-400">
                          {item.dropVolts}V de queda
                        </div>
                        <span className={`text-[8px] font-bold uppercase rounded px-1.5 py-0.5 mt-1 block w-fit ml-auto ${
                          item.isOverload
                            ? 'bg-rose-500/20 text-rose-400'
                            : item.isDropUnsafe
                            ? 'bg-amber-500/20 text-amber-400'
                            : isRecommended
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-neutral-800 text-slate-400'
                        }`}>
                          {badge}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* LOAD BALANCE COMPARISON CHART */}
            <div className="no-print">
              <LoadChart circuitos={circuitosSalvos} />
            </div>

            {/* CIRCUIT HISTORY LOG LISTING */}
            <div className="bg-neutral-900/85 border border-neutral-800 rounded-3xl p-5 backdrop-blur-md relative no-print">
              <div className="flex items-center justify-between mb-4 border-b border-neutral-800/60 pb-3">
                <div className="flex items-center gap-1.5">
                  <Printer className="text-amber-500 w-4.5 h-4.5" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-display">Memorial de Circuitos Salvos</span>
                </div>
                {circuitosSalvos.length > 0 && (
                  <button
                    onClick={handleClearAllHistory}
                    className="text-[10px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    Limpar Tudo
                  </button>
                )}
              </div>

              {circuitosSalvos.length === 0 ? (
                <div className="text-center py-6 text-slate-500 italic text-xs">
                  Nenhum circuito adicionado ao memorial ainda. Configure os dados acima e clique em "Adicionar ao Memorial".
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-[10px] text-slate-400 flex justify-between bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 mb-1.5">
                    <span>Circuitos: <strong className="text-white">{circuitosSalvos.length}</strong></span>
                    <span>Potência Total: <strong className="text-amber-400 font-mono">{historyAggregates.potenciaTotal} W</strong></span>
                    <span>KVA Total: <strong className="text-cyan-400 font-mono">{historyAggregates.kvaTotal.toFixed(2)} KVA</strong></span>
                  </div>

                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {circuitosSalvos.map((cir) => (
                      <div
                        key={cir.id}
                        className="p-3 bg-neutral-950 border border-neutral-850 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5 truncate pr-2">
                          <div className="font-bold text-white truncate">{cir.nome}</div>
                          <div className="text-[10px] text-slate-400 flex flex-wrap gap-x-2">
                            <span>{cir.potencia}W</span>
                            <span>• {cir.tensao}V ({cir.fases === 3 ? 'Trifásico' : cir.fases === 2 ? 'Bifásico' : 'Monofásico'})</span>
                            <span>• {cir.distancia}m</span>
                          </div>
                          <div className="text-[9px] text-amber-500 font-medium shrink-0">
                            Bitola Calculada: {cir.bitola}
                          </div>
                        </div>

                        <div className="flex items-center gap-3.5 mt-1 sm:mt-0">
                          <div className="text-right shrink-0">
                            <span className="font-mono text-white font-extrabold block text-xs">{cir.corrente}A</span>
                            <span className="text-[9px] font-mono text-zinc-500 block">{cir.kva} kVA</span>
                          </div>
                          <button
                            onClick={() => handleDeleteCircuit(cir.id)}
                            className="p-2 bg-neutral-900 hover:bg-rose-500/25 text-neutral-500 hover:text-rose-400 rounded-lg cursor-pointer transition-colors"
                            title="Remover circuito"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <p className="text-[10px] text-center text-slate-400">
                      💡 Todos os circuitos listados acima serão inclusos automaticamente no PDF de sua proposta ao imprimir!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* TECHNICAL MATH EQUATIONS SHEET */}
            <div className="bg-neutral-900/85 border border-neutral-800 rounded-3xl p-5 backdrop-blur-md relative">
              <div className="flex items-center gap-1.5 mb-3">
                <BookOpen className="text-amber-500 w-4 h-4" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-display">Memória de Cálculo Regulamentar</span>
              </div>
              <div className="space-y-3.5 text-xs text-slate-300">
                <p className="text-[11px] text-slate-400 leading-tight">
                  Este memorial de dimensionamento baseia-se nos requisitos fundamentais de seções mínimas por queda de tensão e ampacidade declarados pela norma técnica brasileira <strong>NBR 5410</strong>.
                </p>
                
                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850 divide-y divide-neutral-800/60 font-mono text-[11px] space-y-2">
                  <div className="pb-2">
                    <div className="text-amber-400 font-black">Corrente de Projeto ({fases === 3 ? 'Trifásica' : 'Monofásica/Bifásica'}):</div>
                    <div className="text-slate-200 mt-1">
                      {fases === 3 ? 'I = P ÷ (√3 × Volt × cos φ)' : 'I = P ÷ (Volt × cos φ)'}
                    </div>
                    <div className="text-slate-400 text-[10px] mt-0.5">
                      Subst: {potencia}W ÷ ({fases === 3 ? '1.732 × ' : ''}{tensao}V × {fatorPotencia}) = <strong className="text-white">{corrente}A</strong>
                    </div>
                  </div>

                  <div className="py-2">
                    <div className="text-[#06b6d4] font-black">Cálculo de Queda de Tensão (∆V%):</div>
                    <div className="text-slate-200 mt-1">
                      {fases === 3 ? '∆V% = (√3 × ρ × L × I) ÷ (S × V) × 100%' : '∆V% = (2 × ρ × L × I) ÷ (S × V) × 100%'}
                    </div>
                    <div className="text-slate-400 text-[10px] mt-1 space-y-0.5">
                      <div>ρ (Resistividade do {material}): <strong className="text-slate-300">{material === 'cobre' ? '0.0172' : '0.0282'} Ω•mm²/m</strong></div>
                      <div>Material Condutor Ativo: <strong className="text-white uppercase">{material}</strong></div>
                      <div>∆V para {bitolaNBR5410}: <strong className="text-[#a5f3fc]">{getQuedaDeTensaoSpecs(parseFloat(bitolaNBR5410) || 2.5, Number(corrente)).dropPercent}%</strong> (Admitido: {limiteQueda}%)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </aside>

        </div>

        {/* PRINT GRAPHIC LAYOUT OVERRIDE: memorial de dimensionamento profissional (Visible via CSS @media print only) */}
        <section id="print-layout-report" className="hidden printable-report mx-auto p-4 max-w-4xl text-black">
          
          {/* HEADER EMBELLISHMENT */}
          <div className="border-b-4 border-amber-500 pb-5 mb-6 flex justify-between items-start gap-4">
            <div className="flex items-center gap-4">
              <img
                src={appLogo}
                alt="Donizete Meireles Cálculos Elétricos"
                className="w-16 h-16 object-cover rounded-lg border border-stone-300 shadow-xs"
                referrerPolicy="no-referrer"
              />
              <div>
                <h1 className="text-2xl font-black uppercase text-black">⚡ Memorial de Cálculos e Dimensionamento</h1>
                <p className="text-sm font-bold text-amber-600 mt-0.5">Donizete Meireles — Cálculos Elétricos</p>
                <p className="text-[10px] text-stone-500 mt-0.5">Laudo Técnico de Instalações e Seções de Cabos de Cobre/Alumínio conforme NBR 5410</p>
              </div>
            </div>
            <div className="text-right min-w-[120px]">
              <span className="inline-block bg-black text-white font-mono font-bold text-[10px] px-2 py-1 rounded">
                CALC-PRO-{Math.floor(100000 + Math.random() * 900000)}
              </span>
              <p className="text-[10px] text-stone-500 mt-1">Emissão: {dataCalculo}</p>
            </div>
          </div>

          {/* SERVICE DIRECTIVE METADATA */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="border border-stone-300 rounded-xl p-4 bg-stone-50/50">
              <h3 className="text-[10px] uppercase text-stone-500 font-extrabold tracking-widest mb-2 border-b border-stone-200 pb-1">Identificação de Serviço / Cliente</h3>
              <table className="w-full text-xs text-stone-800">
                <tbody>
                  <tr className="border-b border-stone-100">
                    <td className="font-bold text-stone-500 py-1 pr-2">Cliente / Obra:</td>
                    <td className="py-1 text-stone-900 font-semibold">{nomeCliente || 'Donizete Meireles'}</td>
                  </tr>
                  <tr className="border-b border-stone-100">
                    <td className="font-bold text-stone-500 py-1 pr-2">Local do Projeto:</td>
                    <td className="py-1 text-stone-900">{enderecoObra || 'Não Declarado'}</td>
                  </tr>
                  <tr>
                    <td className="font-bold text-stone-500 py-1 pr-2">Eletricista Técnico:</td>
                    <td className="py-1 text-stone-900 font-bold">{eletricista || 'Donizete Meireles'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="border border-stone-300 rounded-xl p-4 bg-stone-50/50">
              <h3 className="text-[10px] uppercase text-stone-500 font-extrabold tracking-widest mb-2 border-b border-stone-200 pb-1">Dimensionamento do Circuito Ativo</h3>
              <table className="w-full text-xs text-stone-800">
                <tbody>
                  <tr className="border-b border-stone-100">
                    <td className="font-bold text-stone-500 py-1 pr-2">Circuito Estudado:</td>
                    <td className="py-1 text-stone-900 font-mono font-bold">{customCircuitName}</td>
                  </tr>
                  <tr className="border-b border-stone-100">
                    <td className="font-bold text-stone-500 py-1 pr-2">Potência Instalada:</td>
                    <td className="py-1 text-stone-900 font-mono">{potencia} W ({kva} KVA)</td>
                  </tr>
                  <tr className="border-b border-stone-100">
                    <td className="font-bold text-stone-500 py-1 pr-2">Tensão / Fases:</td>
                    <td className="py-1 text-stone-900 font-mono">{tensao}V • {fases === 3 ? 'Trifásico' : fases === 2 ? 'Bifásico' : 'Monofásico'}</td>
                  </tr>
                  <tr>
                    <td className="font-bold text-stone-500 py-1 pr-2">Comprimento total:</td>
                    <td className="py-1 text-stone-900 font-mono">{distancia} metros</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ACTIVE PRIMARY CALCULATION OUTCOME */}
          <div className="border-2 border-amber-500 rounded-xl p-5 mb-6 text-center bg-amber-50/10">
            <span className="text-[10px] text-amber-800 tracking-wider font-extrabold uppercase">
              SEÇÃO MÍNIMA ADMISSÍVEL DE CABO RECOMENDADO (NBR 5410)
            </span>
            <p className="text-4xl font-extrabold text-[#78350f] tracking-tight mt-1 font-mono uppercase">
              {material === 'cobre' ? 'CU' : 'AL'}: {bitolaNBR5410}
            </p>
            <p className="text-xs text-stone-600 mt-2">
              Seção transversal calculada por limite de queda de tensão de <strong className="text-black font-semibold">{limiteQueda}%</strong> e ampacidade limite admissível sob método de instalação padrão de condução.
            </p>
            <div className="grid grid-cols-3 gap-2 mt-4 text-center max-w-lg mx-auto bg-white/70 p-2.5 rounded-lg border border-stone-200">
              <div>
                <span className="text-[9px] text-stone-500 block uppercase">Corrente Nominal</span>
                <strong className="text-sm font-mono text-stone-950">{corrente} A</strong>
              </div>
              <div>
                <span className="text-[9px] text-stone-500 block uppercase">Queda de Tensão (∆V)</span>
                <strong className="text-sm font-mono text-stone-950">
                  {getQuedaDeTensaoSpecs(parseFloat(bitolaNBR5410) || 2.5, Number(corrente)).dropPercent}%
                </strong>
              </div>
              <div>
                <span className="text-[9px] text-stone-500 block uppercase">Tolerância (Adm)</span>
                <strong className="text-sm font-mono text-stone-950">{limiteQueda}%</strong>
              </div>
            </div>
          </div>

          {observacoes && (
            <div className="border border-stone-300 rounded-xl p-3.5 bg-stone-50 text-xs text-stone-700 italic mb-6">
              <strong className="text-stone-900 not-italic block uppercase text-[9px] tracking-wider mb-1">Notas Técnicas Extra do Projeto</strong>
              {observacoes}
            </div>
          )}

          {/* SECTION FOR MULTIPLE SAVED CIRCUITS LIST (Highly professional) */}
          {circuitosSalvos.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs uppercase font-extrabold text-stone-700 tracking-widest border-b-2 border-stone-300 pb-1.5 mb-2.5">
                Relação Completa de Circuitos (Quadro de Dimensionamento Geral)
              </h2>
              <table className="w-full text-xs text-stone-850 text-left border-collapse">
                <thead>
                  <tr className="bg-stone-100 text-stone-600 border-b border-stone-300">
                    <th className="p-2">Identificador do Circuito</th>
                    <th className="p-2 font-mono">Potência (W)</th>
                    <th className="p-2 font-mono">Tensão</th>
                    <th className="p-2 font-mono">Distância (m)</th>
                    <th className="p-2 font-mono">Corrente (A)</th>
                    <th className="p-2 font-mono">Queda (%)</th>
                    <th className="p-2">Cabo Calculado</th>
                  </tr>
                </thead>
                <tbody>
                  {circuitosSalvos.map((c, i) => (
                    <tr key={c.id} className="border-b border-stone-200 hover:bg-stone-50">
                      <td className="p-2 font-semibold text-stone-950">{c.nome}</td>
                      <td className="p-2 font-mono">{c.potencia} W</td>
                      <td className="p-2 font-mono">{c.tensao}V / {c.fases === 3 ? 'Trifás.' : c.fases === 2 ? 'Bifás.' : 'Monofás.'}</td>
                      <td className="p-2 font-mono">{c.distancia} m</td>
                      <td className="p-2 font-mono font-bold text-black">{c.corrente} A</td>
                      <td className="p-2 font-mono text-stone-600">{c.quedaPercentual}</td>
                      <td className="p-2 font-mono font-bold text-amber-800">{c.bitola}</td>
                    </tr>
                  ))}
                  <tr className="bg-stone-50 font-bold border-t-2 border-stone-300">
                    <td className="p-2 text-right">TOTAL CARGAS:</td>
                    <td className="p-2 font-mono text-stone-900">{historyAggregates.potenciaTotal} W</td>
                    <td className="p-2" colSpan={3}>({historyAggregates.kvaTotal.toFixed(2)} KVA aparente acumulado)</td>
                    <td className="p-2" colSpan={2}>Capacidade de Alimentadores recomendável sob cálculo de demanda</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* SIGNATURE SEALS FOR COMMERCIAL OFFERS */}
          <div className="grid grid-cols-2 gap-6 mt-12 mb-8">
            <div className="border border-stone-200 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[10px] text-stone-400 block uppercase">Metodologia NBR 5410</span>
              <p className="text-[11px] text-stone-600 mt-1 lines-tight">
                Cálculo em conformidade com o método {metodoInstalacao} de instalação. Queda percentual calculada utilizando a impedância simplificada para cobre eletrolítico puro (resistividade equivalente a 0.0172 e alumínio 0.0282).
              </p>
            </div>
            
            <div className="border border-stone-300 rounded-xl p-4 flex flex-col items-center justify-end text-center bg-stone-50">
              <div className="w-[80%] border-t border-stone-500 mt-6 pt-1 text-xs text-stone-900 font-bold">
                {eletricista || 'Donizete Meireles'}
              </div>
              <span className="text-[10px] text-stone-500 uppercase font-black mt-0.5">Eletricista Responsável pela Emissão</span>
            </div>
          </div>

          <p className="text-[9px] text-stone-400 text-center border-t border-stone-100 pt-3">
            Atenção: Este laudo é um memorial de cálculo orientativo feito baseado estritamente nos dados declarados pelo usuário e normas vigentes. A contratação de profissionais qualificados e credenciados é terminantemente recomendada para a elaboração de projetos executivos elétricos residenciais ou comerciais de qualquer potência e escala.
          </p>
        </section>

        {/* BOTTOM METADATA / PROFESSIONAL SIGN-STAMP FOOTER */}
        <footer className="mt-12 border-t border-neutral-850 pt-6 pb-12 text-center text-xs text-slate-500 space-y-2 no-print">
          <div className="flex items-center justify-center gap-1.5 text-amber-500 font-bold">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            Calculadora de Eletricista Profissional NBR 5410
          </div>
          <p className="text-slate-400 text-[11px] max-w-xl mx-auto leading-relaxed">
            Geração de memoriais de cálculos de queda de tensão simplificados de cobre e alumínio, potências, FP e ampacidades. Desenvolvido no ambiente de {eletricista || 'Donizete Meireles'}.
          </p>
          <div className="text-[10px] text-slate-600 font-mono pt-1">
            © 2026 • Ferramenta Digital de Apoio de Campo. Todos os direitos reservados.
          </div>
        </footer>

      </div>
    </div>
  );
}
