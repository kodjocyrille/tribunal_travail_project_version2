
export enum NatureAffaire {
  LIC = 'LIC',
  SAL = 'SAL',
  HAR = 'HAR',
  ACC = 'ACC',
  CONG = 'CONG',
  DOM = 'DOM',
  DISC = 'DISC',
  COL = 'COL',
  TRAVAUX = 'TRAVAUX',
  AUT = 'AUT'
}

export enum EtatAffaire {
  ENR = 'ENR',
  EN_CONCIL = 'EN_CONCIL',
  CONC_REUSSIE = 'CONC_REUSSIE',
  CONC_ECHOUEE = 'CONC_ECHOUEE',
  EN_JUG = 'EN_JUG',
  RENVOYEE = 'RENVOYEE',
  EN_DELIBERE = 'EN_DELIBERE',
  JUGEE_1R = 'JUGEE_1R',
  JUGEE_DEF = 'JUGEE_DEF',
  RADIEE = 'RADIEE',
  EXECUTEE = 'EXECUTEE',
  CLOTUREE = 'CLOTUREE',
  DESISTEMENT = 'DESISTEMENT'
}

export enum TypeOrdonnance {
  REFERE = 'REFERE',
  REQUETE = 'REQUETE',
  CNSS = 'CNSS',
  AUTRE = 'AUTRE'
}

export enum TypeAudienceConciliation {
  NORMAL = 'NORMAL',
  REFERE = 'REFERE',
  URGENCE = 'URGENCE',
  CONCILIATION_ACCELEREE = 'CONCILIATION_ACCELEREE'
}

export enum TypeAudience {
  CONC_N = 'CONC_N',
  CONC_R = 'CONC_R',
  CONC_U = 'CONC_U',
  JUG = 'JUG'
}

export interface Partie {
  id: string;
  type: 'demandeur' | 'defendeur';
  qualite: string;
  nom: string;
  prenom?: string;
  adresse: string;
  telephone?: string;
  email?: string;
  representant?: string;
}

export interface AffaireAudience {
  audienceId: string;
  dateAudience: string;
  typeAudience: string; // ou TypeAudienceConciliation
  salle: string;
  ordreAppel: number | null;
}

export interface RenvoyerRequest {
  audienceActuelleId: string;
  dateRenvoi: string;
  decision: string;
  mesureInstruction: string;
  motif: string;
  observations: string;
}

export interface Affaire {
  id: string;
  numOrdre: string;
  numRoleGeneral: string;
  dateRequete: string;
  dateArrivee: string;
  nature: NatureAffaire;
  typeDossier: 'individuel' | 'collectif';
  resume: string;
  etat: EtatAffaire;
  parties: Partie[];
  dateCreation: string;
  natureAudienceConciliation: TypeAudienceConciliation;
  dateAudienceConciliation: string;
  dateAudienceJugement?: string;
  magistratAssigne?: string;
  dateCloture?: string;
  isADD?: boolean;
  isAppealed?: boolean;
  isPourvoi?: boolean;
  isOpposition?: boolean;
  typeOrdonnance?: TypeOrdonnance;
  audiences: AffaireAudience[];
  historiqueRenvois: any[];
}

export interface PlumitifEntry {
  id: string;
  affaireId: string;
  dateSeance: string;
  dateActe?: string; // Pour compatibilité backend
  type: 'CONCILIATION' | 'AUDIENCE_PUBLIQUE';
  magistrat: string;
  greffier: string;
  evenement: string;
  observations: string;
}

export interface Audience {
  id: string;
  date: string;
  heureDebut: string;
  type: TypeAudience;
  salle: string;
  magistrats: string[];
  greffier: string;
  affaires: string[];
}

export enum UserRole {
  GREFFIER_ACCUEIL = 'GREFFIER_ACCUEIL',
  GREFFIER_AUDIENCE = 'GREFFIER_AUDIENCE',
  MAGISTRAT = 'MAGISTRAT',
  CHEF_GREFFE = 'CHEF_GREFFE',
  INSPECTEUR = 'INSPECTEUR',
  DGT = 'DGT'
}

// Added missing PersonnelStat interface for reporting and store
export interface PersonnelStat {
  categorie: string;
  homme: number;
  femme: number;
}

// Added missing Credentials interface for auth service
export interface Credentials {
  username: string;
  password: string;
  role: UserRole;
}

// Added missing AuthResponse interface for auth service
// Structure générique de réponse de l'API
export interface ApiResponse<T> {
  success: boolean;
  isSuccess: boolean;
  data: T;
  errors: string[];
  messages: string[];
  statusCode: number;
  errorCode: string | null;
}

// Données spécifiques retournées au login
// Données spécifiques retournées au login
export interface AuthData {
  accessToken: string;
  accessTokenExpiration: string;
  refreshToken: string;
  refreshTokenExpiration: string;
  email: string;
  nomComplet: string; // Peut être une chaîne vide ""
  roles: string[];
}

// Ancienne interface AuthResponse adaptée pour compatibilité (si besoin) ou remplacée
export type AuthResponse = ApiResponse<AuthData>;

// Added missing StatsReport interface for statistics service
export interface StatsReport {
  generatedAt: string;
  period: {
    debut: string;
    fin: string;
  };
  data: any;
}

export interface DocDocument {
  titre: string;
  typeDocument: string;
  cheminGED: string;
}

// Structure de la requête pour l'enrôlement d'une affaire
export interface EnrolementRequest {
  natureLitige: string; // Ex: "LICENCIEMENT"
  typeDossier: string; // Ex: "INDIVIDUEL"
  observations: string;
  dateRequete: string; // ISO timestamps
  dateArrivee: string;
  dateAudienceConciliation: string;
  typeAudience: string; // Ex: "CONCILIATION_NORMALE"
  parties: {
    nomComplet: string;
    nomEntite: string;
    numeroRccm: string;
    email: string;
    telephone: string;
    adresse: string;
    typePersonne: string; // "PHYSIQUE" | "MORALE"
    typePartie: string; // "DEMANDEUR" | "DEFENDEUR"
    qualite: string;
    observations: string;
  }[];
  documents: DocDocument[];
}
