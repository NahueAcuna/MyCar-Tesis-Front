import { CarResponse } from "./CarResponse";


export interface PublicationResponse {
  id: number;
  descripcion: string;
  estado: string;
  tipoPublicacion: string;
  nombreVendedor: string;
  vendedorTelefono: string;
  auto: CarResponse;
}