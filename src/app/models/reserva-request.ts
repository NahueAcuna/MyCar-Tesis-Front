export interface ReservaRequest {
    idPublicacion: number;
    fecha?: string;
    usuarioReservaDTO: {
        nombre?: string,
        email: string,
        telefono?: string
    }
}
