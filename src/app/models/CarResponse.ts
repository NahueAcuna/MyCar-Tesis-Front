import { TechnicalSpecificationsResponse } from "./TechnicalSpecificationsResponse";

export interface CarResponse {
  id: number;
  marca: string;
  modelo: string;
  precio: number;
  anio: number;
  km: string;
  color: string;
  fichaTecnica: TechnicalSpecificationsResponse;
  imagenesUrl: string[];
}