import { IncidentType } from "../enums/incident-type.enums";

export interface IncidentCDto {
    lat: number;
    lon: number;
    title: string;
    description: string;
    type : IncidentType;    
}