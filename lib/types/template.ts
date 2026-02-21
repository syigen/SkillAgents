export interface CriterionCreate {
    prompt: string;
    expected: string;
    minScore: number;
}

export interface CriterionResponse {
    prompt: string;
    expected: string;
    minScore: number;
    id: string;
    templateId: string;
}

export interface PublicCriterion {
    id: string;
    prompt: string;
    expected: string;
    min_score: number;
}

export interface TemplateCreate {
    name: string;
    description?: string | null;
    type: string;
    skills: string[];
    difficulty: string;
    status?: string; // default "private"
    criteria?: CriterionCreate[];
}

export interface TemplateUpdate {
    name?: string | null;
    description?: string | null;
    type?: string | null;
    skills?: string[] | null;
    difficulty?: string | null;
    status?: string | null;
    criteria?: CriterionCreate[] | null;
}

export interface TemplateResponse {
    name: string;
    description?: string | null;
    type: string;
    skills: string[];
    difficulty: string;
    status: string;
    id: string;
    lastUpdated: string | Date;
    criteria: CriterionResponse[];
}

export interface PublicTemplateResponse {
    id: string;
    name: string;
    description?: string | null;
    type: string;
    skills: string[];
    difficulty: string;
    status: string;
    last_updated: string | Date;
    criteria: PublicCriterion[];
}
