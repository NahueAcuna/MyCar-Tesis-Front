export interface ReservaResponse {
    id: number;
    usuarioReserva: {
        nombre?: string;
        email: string;
        telefono?: string;
    };
    fecha: string;
    idPublicacion: number;
    montoReserva: number;
    estadoReserva: 'PENDIENTE' | 'ACEPTADA' | 'CANCELADA';
}
