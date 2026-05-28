/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AppliancePreset {
  id: string;
  name: string;
  potencia: number;
  fatorPotencia: number;
  description: string;
  icon?: string;
}

export interface CircuitoItem {
  id: string;
  nome: string;
  potencia: number;
  tensao: number;
  fases: number; // 1 = Monofásico, 2 = Bifásico, 3 = Trifásico
  distancia: number;
  fatorPotencia: number;
  material: 'cobre' | 'aluminio';
  bitola: string;
  corrente: string;
  kva: string;
  quedaPercentual: string;
  data: string;
  metodo?: string;
}
