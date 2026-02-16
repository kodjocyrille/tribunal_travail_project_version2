export interface EnrolementRequest {
    numOrdre: string;
    numRoleGeneral: string;
    dateRequete: string; // ISO Date "YYYY-MM-DD"
    dateArrivee: string; // ISO Date "YYYY-MM-DD"
    nature: string; // NatureAffaire (LIC, SAL, etc.)
    typeDossier: 'individuel' | 'collectif';
    resume: string; // Facultatif
    natureAudienceConciliation: string; // TypeAudienceConciliation (NORMAL, REFERE, URGENCE)
    dateAudienceConciliation: string; // ISO Date "YYYY-MM-DD"
    parties: {
        type: 'demandeur' | 'defendeur';
        qualite: string;
        nom: string;
        adresse: string;
        prenom?: string; // Facultatif
        email?: string; // Facultatif
        telephone?: string; // Facultatif
    }[];
}
