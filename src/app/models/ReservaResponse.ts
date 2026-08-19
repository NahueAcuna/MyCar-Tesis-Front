export interface ReservaResponse {
    id: number;
    usuarioReserva: {
        nombre?: string;
        email: string;
        telefono?: string;
    };
    fecha: string;
    publicacion: {
        id: number;
        descripcion?: string;
        nombreVendedor?: string;
        auto?: any;
    };
    montoReserva: number;
    estadoReserva: 'PENDIENTE' | 'ACEPTADA' | 'CANCELADA';
}
