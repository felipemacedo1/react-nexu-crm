import { BaseService } from './base.service';

export interface UsuarioDTO {
    id?: string;
    nome: string;
    sobrenome: string;
    email: string;
    nomeUsuario: string;
    senha?: string;
    telefone?: string;
    titulo?: string;
    departamento?: string;
    ativo?: boolean;
    administrador?: boolean;
    criadoEm?: string;
    atualizadoEm?: string;
}

class UsuarioServiceClass extends BaseService<UsuarioDTO> {
    constructor() {
        super('/usuario');
    }

    async buscarPorEmail(email: string): Promise<UsuarioDTO[]> {
        return this.search({ email });
    }
}

export const UsuarioService = new UsuarioServiceClass();
