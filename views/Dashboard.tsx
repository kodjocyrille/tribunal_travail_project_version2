
import React from 'react';
import { useAppState } from '../store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { NATURE_LABELS } from '../constants';
import { NatureAffaire, EtatAffaire } from '../types';

const StatCard = ({ title, value, sub, color }: { title: string, value: string | number, sub: string, color: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
    <div className="mt-2 flex items-baseline">
      <span className={`text-3xl font-bold ${color}`}>{value}</span>
      <span className="ml-2 text-xs text-gray-400 font-normal">{sub}</span>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const { affaires } = useAppState();

  const natureCounts = affaires.reduce((acc, curr) => {
    acc[curr.nature] = (acc[curr.nature] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.entries(natureCounts).map(([key, value]) => ({
    name: NATURE_LABELS[key as NatureAffaire],
    count: value
  }));

  const etatCounts = affaires.reduce((acc, curr) => {
    acc[curr.etat] = (acc[curr.etat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = [
    { name: 'En cours', value: etatCounts[EtatAffaire.EN_CONCIL] || 0 + (etatCounts[EtatAffaire.EN_JUG] || 0) },
    { name: 'Jugées', value: etatCounts[EtatAffaire.JUGEE_1R] || 0 + (etatCounts[EtatAffaire.JUGEE_DEF] || 0) },
    { name: 'Radiées', value: etatCounts[EtatAffaire.RADIEE] || 0 },
    { name: 'Enrôlées', value: etatCounts[EtatAffaire.ENR] || 0 }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-8">
      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Affaires Enrôlées" value={affaires.length} sub="Mois en cours" color="text-blue-600" />
        <StatCard title="En Délibéré" value={affaires.filter(a => a.etat === EtatAffaire.EN_DELIBERE).length} sub="Attente jugement" color="text-pink-600" />
        <StatCard title="Conciliations" value="45%" sub="Taux de succès" color="text-green-600" />
        <StatCard title="Délais Moyens" value="28j" sub="Dépôt → Jugement" color="text-indigo-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Nature Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-6">Affaires par Nature de Conflit</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* State Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-6">Répartition par État du Dossier</h3>
          <div className="h-80 flex flex-col items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                  <span className="text-gray-600">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">Alertes et Délais de Rigueur</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-100">
            <div className="bg-red-100 text-red-600 p-2 rounded">⚠️</div>
            <div>
              <p className="text-sm font-semibold text-red-800">Affaire 125/2025 - Délibéré Dépassé</p>
              <p className="text-xs text-red-600">Le délibéré est ouvert depuis plus de 3 mois sans rendu de jugement.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
            <div className="bg-yellow-100 text-yellow-600 p-2 rounded">📅</div>
            <div>
              <p className="text-sm font-semibold text-yellow-800">Audiences du 15/02 non encore programmées</p>
              <p className="text-xs text-yellow-600">Plusieurs dossiers enrôlés n'ont pas encore de date de première audience.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
