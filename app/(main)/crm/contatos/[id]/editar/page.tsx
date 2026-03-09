'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primereact/autocomplete';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { ProgressSpinner } from 'primereact/progressspinner';
import { classNames } from 'primereact/utils';
import { ContatoService, ContatoDTO } from '@/services/contato.service';
import { ContaService, ContaDTO } from '@/services/conta.service';

const SAUDACAO_OPTIONS = [
    { label: 'Sr.', value: 'Sr.' },
    { label: 'Sra.', value: 'Sra.' },
    { label: 'Dr.', value: 'Dr.' },
    { label: 'Dra.', value: 'Dra.' },
    { label: 'Prof.', value: 'Prof.' },
    { label: 'Profa.', value: 'Profa.' }
];

const EditarContatoPage = () => {
    const router = useRouter();
    const params = useParams();
    const toast = useRef<Toast>(null);
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [contaSelecionada, setContaSelecionada] = useState<ContaDTO | null>(null);
    const [contaSugestoes, setContaSugestoes] = useState<ContaDTO[]>([]);

    const [formData, setFormData] = useState<Partial<ContatoDTO>>({
        saudacao: '',
        nome: '',
        sobrenome: '',
        titulo: '',
        departamento: '',
        email: '',
        telefone: '',
        celular: '',
        contaId: '',
        descricao: '',
        endereco: '',
        cidade: '',
        estado: '',
        cep: '',
        pais: ''
    });

    const fetchContato = useCallback(async () => {
        setLoading(true);
        try {
            const contato: ContatoDTO = await ContatoService.buscarPorId(id);
            setFormData({
                saudacao: contato.saudacao || '',
                nome: contato.nome || '',
                sobrenome: contato.sobrenome || '',
                titulo: contato.titulo || '',
                departamento: contato.departamento || '',
                email: contato.email || '',
                telefone: contato.telefone || '',
                celular: contato.celular || '',
                contaId: contato.contaId || '',
                descricao: contato.descricao || '',
                endereco: contato.endereco || '',
                cidade: contato.cidade || '',
                estado: contato.estado || '',
                cep: contato.cep || '',
                pais: contato.pais || ''
            });
            // Carregar conta selecionada se existir
            if (contato.contaId) {
                try {
                    const conta = await ContaService.buscarPorId(contato.contaId);
                    setContaSelecionada(conta);
                } catch {
                    // Se não encontrar a conta, deixa vazio
                    setContaSelecionada({ id: contato.contaId, nome: contato.contaNome || contato.contaId } as ContaDTO);
                }
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Contato não encontrado',
                life: 5000
            });
            setTimeout(() => router.push('/crm/contatos'), 2000);
        } finally {
            setLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        if (id) {
            fetchContato();
        }
    }, [id, fetchContato]);

    const buscarContas = async (event: AutoCompleteCompleteEvent) => {
        try {
            const resultados = await ContaService.buscarPorNome(event.query);
            setContaSugestoes(resultados);
        } catch {
            setContaSugestoes([]);
        }
    };

    const updateField = (field: keyof ContatoDTO, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const isValidEmail = (email: string) => {
        if (!email) return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const isFormValid = () => {
        if (!formData.nome?.trim()) return false;
        if (!formData.sobrenome?.trim()) return false;
        if (formData.email && !isValidEmail(formData.email)) return false;
        return true;
    };

    const handleSave = async () => {
        setSubmitted(true);
        if (!isFormValid()) return;

        setSaving(true);
        try {
            const payload: Partial<ContatoDTO> = { ...formData };

            Object.keys(payload).forEach(key => {
                const k = key as keyof ContatoDTO;
                if (payload[k] === '' || payload[k] === undefined) {
                    delete payload[k];
                }
            });

            await ContatoService.atualizar(id, payload as ContatoDTO);

            toast.current?.show({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Contato atualizado com sucesso!',
                life: 3000
            });

            setTimeout(() => router.push(`/crm/contatos/${id}`), 1000);
        } catch (error: any) {
            const detail = error?.response?.data?.message || 'Erro ao atualizar contato';
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail,
                life: 5000
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <ProgressSpinner />
            </div>
        );
    }

    return (
        <div className="grid">
            <div className="col-12">
                <Toast ref={toast} />

                <div className="card">
                    {/* Header */}
                    <div className="flex align-items-center justify-content-between mb-4">
                        <div className="flex align-items-center gap-3">
                            <Button
                                icon="pi pi-arrow-left"
                                rounded
                                text
                                severity="secondary"
                                onClick={() => router.push(`/crm/contatos/${id}`)}
                            />
                            <h2 className="m-0 text-xl font-semibold">Editar Contato</h2>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                label="Cancelar"
                                icon="pi pi-times"
                                outlined
                                severity="secondary"
                                onClick={() => router.push(`/crm/contatos/${id}`)}
                            />
                            <Button
                                label="Salvar"
                                icon="pi pi-check"
                                severity="success"
                                loading={saving}
                                onClick={handleSave}
                            />
                        </div>
                    </div>

                    <Divider />

                    {/* Informações Pessoais */}
                    <h3 className="text-lg font-semibold mb-3">
                        <i className="pi pi-user mr-2" />
                        Informações Pessoais
                    </h3>
                    <div className="grid formgrid p-fluid">
                        <div className="field col-12 md:col-2">
                            <label htmlFor="saudacao" className="font-medium">Saudação</label>
                            <Dropdown
                                id="saudacao"
                                value={formData.saudacao || null}
                                options={SAUDACAO_OPTIONS}
                                onChange={(e) => updateField('saudacao', e.value)}
                                placeholder="—"
                                showClear
                            />
                        </div>

                        <div className="field col-12 md:col-5">
                            <label htmlFor="nome" className="font-medium">
                                Nome <span className="text-red-500">*</span>
                            </label>
                            <InputText
                                id="nome"
                                value={formData.nome || ''}
                                onChange={(e) => updateField('nome', e.target.value)}
                                className={classNames({ 'p-invalid': submitted && !formData.nome?.trim() })}
                            />
                            {submitted && !formData.nome?.trim() && (
                                <small className="p-error">Nome é obrigatório.</small>
                            )}
                        </div>

                        <div className="field col-12 md:col-5">
                            <label htmlFor="sobrenome" className="font-medium">
                                Sobrenome <span className="text-red-500">*</span>
                            </label>
                            <InputText
                                id="sobrenome"
                                value={formData.sobrenome || ''}
                                onChange={(e) => updateField('sobrenome', e.target.value)}
                                className={classNames({ 'p-invalid': submitted && !formData.sobrenome?.trim() })}
                            />
                            {submitted && !formData.sobrenome?.trim() && (
                                <small className="p-error">Sobrenome é obrigatório.</small>
                            )}
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="titulo" className="font-medium">Cargo</label>
                            <InputText
                                id="titulo"
                                value={formData.titulo || ''}
                                onChange={(e) => updateField('titulo', e.target.value)}
                            />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="departamento" className="font-medium">Departamento</label>
                            <InputText
                                id="departamento"
                                value={formData.departamento || ''}
                                onChange={(e) => updateField('departamento', e.target.value)}
                            />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="contaId" className="font-medium">Empresa</label>
                            <AutoComplete
                                id="contaId"
                                value={contaSelecionada}
                                suggestions={contaSugestoes}
                                completeMethod={buscarContas}
                                field="nome"
                                onChange={(e) => {
                                    setContaSelecionada(e.value);
                                    if (e.value && typeof e.value === 'object') {
                                        updateField('contaId', e.value.id);
                                    } else {
                                        updateField('contaId', '');
                                    }
                                }}
                                onClear={() => { setContaSelecionada(null); updateField('contaId', ''); }}
                                placeholder="Digite para buscar empresa..."
                                dropdown
                                forceSelection
                                className="w-full"
                            />
                        </div>

                        <div className="field col-12">
                            <label htmlFor="descricao" className="font-medium">Descrição</label>
                            <InputTextarea
                                id="descricao"
                                value={formData.descricao || ''}
                                onChange={(e) => updateField('descricao', e.target.value)}
                                rows={3}
                                autoResize
                            />
                        </div>
                    </div>

                    <Divider />

                    {/* Contato */}
                    <h3 className="text-lg font-semibold mb-3">
                        <i className="pi pi-phone mr-2" />
                        Informações de Contato
                    </h3>
                    <div className="grid formgrid p-fluid">
                        <div className="field col-12 md:col-6">
                            <label htmlFor="email" className="font-medium">Email</label>
                            <InputText
                                id="email"
                                type="email"
                                value={formData.email || ''}
                                onChange={(e) => updateField('email', e.target.value)}
                                className={classNames({
                                    'p-invalid': submitted && formData.email && !isValidEmail(formData.email)
                                })}
                            />
                            {submitted && formData.email && !isValidEmail(formData.email) && (
                                <small className="p-error">Email inválido.</small>
                            )}
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="telefone" className="font-medium">Telefone</label>
                            <InputText
                                id="telefone"
                                value={formData.telefone || ''}
                                onChange={(e) => updateField('telefone', e.target.value)}
                            />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="celular" className="font-medium">Celular</label>
                            <InputText
                                id="celular"
                                value={formData.celular || ''}
                                onChange={(e) => updateField('celular', e.target.value)}
                            />
                        </div>
                    </div>

                    <Divider />

                    {/* Endereço */}
                    <h3 className="text-lg font-semibold mb-3">
                        <i className="pi pi-map-marker mr-2" />
                        Endereço
                    </h3>
                    <div className="grid formgrid p-fluid">
                        <div className="field col-12">
                            <label htmlFor="endereco" className="font-medium">Endereço</label>
                            <InputText
                                id="endereco"
                                value={formData.endereco || ''}
                                onChange={(e) => updateField('endereco', e.target.value)}
                            />
                        </div>
                        <div className="field col-12 md:col-4">
                            <label htmlFor="cidade" className="font-medium">Cidade</label>
                            <InputText
                                id="cidade"
                                value={formData.cidade || ''}
                                onChange={(e) => updateField('cidade', e.target.value)}
                            />
                        </div>
                        <div className="field col-12 md:col-4">
                            <label htmlFor="estado" className="font-medium">Estado</label>
                            <InputText
                                id="estado"
                                value={formData.estado || ''}
                                onChange={(e) => updateField('estado', e.target.value)}
                            />
                        </div>
                        <div className="field col-12 md:col-4">
                            <label htmlFor="cep" className="font-medium">CEP</label>
                            <InputText
                                id="cep"
                                value={formData.cep || ''}
                                onChange={(e) => updateField('cep', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <Divider />
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Cancelar"
                            icon="pi pi-times"
                            outlined
                            severity="secondary"
                            onClick={() => router.push(`/crm/contatos/${id}`)}
                        />
                        <Button
                            label="Salvar"
                            icon="pi pi-check"
                            severity="success"
                            loading={saving}
                            onClick={handleSave}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditarContatoPage;
