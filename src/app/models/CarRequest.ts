import { TechnicalSpecificationsRequest } from "./TechnicalSpecificationsRequest";

export interface CarRequest {
  marca: string;
  modelo: string;
  precio: number;
  anio: number;
  km: string;
  color: string;
  fichaTecnica: TechnicalSpecificationsRequest;
  imagenesUrl: string[];
}