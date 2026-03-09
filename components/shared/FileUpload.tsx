'use client';
import React, { useRef, useState } from 'react';
import { FileUpload as PrimeFileUpload, FileUploadSelectEvent } from 'primereact/fileupload';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Image } from 'primereact/image';
import { ProgressBar } from 'primereact/progressbar';
import { Toast } from 'primereact/toast';
import { UploadService, UploadResponse, formatarTamanho, isImagem, TIPOS_ACEITOS } from '@/services/upload.service';

interface FileUploadComponentProps {
    /** Entidade à qual o arquivo pertence (ex: 'lead', 'conta') */
    entidade?: string;
    /** ID do registro da entidade */
    entidadeId?: number;
    /** Callback chamado após upload bem-sucedido */
    onUploadSuccess?: (arquivo: UploadResponse) => void;
    /** Tipos aceitos — padrão: todos */
    accept?: string;
    /** Máximo de arquivos por vez */
    maxFiles?: number;
    /** Tamanho máximo em bytes (padrão 5 MB) */
    maxSize?: number;
    /** Mostrar preview de imagens */
    showPreview?: boolean;
}

const FileUploadComponent: React.FC<FileUploadComponentProps> = ({
    entidade,
    entidadeId,
    onUploadSuccess,
    accept = TIPOS_ACEITOS.todos,
    maxFiles = 5,
    maxSize = 5 * 1024 * 1024,
    showPreview = true,
}) => {
    const toast = useRef<Toast>(null);
    const [uploading, setUploading] = useState(false);
    const [progresso, setProgresso] = useState(0);
    const [arquivosUploadados, setArquivosUploadados] = useState<UploadResponse[]>([]);
    const [previewFile, setPreviewFile] = useState<File | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const handleSelect = (e: FileUploadSelectEvent) => {
        const files = Array.from(e.files as FileList);
        setSelectedFiles(files);
        if (showPreview && files.length > 0 && isImagem(files[0].type)) {
            setPreviewFile(files[0]);
        } else {
            setPreviewFile(null);
        }
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;
        setUploading(true);
        setProgresso(10);
        try {
            const results: UploadResponse[] = [];
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                if (file.size > maxSize) {
                    toast.current?.show({ severity: 'warn', summary: 'Arquivo muito grande', detail: `${file.name} excede ${formatarTamanho(maxSize)}`, life: 3000 });
                    continue;
                }
                const result = await UploadService.upload(file, entidade, entidadeId);
                results.push(result);
                setProgresso(Math.round(((i + 1) / selectedFiles.length) * 90));
                onUploadSuccess?.(result);
            }
            setArquivosUploadados(prev => [...prev, ...results]);
            setSelectedFiles([]);
            setPreviewFile(null);
            setProgresso(100);
            toast.current?.show({ severity: 'success', summary: 'Upload concluído', detail: `${results.length} arquivo(s) enviado(s)`, life: 3000 });
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro no upload', detail: 'Não foi possível enviar o arquivo.', life: 3000 });
        } finally {
            setTimeout(() => { setUploading(false); setProgresso(0); }, 600);
        }
    };

    const handleExcluir = async (id: number) => {
        try {
            await UploadService.excluir(id);
            setArquivosUploadados(prev => prev.filter(a => a.id !== id));
            toast.current?.show({ severity: 'success', summary: 'Arquivo excluído', life: 2000 });
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro ao excluir', life: 2000 });
        }
    };

    return (
        <div>
            <Toast ref={toast} />

            <PrimeFileUpload
                mode="basic"
                multiple={maxFiles > 1}
                accept={accept}
                maxFileSize={maxSize}
                onSelect={handleSelect}
                chooseLabel="Selecionar arquivo(s)"
                auto={false}
                customUpload
                disabled={uploading}
            />

            {selectedFiles.length > 0 && (
                <div className="mt-2">
                    <ul className="list-none p-0 m-0 flex flex-column gap-1">
                        {selectedFiles.map((f, i) => (
                            <li key={i} className="flex align-items-center gap-2 surface-100 border-round px-2 py-1">
                                <i className={isImagem(f.type) ? 'pi pi-image text-blue-500' : 'pi pi-file text-gray-500'} />
                                <span className="text-sm flex-1 text-overflow-ellipsis overflow-hidden white-space-nowrap">{f.name}</span>
                                <Tag value={formatarTamanho(f.size)} severity="info" className="text-xs" />
                            </li>
                        ))}
                    </ul>

                    {showPreview && previewFile && (
                        <div className="mt-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={URL.createObjectURL(previewFile)} alt="preview" className="border-round" style={{ maxHeight: '120px', maxWidth: '100%', objectFit: 'contain' }} />
                        </div>
                    )}

                    {uploading && <ProgressBar value={progresso} className="mt-2" style={{ height: '6px' }} />}

                    <Button
                        label="Enviar"
                        icon="pi pi-upload"
                        className="mt-2 p-button-sm"
                        loading={uploading}
                        onClick={handleUpload}
                    />
                </div>
            )}

            {arquivosUploadados.length > 0 && (
                <div className="mt-3">
                    <p className="text-sm font-semibold mb-1">Arquivos enviados:</p>
                    <ul className="list-none p-0 m-0 flex flex-column gap-1">
                        {arquivosUploadados.map(a => (
                            <li key={a.id} className="flex align-items-center gap-2 surface-50 border-1 surface-border border-round px-2 py-1">
                                {showPreview && isImagem(a.tipo) ? (
                                    <Image src={UploadService.getUrlDownload(a.nomeArquivo)} alt={a.nomeOriginal} width="32" height="32" className="border-round" preview />
                                ) : (
                                    <i className="pi pi-file-pdf text-red-400" />
                                )}
                                <span className="text-sm flex-1 text-overflow-ellipsis overflow-hidden white-space-nowrap">{a.nomeOriginal}</span>
                                <Tag value={formatarTamanho(a.tamanho)} severity="secondary" className="text-xs" />
                                <Button icon="pi pi-trash" className="p-button-text p-button-danger p-button-sm" onClick={() => handleExcluir(a.id)} tooltip="Excluir" tooltipOptions={{ position: 'top' }} />
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default FileUploadComponent;
