'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { Card } from 'primereact/card';
import { FullCalendar } from 'primereact/fullcalendar';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { EventoService, EventoRequestDTO, EventoResponseDTO, TIPO_STATUS_EVENTO_OPTIONS } from '@/services/evento.service';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';

const CalendarioPage = () => {
    const toast = useRef<Toast>(null);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form dialog
    const [formVisible, setFormVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [form, setForm] = useState<EventoRequestDTO>({ nome: '', tipoStatusAtividade: 'Planned' });

    const STATUS_COLOR: Record<string, string> = {
        Planned: '#3B82F6',
        Held: '#22C55E',
        'Not Held': '#EF4444'
    };

    const fetchEventos = async () => {
        setLoading(true);
        try {
            const response = await EventoService.listarPaginado({ page: 0, size: 200 });
            const mapped = response.content.map((e: EventoResponseDTO) => ({
                id: e.id,
                title: e.nome,
                start: e.dataInicio,
                end: e.dataFim,
                backgroundColor: STATUS_COLOR[e.tipoStatusAtividade ?? 'Planned'],
                borderColor: STATUS_COLOR[e.tipoStatusAtividade ?? 'Planned'],
                extendedProps: { ...e }
            }));
            setEvents(mapped);
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar eventos', life: 5000 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEventos(); }, []);

    const update = (field: keyof EventoRequestDTO, value: any) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const openNew = (dateStr?: string) => {
        setEditingId(null);
        setForm({
            nome: '',
            tipoStatusAtividade: 'Planned',
            dataInicio: dateStr ? new Date(dateStr).toISOString() : undefined
        });
        setFormVisible(true);
    };

    const openEdit = (event: any) => {
        const e: EventoResponseDTO = event.extendedProps;
        setEditingId(e.id);
        setForm({
            nome: e.nome,
            descricao: e.descricao,
            tipoStatusAtividade: e.tipoStatusAtividade,
            dataInicio: e.dataInicio,
            dataFim: e.dataFim,
            link: e.link,
            duracaoMinutos: e.duracaoMinutos
        });
        setFormVisible(true);
    };

    const handleSave = async () => {
        if (!form.nome?.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'O nome do evento é obrigatório.', life: 4000 });
            return;
        }
        setSaving(true);
        try {
            if (editingId) {
                await EventoService.atualizar(editingId, form);
                toast.current?.show({ severity: 'success', summary: 'Atualizado', detail: 'Evento atualizado!', life: 3000 });
            } else {
                await EventoService.criar(form);
                toast.current?.show({ severity: 'success', summary: 'Criado', detail: 'Evento criado!', life: 3000 });
            }
            setFormVisible(false);
            fetchEventos();
        } catch (err: any) {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: err?.response?.data?.message ?? 'Erro ao salvar.', life: 5000 });
        } finally {
            setSaving(false);
        }
    };

    const calendarOptions = {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        locale: ptBrLocale,
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events,
        editable: true,
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        dateClick: (info: any) => openNew(info.dateStr),
        eventClick: (info: any) => openEdit(info.event),
        height: 680
    };

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <div className="card">
                    <Toolbar className="mb-4"
                        start={
                            <div className="flex align-items-center gap-3">
                                <i className="pi pi-calendar text-2xl text-primary" />
                                <div>
                                    <h5 className="m-0 text-xl font-bold">Calendário</h5>
                                    <span className="text-500 text-sm">Visualize e gerencie todos os eventos da agenda</span>
                                </div>
                            </div>
                        }
                        end={
                            <div className="flex align-items-center gap-3">
                                <div className="flex align-items-center gap-2">
                                    <span className="w-1rem h-1rem border-round" style={{ background: '#3B82F6', display: 'inline-block' }} />
                                    <span className="text-sm">Planejado</span>
                                    <span className="w-1rem h-1rem border-round ml-2" style={{ background: '#22C55E', display: 'inline-block' }} />
                                    <span className="text-sm">Realizado</span>
                                    <span className="w-1rem h-1rem border-round ml-2" style={{ background: '#EF4444', display: 'inline-block' }} />
                                    <span className="text-sm">Não realizado</span>
                                </div>
                                <Button label="Novo Evento" icon="pi pi-plus" className="p-button-success ml-3" onClick={() => openNew()} />
                            </div>
                        }
                    />
                    <FullCalendar options={calendarOptions} />
                </div>
            </div>

            {/* Form Dialog */}
            <Dialog visible={formVisible} style={{ width: '560px' }} header={editingId ? 'Editar Evento' : 'Novo Evento'}
                modal onHide={() => setFormVisible(false)}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={() => setFormVisible(false)} disabled={saving} />
                        <Button label="Salvar" icon="pi pi-save" onClick={handleSave} loading={saving} className="p-button-success" />
                    </div>
                }>
                <div className="grid formgrid pt-2">
                    <div className="field col-12 md:col-8">
                        <label className="font-semibold">Nome <span className="text-red-500">*</span></label>
                        <InputText value={form.nome} onChange={e => update('nome', e.target.value)} className="w-full" placeholder="Nome do evento" autoFocus />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label className="font-semibold">Status</label>
                        <Dropdown value={form.tipoStatusAtividade} options={TIPO_STATUS_EVENTO_OPTIONS}
                            onChange={e => update('tipoStatusAtividade', e.value)} className="w-full" />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label className="font-semibold">Data/Hora Início</label>
                        <Calendar value={form.dataInicio ? new Date(form.dataInicio) : null}
                            onChange={e => update('dataInicio', e.value ? (e.value as Date).toISOString() : undefined)}
                            showTime hourFormat="24" dateFormat="dd/mm/yy" className="w-full" placeholder="Início" />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label className="font-semibold">Data/Hora Fim</label>
                        <Calendar value={form.dataFim ? new Date(form.dataFim) : null}
                            onChange={e => update('dataFim', e.value ? (e.value as Date).toISOString() : undefined)}
                            showTime hourFormat="24" dateFormat="dd/mm/yy" className="w-full" placeholder="Fim" />
                    </div>
                    <div className="field col-12">
                        <label className="font-semibold">Link</label>
                        <InputText value={form.link ?? ''} onChange={e => update('link', e.target.value)} className="w-full" placeholder="https://..." />
                    </div>
                    <div className="field col-12">
                        <label className="font-semibold">Descrição</label>
                        <InputTextarea value={form.descricao ?? ''} onChange={e => update('descricao', e.target.value)} rows={3} className="w-full" autoResize />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default CalendarioPage;
