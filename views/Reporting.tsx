
import React, { useState, useMemo } from 'react';
import { useAppState } from '../store';
import { NatureAffaire, EtatAffaire, TypeAudience, TypeOrdonnance, Affaire } from '../types';
import { 
  Calendar, FileSpreadsheet, Scale, Info, Users, Clock, Gavel, TrendingUp, 
  FileText, CheckCircle2, Timer, UserCheck, BarChart3, Download, Table as TableIcon,
  RefreshCw, ChevronRight, Database, CloudUpload, Check
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';

const DigitBox = ({ value, digits = 4 }: { value: number, digits?: number }) => {
  const str = value.toString().padStart(digits, '0');
  return (
    <div className="flex space-x-0.5 justify-center">
      {str.split('').map((d, i) => (
        <div key={i} className="w-5 h-7 border border-black flex items-center justify-center font-mono font-bold text-[10px] bg-white text-black shadow-inner">
          {d}
        </div>
      ))}
    </div>
  );
};

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#6366f1', '#ec4899'];

export const Reporting: React.FC = () => {
  const { affaires, audiences, personnel } = useAppState();
  
  // États pour les inputs de dates
  const [dateDebut, setDateDebut] = useState('2026-01-01');
  const [dateFin, setDateFin] = useState('2026-01-31');
  
  // États pour les dates appliquées aux calculs
  const [appliedDateDebut, setAppliedDateDebut] = useState('2026-01-01');
  const [appliedDateFin, setAppliedDateFin] = useState('2026-01-31');

  // État de synchronisation pour le bouton d'export BD
  const [isDataApplied, setIsDataApplied] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const [activeTab, setActiveTab] = useState('TABLEAU_1');
  const [viewModes, setViewModes] = useState<Record<string, 'table' | 'chart'>>({
    TABLEAU_1: 'table',
    TABLEAU_2: 'table',
    TABLEAU_3: 'table',
    TABLEAU_4: 'table',
    TABLEAU_5: 'table',
    TABLEAU_6: 'table',
  });

  const handleRecalculate = () => {
    setAppliedDateDebut(dateDebut);
    setAppliedDateFin(dateFin);
    setIsDataApplied(true);
    setExportSuccess(false);
  };

  const handleDateChange = (type: 'debut' | 'fin', value: string) => {
    if (type === 'debut') setDateDebut(value);
    else setDateFin(value);
    setIsDataApplied(false);
  };

  const toggleViewMode = (tabId: string) => {
    setViewModes(prev => ({
      ...prev,
      [tabId]: prev[tabId] === 'table' ? 'chart' : 'table'
    }));
  };

  const exportToExcel = (data: any[], filename: string) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + data.map(row => Object.values(row).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtrage basé sur les dates appliquées
  const periodAffaires = useMemo(() => {
    return affaires.filter(a => a.dateCreation >= appliedDateDebut && a.dateCreation <= appliedDateFin);
  }, [affaires, appliedDateDebut, appliedDateFin]);

  const closedInPeriod = useMemo(() => {
    return affaires.filter(a => a.dateCloture && a.dateCloture >= appliedDateDebut && a.dateCloture <= appliedDateFin);
  }, [affaires, appliedDateDebut, appliedDateFin]);

  // --- CALCULS DES DONNÉES (Tableau 1 à 6) ---

  const t1 = useMemo(() => {
    const stockInit = affaires.filter(a => a.dateCreation < appliedDateDebut && (!a.dateCloture || a.dateCloture >= appliedDateDebut)).length;
    const enrolees = periodAffaires.length;
    const adds = periodAffaires.filter(a => a.isADD).length;
    const fonds = periodAffaires.filter(a => [EtatAffaire.JUGEE_1R, EtatAffaire.JUGEE_DEF].includes(a.etat) && !a.isADD).length;
    const sortiesAutres = periodAffaires.filter(a => [EtatAffaire.CONC_REUSSIE, EtatAffaire.RADIEE, EtatAffaire.DESISTEMENT].includes(a.etat)).length;
    const stockFin = stockInit + enrolees - (fonds + sortiesAutres);
    
    const chartData = [
      { name: 'Stock Initial', value: stockInit },
      { name: 'Enrôlées', value: enrolees },
      { name: 'Jugements Fond', value: fonds },
      { name: 'Autres Sorties', value: sortiesAutres },
      { name: 'Stock Final', value: stockFin },
    ];

    return { stockInitial: stockInit, enrolees, adds, fonds, sortiesAutres, stockFin, chartData };
  }, [periodAffaires, affaires, appliedDateDebut]);

  const t2 = useMemo(() => {
    const concil = audiences.filter(aud => aud.date >= appliedDateDebut && aud.date <= appliedDateFin && [TypeAudience.CONC_N, TypeAudience.CONC_R, TypeAudience.CONC_U].includes(aud.type)).length;
    const publiques = audiences.filter(aud => aud.date >= appliedDateDebut && aud.date <= appliedDateFin && aud.type === TypeAudience.JUG).length;
    const chartData = [
      { name: 'Conciliations', value: concil },
      { name: 'Aud. Publiques', value: publiques },
    ];
    return { concil, publiques, chartData };
  }, [audiences, appliedDateDebut, appliedDateFin]);

  const t3 = useMemo(() => {
    const referes = periodAffaires.filter(a => a.typeOrdonnance === TypeOrdonnance.REFERE).length;
    const requetes = periodAffaires.filter(a => a.typeOrdonnance === TypeOrdonnance.REQUETE).length;
    const cnss = periodAffaires.filter(a => a.typeOrdonnance === TypeOrdonnance.CNSS).length;
    const autres = periodAffaires.filter(a => a.typeOrdonnance === TypeOrdonnance.AUTRE).length;
    const total = referes + requetes + cnss + autres;
    const chartData = [
      { name: 'Référés', value: referes },
      { name: 'Requêtes', value: requetes },
      { name: 'CNSS', value: cnss },
      { name: 'Autres', value: autres },
    ];
    return { referes, requetes, cnss, autres, total, chartData };
  }, [periodAffaires]);

  const t4 = useMemo(() => ({
    pvConciliation: periodAffaires.filter(a => a.etat === EtatAffaire.CONC_REUSSIE).length
  }), [periodAffaires]);

  const t5Data = useMemo(() => {
    const buckets = [
      { id: 'm6', label: 'Moins de 6 mois', check: (d: number) => d < 182 },
      { id: 'y1', label: '6 m à < 1 an', check: (d: number) => d >= 182 && d < 365 },
      { id: 'y2', label: '1 an à < 2 ans', check: (d: number) => d >= 365 && d < 730 },
      { id: 'plus', label: 'plus de 2 ans', check: (d: number) => d >= 730 }
    ];

    const rows = [
      { label: 'Ordonnances sur requête', filter: (a: Affaire) => a.typeOrdonnance === TypeOrdonnance.REQUETE },
      { label: 'Ordonnances de référés', filter: (a: Affaire) => a.typeOrdonnance === TypeOrdonnance.REFERE },
      { label: 'Jugements ADD', filter: (a: Affaire) => !!a.isADD },
      { label: 'Jugements Fond', filter: (a: Affaire) => !a.isADD && [EtatAffaire.JUGEE_1R, EtatAffaire.JUGEE_DEF].includes(a.etat) }
    ];

    const matrix = rows.map(row => {
      const filtered = closedInPeriod.filter(row.filter);
      const rowStats: any = { label: row.label };
      buckets.forEach(bucket => {
        rowStats[bucket.id] = filtered.filter(a => {
          const diff = (new Date(a.dateCloture!).getTime() - new Date(a.dateCreation).getTime()) / (1000 * 60 * 60 * 24);
          return bucket.check(diff);
        }).length;
      });
      return rowStats;
    });

    return { matrix, buckets };
  }, [closedInPeriod]);

  const t6Data = useMemo(() => {
    const matrix = personnel.map(p => ({
      ...p,
      total: p.homme + p.femme
    }));
    const totalGeneral = matrix.reduce((acc, curr) => ({
      homme: acc.homme + curr.homme,
      femme: acc.femme + curr.femme,
      total: acc.total + curr.total
    }), { homme: 0, femme: 0, total: 0 });
    return { matrix, totalGeneral };
  }, [personnel]);

  // Fonction de simulation d'exportation vers la BD
  const handleExportToDB = () => {
    setIsExporting(true);
    // Simulation d'un appel API (sauvegarde des 6 tableaux)
    setTimeout(() => {
      console.log('Exportation des 6 tableaux vers la BD...', {
        periode: { debut: appliedDateDebut, fin: appliedDateFin },
        tableaux: { t1, t2, t3, t4, t5: t5Data, t6: t6Data }
      });
      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    }, 1500);
  };

  const tabs = [
    { id: 'TABLEAU_1', label: '1. Écoulement', icon: TrendingUp },
    { id: 'TABLEAU_2', label: '2. Audiences', icon: Gavel },
    { id: 'TABLEAU_3', label: '3. Ordonnances', icon: FileText },
    { id: 'TABLEAU_4', label: '4. Conciliations', icon: CheckCircle2 },
    { id: 'TABLEAU_5', label: '5. Durées', icon: Timer },
    { id: 'TABLEAU_6', label: '6. Personnel', icon: UserCheck },
  ];

  const TableHeader = ({ tabId, title, onExport }: { tabId: string, title: string, onExport: () => void }) => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <h3 className="text-xl font-black text-gray-900 uppercase italic tracking-tight">{title}</h3>
      <div className="flex space-x-2">
        <button 
          onClick={() => toggleViewMode(tabId)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
        >
          {viewModes[tabId] === 'table' ? <BarChart3 size={14} /> : <TableIcon size={14} />}
          <span>{viewModes[tabId] === 'table' ? 'Vue Graphique' : 'Vue Tableau'}</span>
        </button>
        <button 
          onClick={onExport}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-blue-100"
        >
          <Download size={14} />
          <span>Exporter Excel</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      {/* HEADER PRINCIPAL */}
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 flex flex-col lg:flex-row items-center justify-between gap-10">
        <div className="flex items-center space-x-8">
          <div className="bg-black p-6 rounded-[2rem] text-white shadow-2xl"><Scale size={48} /></div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Analyse Statistique</h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em] mt-2">Pilotage du Tribunal du Travail</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center bg-gray-50 p-4 rounded-[2rem] border border-gray-200 shadow-inner">
             <Calendar size={18} className="text-gray-400 ml-4" />
             <input type="date" value={dateDebut} onChange={e => handleDateChange('debut', e.target.value)} className="bg-transparent font-black text-gray-800 outline-none text-sm px-2" />
             <span className="text-gray-300 font-bold text-[10px] uppercase tracking-widest">au</span>
             <input type="date" value={dateFin} onChange={e => handleDateChange('fin', e.target.value)} className="bg-transparent font-black text-gray-800 outline-none text-sm px-2" />
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={handleRecalculate}
              className="flex items-center space-x-3 px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-green-900/10 active:scale-95 group"
            >
              <RefreshCw size={18} className={`${!isDataApplied ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-700`} />
              <span>Recalculer</span>
            </button>
            <button 
              onClick={handleExportToDB}
              disabled={!isDataApplied || isExporting}
              className={`flex items-center space-x-3 px-8 py-4 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl border ${
                exportSuccess 
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                  : !isDataApplied 
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700 shadow-indigo-900/10 active:scale-95'
              }`}
            >
              {isExporting ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : exportSuccess ? (
                <Check size={18} />
              ) : (
                <CloudUpload size={18} />
              )}
              <span>{isExporting ? 'Envoi...' : exportSuccess ? 'Exporté !' : 'Exporter vers BD'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* TABS DE NAVIGATION */}
      <div className="flex space-x-2 overflow-x-auto pb-4 no-scrollbar">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center space-x-3 px-6 py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all border whitespace-nowrap ${
              activeTab === t.id ? 'bg-black text-white border-black scale-105 z-10' : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'
            }`}
          >
            <t.icon size={14} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* PÉRIODE ACTUELLEMENT AFFICHÉE ET STATUT DE SYNCHRO */}
      <div className="flex items-center space-x-4 px-6">
        <div className={`h-[1px] flex-1 ${isDataApplied ? 'bg-gray-200' : 'bg-amber-200'}`}></div>
        <div className="flex flex-col items-center gap-1">
          <span className={`text-[10px] font-black uppercase tracking-widest ${isDataApplied ? 'text-gray-400' : 'text-amber-600'}`}>
            Statistiques du {new Date(appliedDateDebut).toLocaleDateString('fr-FR')} au {new Date(appliedDateFin).toLocaleDateString('fr-FR')}
          </span>
          {!isDataApplied && (
            <span className="text-[8px] font-bold text-amber-500 uppercase tracking-tighter">
              ⚠️ Dates modifiées : Cliquez sur "Recalculer" pour mettre à jour
            </span>
          )}
        </div>
        <div className={`h-[1px] flex-1 ${isDataApplied ? 'bg-gray-200' : 'bg-amber-200'}`}></div>
      </div>

      {/* CONTENU DYNAMIQUE */}
      <div className="animate-in slide-in-from-bottom-8 duration-500">
        
        {activeTab === 'TABLEAU_1' && (
          <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-gray-100 font-serif">
            <TableHeader 
              tabId="TABLEAU_1" 
              title="Tableau 1 : Écoulement des affaires sociales" 
              onExport={() => exportToExcel([t1.chartData.map(d => d.name), t1.chartData.map(d => d.value)], "Tableau1_Ecoulement")}
            />
            {viewModes['TABLEAU_1'] === 'table' ? (
              <div className="overflow-x-auto bg-gray-50/50 p-8 rounded-[2.5rem] border border-black/5">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-white">
                      <th className="border-2 border-black p-4 text-[10px] font-black uppercase">Stock Initial</th>
                      <th className="border-2 border-black p-4 text-[10px] font-black uppercase text-blue-600">Enrôlées</th>
                      <th className="border-2 border-black p-4 text-[10px] font-black uppercase text-indigo-600">Jugements Fond</th>
                      <th className="border-2 border-black p-4 text-[10px] font-black uppercase text-amber-600">Autres Sorties</th>
                      <th className="border-2 border-black p-4 text-[10px] font-black uppercase bg-gray-100">Stock Fin</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border-2 border-black p-6 bg-white"><DigitBox value={t1.stockInitial} /></td>
                      <td className="border-2 border-black p-6 bg-white"><DigitBox value={t1.enrolees} /></td>
                      <td className="border-2 border-black p-6 bg-white"><DigitBox value={t1.fonds} /></td>
                      <td className="border-2 border-black p-6 bg-white"><DigitBox value={t1.sortiesAutres} /></td>
                      <td className="border-2 border-black p-6 bg-gray-100"><DigitBox value={t1.stockFin} /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-[400px] w-full bg-gray-50 rounded-[2.5rem] p-8 border border-black/5">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={t1.chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={10} fontWeight="bold" />
                    <YAxis fontSize={10} />
                    <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="value" fill="#000" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {activeTab === 'TABLEAU_2' && (
          <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-gray-100 font-serif">
            <TableHeader 
              tabId="TABLEAU_2" 
              title="Tableau 2 : Audiences tenues" 
              onExport={() => exportToExcel(t2.chartData, "Tableau2_Audiences")}
            />
            {viewModes['TABLEAU_2'] === 'table' ? (
              <div className="grid grid-cols-2 gap-10 max-w-4xl mx-auto">
                <div className="p-10 bg-gray-50 border-2 border-black rounded-[2.5rem]">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-6 text-center">Conciliations</label>
                  <DigitBox value={t2.concil} />
                </div>
                <div className="p-10 bg-gray-50 border-2 border-black rounded-[2.5rem]">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-6 text-center">Audiences publiques</label>
                  <DigitBox value={t2.publiques} />
                </div>
              </div>
            ) : (
              <div className="h-[400px] w-full flex items-center justify-center bg-gray-50 rounded-[2.5rem] p-8">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={t2.chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {t2.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {activeTab === 'TABLEAU_3' && (
          <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-gray-100 font-serif">
            <TableHeader 
              tabId="TABLEAU_3" 
              title="Tableau 3 : Ordonnances Rendues" 
              onExport={() => exportToExcel(t3.chartData, "Tableau3_Ordonnances")}
            />
            {viewModes['TABLEAU_3'] === 'table' ? (
              <div className="overflow-x-auto bg-gray-50/50 p-8 rounded-[2.5rem] border border-black/5">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-white">
                      <th className="border-2 border-black p-4 text-[10px] font-black uppercase">Référés</th>
                      <th className="border-2 border-black p-4 text-[10px] font-black uppercase">Requêtes</th>
                      <th className="border-2 border-black p-4 text-[10px] font-black uppercase">CNSS</th>
                      <th className="border-2 border-black p-4 text-[10px] font-black uppercase">Autres</th>
                      <th className="border-2 border-black p-4 text-[10px] font-black uppercase bg-gray-100">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border-2 border-black p-6 bg-white"><DigitBox value={t3.referes} /></td>
                      <td className="border-2 border-black p-6 bg-white"><DigitBox value={t3.requetes} /></td>
                      <td className="border-2 border-black p-6 bg-white"><DigitBox value={t3.cnss} /></td>
                      <td className="border-2 border-black p-6 bg-white"><DigitBox value={t3.autres} /></td>
                      <td className="border-2 border-black p-6 bg-gray-100"><DigitBox value={t3.total} /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-[400px] w-full bg-gray-50 rounded-[2.5rem] p-8 border border-black/5">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={t3.chartData}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" fontSize={10} />
                    <YAxis dataKey="name" type="category" fontSize={10} width={100} fontWeight="bold" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 10, 10, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {activeTab === 'TABLEAU_4' && (
          <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-gray-100 font-serif text-center">
            <TableHeader 
              tabId="TABLEAU_4" 
              title="Tableau 4 : Dossiers Conciliés" 
              onExport={() => exportToExcel([{ name: "Dossiers Conciliés", value: t4.pvConciliation }], "Tableau4_Conciliations")}
            />
            <div className="max-w-md mx-auto p-12 bg-gray-50 border-2 border-black rounded-[3rem] shadow-inner">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] block mb-8">PV de conciliation totale signés</label>
              <DigitBox value={t4.pvConciliation} digits={4} />
              <div className="mt-10 flex items-center justify-center space-x-3 text-green-600 font-black text-xs uppercase">
                <CheckCircle2 size={16} />
                <span>Objectif Mensuel atteint à 85%</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'TABLEAU_5' && (
          <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-gray-100 font-serif">
            <TableHeader 
              tabId="TABLEAU_5" 
              title="Tableau 5 : Durée de traitement" 
              onExport={() => exportToExcel(t5Data.matrix, "Tableau5_Durées")}
            />
            {viewModes['TABLEAU_5'] === 'table' ? (
              <div className="overflow-x-auto bg-gray-50/50 p-6 rounded-[2.5rem] border border-black/5">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-white">
                      <th className="border-2 border-black p-4 text-[9px] font-black uppercase bg-gray-100 min-w-[200px] text-left">Dossiers traités</th>
                      {t5Data.buckets.map(b => (
                        <th key={b.id} className="border-2 border-black p-2 text-[8px] font-black uppercase text-center">{b.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {t5Data.matrix.map((row, idx) => (
                      <tr key={idx} className="bg-white">
                        <td className="border-2 border-black p-4 text-[9px] font-bold uppercase">{row.label}</td>
                        {t5Data.buckets.map(b => (
                          <td key={b.id} className="border-2 border-black p-4"><DigitBox value={row[b.id]} digits={2} /></td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-[400px] w-full bg-gray-50 rounded-[2.5rem] p-8 border border-black/5">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={t5Data.matrix}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" fontSize={9} fontWeight="bold" />
                    <YAxis fontSize={10} />
                    <Tooltip />
                    <Legend iconType="circle" />
                    <Bar dataKey="m6" name="< 6 mois" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="y1" name="6m-1an" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="y2" name="1an-2ans" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="plus" name="> 2 ans" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {activeTab === 'TABLEAU_6' && (
          <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-gray-100 font-serif">
            <TableHeader 
              tabId="TABLEAU_6" 
              title="Tableau 6 : Effectif du personnel" 
              onExport={() => exportToExcel(t6Data.matrix, "Tableau6_Personnel")}
            />
            {viewModes['TABLEAU_6'] === 'table' ? (
              <div className="overflow-x-auto bg-gray-50/50 p-10 rounded-[2.5rem] border border-black/5">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-white">
                      <th className="border-2 border-black p-6 text-[11px] font-black uppercase text-left bg-gray-100 min-w-[250px]">Catégories du personnel</th>
                      <th className="border-2 border-black p-4 text-[11px] font-black uppercase text-center bg-blue-50/50">Homme</th>
                      <th className="border-2 border-black p-4 text-[11px] font-black uppercase text-center bg-pink-50/50">Femme</th>
                      <th className="border-2 border-black p-4 text-[11px] font-black uppercase text-center bg-gray-200">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {t6Data.matrix.map((row, idx) => (
                      <tr key={idx} className="bg-white">
                        <td className="border-2 border-black p-6 text-[10px] font-black uppercase">{row.categorie}</td>
                        <td className="border-2 border-black p-6"><DigitBox value={row.homme} digits={3} /></td>
                        <td className="border-2 border-black p-6"><DigitBox value={row.femme} digits={3} /></td>
                        <td className="border-2 border-black p-6 bg-gray-50"><DigitBox value={row.total} digits={3} /></td>
                      </tr>
                    ))}
                    <tr className="bg-black text-white">
                      <td className="border-2 border-black p-6 text-[11px] font-black uppercase">TOTAL GÉNÉRAL</td>
                      <td className="border-2 border-black p-6"><DigitBox value={t6Data.totalGeneral.homme} digits={3} /></td>
                      <td className="border-2 border-black p-6"><DigitBox value={t6Data.totalGeneral.femme} digits={3} /></td>
                      <td className="border-2 border-black p-6 bg-white/10"><DigitBox value={t6Data.totalGeneral.total} digits={3} /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-[450px] w-full bg-gray-50 rounded-[2.5rem] p-8 border border-black/5">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={t6Data.matrix} stackOffset="sign">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="categorie" fontSize={9} fontWeight="bold" />
                    <YAxis fontSize={10} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="homme" name="Hommes" fill="#3b82f6" stackId="a" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="femme" name="Femmes" fill="#ec4899" stackId="a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
