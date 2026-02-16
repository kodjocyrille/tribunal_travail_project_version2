
import React from 'react';
import { NatureAffaire, EtatAffaire, TypeAudience } from './types';

export const NATURE_LABELS: Record<NatureAffaire, string> = {
  [NatureAffaire.LIC]: 'Licenciement',
  [NatureAffaire.SAL]: 'Salaires impayés',
  [NatureAffaire.HAR]: 'Harcèlement',
  [NatureAffaire.ACC]: 'Accident du travail',
  [NatureAffaire.CONG]: 'Congés/RTT',
  [NatureAffaire.DOM]: 'Dommages-intérêts',
  [NatureAffaire.DISC]: 'Discipline',
  [NatureAffaire.COL]: 'Conflit collectif',
  [NatureAffaire.TRAVAUX]: 'Conditions de travail',
  [NatureAffaire.AUT]: 'Autre'
};

// Adding missing state labels for type completeness
export const ETAT_LABELS: Record<EtatAffaire, { label: string; color: string }> = {
  [EtatAffaire.ENR]: { label: 'Enrôlée', color: 'bg-blue-100 text-blue-800' },
  [EtatAffaire.EN_CONCIL]: { label: 'En conciliation', color: 'bg-indigo-100 text-indigo-800' },
  [EtatAffaire.CONC_REUSSIE]: { label: 'Conciliation réussie', color: 'bg-green-100 text-green-800' },
  [EtatAffaire.CONC_ECHOUEE]: { label: 'Conciliation échouée', color: 'bg-orange-100 text-orange-800' },
  [EtatAffaire.EN_JUG]: { label: 'En jugement', color: 'bg-purple-100 text-purple-800' },
  [EtatAffaire.RENVOYEE]: { label: 'Renvoyée', color: 'bg-yellow-100 text-yellow-800' },
  [EtatAffaire.EN_DELIBERE]: { label: 'En délibéré', color: 'bg-pink-100 text-pink-800' },
  [EtatAffaire.JUGEE_1R]: { label: 'Jugée (1er ressort)', color: 'bg-emerald-100 text-emerald-800' },
  [EtatAffaire.JUGEE_DEF]: { label: 'Jugée définitivement', color: 'bg-teal-100 text-teal-800' },
  [EtatAffaire.RADIEE]: { label: 'Radiée', color: 'bg-gray-100 text-gray-800' },
  [EtatAffaire.EXECUTEE]: { label: 'Exécutée', color: 'bg-cyan-100 text-cyan-800' },
  [EtatAffaire.CLOTUREE]: { label: 'Clôturée', color: 'bg-black text-white' },
  [EtatAffaire.DESISTEMENT]: { label: 'Désistement', color: 'bg-slate-100 text-slate-800' }
};

export const TYPE_AUDIENCE_LABELS: Record<TypeAudience, string> = {
  [TypeAudience.CONC_N]: 'Conciliation normale',
  [TypeAudience.CONC_R]: 'Conciliation référé',
  [TypeAudience.CONC_U]: 'Conciliation urgence',
  [TypeAudience.JUG]: 'Audience de Jugement'
};
