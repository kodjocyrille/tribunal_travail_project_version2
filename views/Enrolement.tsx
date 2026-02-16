
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../store';
import { ApiService } from '../services/api';
import { NatureAffaire, EtatAffaire, Affaire, Partie, TypeAudienceConciliation, EnrolementRequest } from '../types';
import { NATURE_LABELS } from '../constants';
import { Plus, Trash2, Save, FileText, Calendar, Users, AlertCircle, Info, Hash, Loader } from 'lucide-react';

export const Enrolement: React.FC = () => {
  const { addAffaire, affaires } = useAppState();
  const navigate = useNavigate();

  const getNextRoleNumber = () => {
    const year = new Date().getFullYear();
    const count = affaires.filter(a => a.numRoleGeneral.endsWith(year.toString())).length + 1;
    return `${count.toString().padStart(3, '0')}/${year}`;
  };

  const [formData, setFormData] = useState({
    numOrdre: '',
    numRoleGeneral: getNextRoleNumber(),
    dateRequete: '',
    dateArrivee: new Date().toISOString().split('T')[0],
    nature: NatureAffaire.LIC,
    typeDossier: 'individuel' as 'individuel' | 'collectif',
    resume: '',
    natureAudienceConciliation: TypeAudienceConciliation.NORMAL,
    dateAudienceConciliation: ''
  });

  const [demandeurs, setDemandeurs] = useState<Partie[]>([
    { id: 'd1', type: 'demandeur', qualite: 'Salarié', nom: '', adresse: '' }
  ]);
  const [defendeurs, setDefendeurs] = useState<Partie[]>([
    { id: 'def1', type: 'defendeur', qualite: 'Employeur', nom: '', adresse: '' }
  ]);

  const addPartie = (type: 'demandeur' | 'defendeur') => {
    const newPartie: Partie = {
      id: Math.random().toString(36).substring(7),
      type,
      qualite: type === 'demandeur' ? 'Salarié' : 'Employeur',
      nom: '',
      adresse: ''
    };
    if (type === 'demandeur') setDemandeurs([...demandeurs, newPartie]);
    else setDefendeurs([...defendeurs, newPartie]);
  };

  const removePartie = (type: 'demandeur' | 'defendeur', id: string) => {
    if (type === 'demandeur') {
      if (demandeurs.length > 1) setDemandeurs(demandeurs.filter(p => p.id !== id));
    } else {
      if (defendeurs.length > 1) setDefendeurs(defendeurs.filter(p => p.id !== id));
    }
  };

  const updatePartie = (type: 'demandeur' | 'defendeur', id: string, value: string) => {
    const list = type === 'demandeur' ? demandeurs : defendeurs;
    const newList = list.map(p => p.id === id ? { ...p, nom: value } : p);
    if (type === 'demandeur') setDemandeurs(newList);
    else setDefendeurs(newList);
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Mapping des natures de litige pour le backend (PascalCase standard C#)
    const NATURE_MAPPING: Record<string, string> = {
      [NatureAffaire.LIC]: 'Licenciement',
      [NatureAffaire.SAL]: 'Salaire',
      [NatureAffaire.HAR]: 'Harcelement',
      [NatureAffaire.ACC]: 'AccidentTravail',
      [NatureAffaire.AUT]: 'Autre'
    };

    // Mapping des valeurs pour correspondre à l'API
    const enrolementData: EnrolementRequest = {
      natureLitige: NATURE_MAPPING[formData.nature] || 'Autre', // Tous les autres mappés sur AUTRE
      typeDossier: formData.typeDossier === 'individuel' ? 'INDIVIDUEL' : 'COLLECTIF',
      observations: formData.resume || "Aucune observation",
      dateRequete: new Date(formData.dateRequete || new Date()).toISOString(),
      dateArrivee: new Date(formData.dateArrivee || new Date()).toISOString(),
      dateAudienceConciliation: new Date(formData.dateAudienceConciliation || new Date()).toISOString(),
      typeAudience: formData.natureAudienceConciliation === TypeAudienceConciliation.NORMAL ? 'CONCILIATION_NORMALE' :
        formData.natureAudienceConciliation === TypeAudienceConciliation.REFERE ? 'CONCILIATION_ACCELEREE' : 'CONCILIATION_URGENCE',

      parties: [...demandeurs, ...defendeurs].map(p => ({
        nomComplet: p.nom,
        nomEntite: "",
        numeroRccm: "",
        email: p.email || "",
        telephone: p.telephone || "",
        adresse: p.adresse || "",
        typePersonne: "PHYSIQUE",
        typePartie: p.type === 'demandeur' ? "DEMANDEUR" : "DEFENDEUR",
        qualite: p.qualite,
        observations: ""
      })),

      documents: []
    };

    try {
      console.log('Sending payload:', JSON.stringify(enrolementData, null, 2)); // Pour le debug
      await ApiService.affaires.create(enrolementData);
      alert(`Dossier enrôlé avec succès !`);
      navigate('/affaires');
    } catch (error: any) {
      console.error('API Error:', error);
      alert(`Erreur lors de l'enrôlement : ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b bg-blue-800 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold flex items-center">
              <FileText className="mr-3" /> Nouveau Dossier - Enrôlement
            </h2>
            <p className="text-blue-100 text-xs mt-1 italic">Veuillez renseigner les informations officielles du greffe</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-10">

          <section className="space-y-6">
            <h3 className="text-blue-900 font-bold flex items-center border-b pb-2 uppercase text-xs tracking-widest">
              <Info size={16} className="mr-2 text-blue-600" /> Informations de l'Acte
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Date de la Requête</label>
                <input
                  type="date" required
                  className="w-full border-2 rounded-lg p-2.5 focus:border-blue-500 outline-none transition-all text-gray-900 bg-white"
                  value={formData.dateRequete}
                  onChange={e => setFormData({ ...formData, dateRequete: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Date d'arrivée</label>
                <input
                  type="date" required
                  className="w-full border-2 rounded-lg p-2.5 focus:border-blue-500 outline-none transition-all text-gray-900 bg-white"
                  value={formData.dateArrivee}
                  onChange={e => setFormData({ ...formData, dateArrivee: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Nature du Litige</label>
                <select
                  className="w-full border-2 rounded-lg p-2.5 focus:border-blue-500 outline-none bg-white text-gray-900 font-medium"
                  value={formData.nature}
                  onChange={e => setFormData({ ...formData, nature: e.target.value as any })}
                >
                  {Object.entries(NATURE_LABELS).map(([key, label]) => (
                    <option key={key} value={key} className="text-gray-900 bg-white">{label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Type de dossier</label>
                <div className="flex items-center space-x-6 h-[46px] px-2">
                  <label className="flex items-center space-x-2 cursor-pointer group">
                    <input type="radio" checked={formData.typeDossier === 'individuel'} onChange={() => setFormData({ ...formData, typeDossier: 'individuel' })} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Individuel</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer group">
                    <input type="radio" checked={formData.typeDossier === 'collectif'} onChange={() => setFormData({ ...formData, typeDossier: 'collectif' })} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Collectif</span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-blue-900 font-bold flex items-center uppercase text-xs tracking-widest">
                <Users size={16} className="mr-2 text-blue-600" /> Demandeurs
              </h3>
              <button
                type="button" onClick={() => addPartie('demandeur')}
                className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 transition-all flex items-center border border-blue-200"
              >
                <Plus size={14} className="mr-1" /> Ajouter
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {demandeurs.map((p) => (
                <div key={p.id} className="relative p-4 bg-gray-50 rounded-xl border border-gray-200">
                  {demandeurs.length > 1 && (
                    <button onClick={() => removePartie('demandeur', p.id)} className="absolute top-1/2 -translate-y-1/2 -right-2 bg-white text-red-500 p-1.5 rounded-full shadow-md border border-red-100 hover:bg-red-50 transition-colors z-10">
                      <Trash2 size={16} />
                    </button>
                  )}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Nom et Prénoms du Demandeur</label>
                    <input
                      type="text" required placeholder="Saisir l'identité complète"
                      className="w-full border-2 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none text-gray-900 font-bold bg-white"
                      value={p.nom}
                      onChange={e => updatePartie('demandeur', p.id, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-blue-900 font-bold flex items-center uppercase text-xs tracking-widest">
                <Users size={16} className="mr-2 text-blue-600" /> Défendeurs
              </h3>
              <button
                type="button" onClick={() => addPartie('defendeur')}
                className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 transition-all flex items-center border border-blue-200"
              >
                <Plus size={14} className="mr-1" /> Ajouter
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {defendeurs.map((p) => (
                <div key={p.id} className="relative p-4 bg-gray-50 rounded-xl border border-gray-200">
                  {defendeurs.length > 1 && (
                    <button onClick={() => removePartie('defendeur', p.id)} className="absolute top-1/2 -translate-y-1/2 -right-2 bg-white text-red-500 p-1.5 rounded-full shadow-md border border-red-100 hover:bg-red-50 transition-colors z-10">
                      <Trash2 size={16} />
                    </button>
                  )}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Nom et Prénoms / Raison Sociale du Défendeur</label>
                    <input
                      type="text" required placeholder="Saisir l'identité ou la raison sociale"
                      className="w-full border-2 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none text-gray-900 font-bold bg-white"
                      value={p.nom}
                      onChange={e => updatePartie('defendeur', p.id, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-6 bg-blue-50/40 p-6 rounded-2xl border border-blue-100 shadow-inner">
            <h3 className="text-blue-900 font-bold flex items-center uppercase text-xs tracking-widest">
              <Calendar size={16} className="mr-2 text-blue-600" /> Audience de Réconciliation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Nature de l'audience</label>
                <div className="space-y-2">
                  {[
                    { id: TypeAudienceConciliation.NORMAL, label: 'Normal' },
                    { id: TypeAudienceConciliation.REFERE, label: 'Référé' },
                    { id: TypeAudienceConciliation.URGENCE, label: 'Délai d’urgence' }
                  ].map(opt => (
                    <label key={opt.id} className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.natureAudienceConciliation === opt.id ? 'bg-white border-blue-500 shadow-sm ring-2 ring-blue-100' : 'bg-transparent border-gray-100 hover:border-blue-200'}`}>
                      <input
                        type="radio" name="natureConcil" className="w-4 h-4 text-blue-600 focus:ring-0"
                        checked={formData.natureAudienceConciliation === opt.id}
                        onChange={() => setFormData({ ...formData, natureAudienceConciliation: opt.id })}
                      />
                      <span className="ml-3 text-sm font-semibold text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Date de l'audience</label>
                <input
                  type="date" required
                  className="w-full border-2 border-gray-100 rounded-xl p-3.5 focus:border-blue-500 outline-none bg-white transition-all shadow-sm text-gray-900 font-bold"
                  value={formData.dateAudienceConciliation}
                  onChange={e => setFormData({ ...formData, dateAudienceConciliation: e.target.value })}
                />
                <div className="mt-6 p-4 bg-white rounded-xl border border-blue-100 flex items-start space-x-3">
                  <AlertCircle size={16} className="text-blue-500 mt-0.5" />
                  <p className="text-[11px] text-blue-700 leading-relaxed font-medium">Date pour la tentative obligatoire de conciliation.</p>
                </div>
              </div>
            </div>
          </section>

          <div className="pt-8 flex justify-end space-x-4 border-t border-gray-100">
            <button
              type="button" onClick={() => navigate('/')}
              className="px-6 py-3 border-2 border-gray-100 rounded-xl font-bold text-gray-400 hover:bg-gray-50 transition-all"
            >
              Abandonner
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-12 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center ${loading ? 'bg-blue-700 text-blue-200 cursor-wait' : 'bg-blue-800 text-white hover:bg-blue-900'}`}
            >
              {loading ? (
                <>
                  <Loader size={20} className="mr-2 animate-spin" /> Traitement...
                </>
              ) : (
                <>
                  <Save size={20} className="mr-2" /> Enrôler le dossier
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
