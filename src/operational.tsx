import { useMemo, useState } from 'react';
import html2pdf from 'html2pdf.js';
import { Camera, Image as ImageIcon, PackagePlus, Plus, Printer, Trash2 } from 'lucide-react';
import { useSupabaseTable } from './hooks/useSupabaseTable';
import { canEdit, useAuth } from './auth';
import { Actions, Empty, Field, Metric, Modal, Status, formatDate, uid } from './components/shared';
import { supabase } from './lib/supabase';
import { fvsNormativeRefs } from './normative-refs';

export const materialTypes = ['Cimento','Agregados','Aço para armaduras','Concreto usinado','Blocos/tijolos','Argamassas industrializadas','Tubos e conexões de água','Tubos e conexões de esgoto/pluvial','Fios e cabos elétricos','Eletrodutos e caixas','Disjuntores, DR e DPS','Telhas e acessórios','Madeira/estrutura da cobertura','Impermeabilizantes','Revestimentos cerâmicos','Argamassa colante e rejunte','Esquadrias','Vidros','Tintas, seladores e massas','Louças sanitárias','Metais e válvulas','Reservatório de água','Pré-moldados','Pisos táteis/acessibilidade','Selantes e fixadores'];
export const fvsTemplates = ['Locação da obra e gabarito','Escavação e preparo de fundações','Fundações e baldrames','Impermeabilização de baldrames','Estrutura de concreto','Alvenaria de vedação','Chapisco, emboço e reboco','Contrapiso e regularização','Impermeabilização de áreas molhadas','Revestimento cerâmico','Esquadrias, vidros e ferragens','Estrutura e cobertura','Forros','Água fria e reservação','Esgoto sanitário e ventilação','Águas pluviais e drenagem externa','Infraestrutura elétrica embutida','Fiação, quadros e testes elétricos','Louças, metais e acessórios','Pintura interna e externa','Calçadas, passeios e acessibilidade','Urbanização, cercas e muros','Testes finais e comissionamento','Inspeção final e entrega da unidade'];
const checks = ['Projeto e revisão vigentes confirmados','Etapa anterior inspecionada e liberada','Materiais aprovados e rastreáveis','Equipe treinada e procedimento disponível','Dimensões e cotas verificadas','Nível, prumo, alinhamento ou caimento conferidos','Tolerâncias do projeto/procedimento atendidas','Execução e acabamento sem defeitos aparentes','Ensaios ou testes previstos realizados','Instrumento de medição identificado e válido','Medições e evidências fotográficas registradas','Área limpa, protegida e liberada para a próxima etapa'];

const materialChecks = ['Nota fiscal / pedido de compra apresentado', 'Fabricante identificado', 'Lote e validade legíveis e dentro do prazo', 'Identificação/etiqueta conforme especificação', 'Integridade da embalagem/peça (sem avarias)', 'Dimensões e aspecto visual conforme projeto/especificação', 'Certificado de ensaio/conformidade (quando aplicável)', 'Condição de armazenamento adequada'];

export type Material = { id: string; type: string; supplier: string; lot: string; invoice: string; quantity: string; received: string; responsible: string; status: string; notes: string; answers: Answer[]; user_id?: string };
export type Answer = { result: 'C' | 'NC' | 'NA' | ''; evidence: string; photoPath?: string; photoUrl?: string; photoName?: string };
export type Inspection = { id: string; code: string; service: string; unit: string; environment: string; date: string; project: string; procedure: string; team: string; inspector: string; answers: Answer[]; general: string; notes: string; created_by?: string; user_id?: string };

const blankMaterial = (): Omit<Material, 'id'> => ({
  type: materialTypes[0],
  supplier: '',
  lot: '',
  invoice: '',
  quantity: '',
  received: new Date().toISOString().slice(0, 10),
  responsible: '',
  status: 'Em análise',
  notes: '',
  answers: materialChecks.map(() => ({ result: '', evidence: '' })),
});

export function MaterialsOperational() {
  const { records, loading, create, update, remove } = useSupabaseTable<Material>('materials');
  const { session, role } = useAuth();
  const [editing, setEditing] = useState<(Material & { _isNew?: boolean }) | null>(null);
  const [saving, setSaving] = useState(false);
  const open = () => setEditing({ id: uid(), _isNew: true, ...blankMaterial() });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    const nc = editing.answers.some((a) => a.result === 'NC');
    const pending = editing.answers.some((a) => !a.result);
    const { id, _isNew, ...rest } = editing;
    const payload = { ...rest, status: nc ? 'Quarentena' : pending ? 'Em análise' : 'Aprovado' };
    if (_isNew) await create(payload);
    else await update(id, payload);
    setSaving(false);
    setEditing(null);
  };

  return (
    <div className="page operational">
      <div className="title-row">
        <div>
          <small className="eyebrow">FICHA DE VERIFICAÇÃO DE MATERIAL (FVM)</small>
          <h1>Materiais controlados</h1>
          <p>Verificações mínimas no recebimento — vira quarentena automática se houver item NC.</p>
        </div>
        <button className="primary" onClick={open}>
          <PackagePlus size={17} />
          Novo recebimento
        </button>
      </div>
      <div className="metrics compact">
        <Metric a="Grupos controlados" b="25" />
        <Metric a="Recebimentos" b={String(records.length)} />
        <Metric a="Aprovados" b={String(records.filter((x) => x.status === 'Aprovado').length)} />
        <Metric a="Em quarentena" b={String(records.filter((x) => x.status === 'Quarentena').length)} />
      </div>
      <div className="panel table op-table">
        <table>
          <thead>
            <tr><th>Material</th><th>Fornecedor / lote</th><th>NF / quantidade</th><th>Recebimento</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6}>Carregando...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={6}><Empty text="Nenhum recebimento registrado." action={open} /></td></tr>
            ) : (
              records.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.type}</strong></td>
                  <td>{r.supplier}<small>{r.lot}</small></td>
                  <td>{r.invoice}<small>{r.quantity}</small></td>
                  <td>{formatDate(r.received)}</td>
                  <td><Status v={r.status} /></td>
                  <td className="row-actions">
                    {canEdit(role, session.user.id, r.user_id) ? (
                      <>
                        <button onClick={() => setEditing(r)}>Abrir</button>
                        <button aria-label="Excluir" onClick={() => confirm('Excluir este recebimento?') && remove(r.id)}>
                          <Trash2 size={15} />
                        </button>
                      </>
                    ) : (
                      <small className="readonly-tag">Somente leitura</small>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {editing && (
        <Modal title={`FVM — ${editing.type}`} close={() => setEditing(null)} wide>
          <form onSubmit={save} className="op-form">
            <Field label="Material controlado">
              <select value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })}>
                {materialTypes.map((x) => <option key={x}>{x}</option>)}
              </select>
            </Field>
            <div className="form-grid">
              <Field label="Fornecedor"><input required value={editing.supplier} onChange={(e) => setEditing({ ...editing, supplier: e.target.value })} /></Field>
              <Field label="Lote / validade"><input required value={editing.lot} onChange={(e) => setEditing({ ...editing, lot: e.target.value })} /></Field>
              <Field label="Nota fiscal / pedido"><input value={editing.invoice} onChange={(e) => setEditing({ ...editing, invoice: e.target.value })} /></Field>
              <Field label="Quantidade"><input required value={editing.quantity} onChange={(e) => setEditing({ ...editing, quantity: e.target.value })} /></Field>
              <Field label="Data do recebimento"><input type="date" value={editing.received} onChange={(e) => setEditing({ ...editing, received: e.target.value })} /></Field>
              <Field label="Responsável pelo recebimento"><input value={editing.responsible} onChange={(e) => setEditing({ ...editing, responsible: e.target.value })} /></Field>
            </div>
            <div className="check-head">
              <b>Verificações mínimas no recebimento</b>
              <span>{editing.answers.filter((a) => a.result).length} de {materialChecks.length} preenchidos</span>
            </div>
            <div className="checklist">
              {materialChecks.map((check, i) => (
                <div className="check-item" key={check}>
                  <b>{i + 1}</b>
                  <div>
                    <strong>{check}</strong>
                    <input
                      placeholder="Evidência / observação"
                      value={editing.answers[i].evidence}
                      onChange={(e) => {
                        const a = [...editing.answers];
                        a[i] = { ...a[i], evidence: e.target.value };
                        setEditing({ ...editing, answers: a });
                      }}
                    />
                  </div>
                  <div className="result-buttons">
                    {(['C', 'NC', 'NA'] as const).map((v) => (
                      <button
                        type="button"
                        className={editing.answers[i].result === v ? 'selected' : ''}
                        key={v}
                        onClick={() => {
                          const a = [...editing.answers];
                          a[i] = { ...a[i], result: v };
                          setEditing({ ...editing, answers: a });
                        }}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {editing.answers.some((a) => a.result === 'NC') && (
              <p className="readonly-banner" style={{ background: '#fbe9e7', color: '#a13a2e', borderColor: '#f0c4bb' }}>
                ⚠ Item(ns) não conforme(s) — este material será registrado automaticamente em <strong>Quarentena</strong> e não deve ser aplicado na obra até liberação.
              </p>
            )}
            <Field label="Observações">
              <textarea placeholder="Detalhes adicionais, tratativa com fornecedor, RNC aberta..." value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} />
            </Field>
            <Actions cancel={() => setEditing(null)} disabled={saving} />
          </form>
        </Modal>
      )}
    </div>
  );
}

const blankInspection = (): Omit<Inspection, 'id'> => ({
  code: 'FVS-01',
  service: fvsTemplates[0],
  unit: '',
  environment: '',
  date: new Date().toISOString().slice(0, 10),
  project: '',
  procedure: '',
  team: '',
  inspector: '',
  answers: checks.map(() => ({ result: '', evidence: '' })),
  general: 'Em andamento',
  notes: '',
});

export function FvsOperational() {
  const { records, loading, create, update, remove } = useSupabaseTable<Inspection>('inspections');
  const { session, role } = useAuth();
  const [editing, setEditing] = useState<(Inspection & { _isNew?: boolean }) | null>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('');
  const [uploading, setUploading] = useState<number | null>(null);
  const [driveStatus, setDriveStatus] = useState('');
  const open = () => setEditing({ id: uid(), _isNew: true, ...blankInspection() });
  const template = (i: number) => setEditing((v) => (v ? { ...v, code: `FVS-${String(i + 1).padStart(2, '0')}`, service: fvsTemplates[i] } : v));

  const openRecord = async (record: Inspection) => {
    const answers = await Promise.all((record.answers ?? []).map(async (answer) => {
      if (!answer.photoPath) return answer;
      const { data } = await supabase.storage.from('inspection-photos').createSignedUrl(answer.photoPath, 3600);
      return { ...answer, photoUrl: data?.signedUrl };
    }));
    setEditing({ ...record, answers });
  };

  const uploadPhoto = async (file: File, item: number) => {
    if (!editing) return;
    if (file.size > 10 * 1024 * 1024) return alert('A foto deve ter no máximo 10 MB.');
    setUploading(item);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { setUploading(null); return alert('Sessão expirada. Entre novamente.'); }
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const path = `${auth.user.id}/${editing.id}/item-${item + 1}-${Date.now()}-${safe}`;
    const { error } = await supabase.storage.from('inspection-photos').upload(path, file, { contentType: file.type, upsert: false });
    if (error) { setUploading(null); return alert(`Não foi possível enviar a foto: ${error.message}`); }
    const { data } = await supabase.storage.from('inspection-photos').createSignedUrl(path, 3600);
    const answers = [...editing.answers];
    answers[item] = { ...answers[item], photoPath: path, photoUrl: data?.signedUrl, photoName: file.name };
    setEditing({ ...editing, answers });
    setUploading(null);
  };

  const removePhoto = async (item: number) => {
    if (!editing) return;
    const current = editing.answers[item];
    if (current.photoPath) await supabase.storage.from('inspection-photos').remove([current.photoPath]);
    const answers = [...editing.answers];
    answers[item] = { result: current.result, evidence: current.evidence };
    setEditing({ ...editing, answers });
  };

  const sendToDrive = async (record: Inspection) => {
    const element = document.querySelector<HTMLElement>('.op-modal.wide');
    if (!element) return;
    setDriveStatus('Gerando PDF...');
    try {
      const filenameBase = `FVS ${record.code} - ${record.unit || 'sem unidade'}`.replace(/[/\\?%*:|"<>]/g, '-');
      const worker = html2pdf()
        .set({
          margin: 6,
          filename: `${filenameBase}.pdf`,
          image: { type: 'jpeg', quality: 0.92 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            onclone: (clonedDoc: Document) => {
              clonedDoc
                .querySelectorAll('.print-actions, .modal-title button, .photo-button, .result-buttons button:not(.selected)')
                .forEach((el) => {
                  (el as HTMLElement).style.display = 'none';
                });
            },
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'legacy'] },
        })
        .from(element);
      const dataUri = await worker.outputPdf('datauristring');
      const base64 = dataUri.split(',')[1];

      setDriveStatus('Enviando para o Drive...');
      const response = await fetch('/api/upload-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: `${filenameBase} - ${Date.now()}.pdf`, base64 }),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json.error || 'Falha ao enviar para o Drive.');
      setDriveStatus('Enviado ao Drive ✓');
    } catch (err) {
      console.error('Erro ao enviar FVS para o Drive:', err);
      setDriveStatus('Não foi possível enviar ao Drive. O PDF local ainda funciona normalmente.');
    } finally {
      setTimeout(() => setDriveStatus(''), 6000);
    }
  };

  const printWithPhotos = async () => {
    if (!editing) return;
    const answers = await Promise.all(editing.answers.map(async (answer) => {
      if (!answer.photoUrl || answer.photoUrl.startsWith('data:')) return answer;
      try {
        const response = await fetch(answer.photoUrl);
        if (!response.ok) return answer;
        const blob = await response.blob();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(blob);
        });
        return { ...answer, photoUrl: dataUrl };
      } catch {
        return answer;
      }
    }));
    setEditing({ ...editing, answers });
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    const images = Array.from(document.querySelectorAll<HTMLImageElement>('.photo-preview img'));
    await Promise.all(images.map((image) => image.complete ? image.decode().catch(() => undefined) : new Promise<void>((resolve) => {
      image.addEventListener('load', () => resolve(), { once: true });
      image.addEventListener('error', () => resolve(), { once: true });
    })));
    window.print();
    void sendToDrive(editing);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    const nc = editing.answers.some((a) => a.result === 'NC');
    const pending = editing.answers.some((a) => !a.result);
    const { id, _isNew, ...rest } = editing;
    const answers = rest.answers.map(({ photoUrl: _temporaryUrl, ...answer }) => answer);
    const payload = { ...rest, answers, general: pending ? 'Em andamento' : nc ? 'Reprovado' : 'Aprovado' };
    if (_isNew) await create(payload);
    else await update(id, payload);
    setSaving(false);
    setEditing(null);
  };

  const shown = useMemo(
    () => records.filter((r) => `${r.code} ${r.service} ${r.unit}`.toLowerCase().includes(filter.toLowerCase())),
    [records, filter],
  );

  return (
    <div className="page operational">
      <div className="title-row">
        <div>
          <small className="eyebrow">FICHAS DE VERIFICAÇÃO DE SERVIÇO</small>
          <h1>Inspeções de serviços</h1>
          <p>Preencha C, NC ou NA e registre a evidência de cada item.</p>
        </div>
        <button className="primary" onClick={open}>
          <Plus size={17} />
          Nova inspeção
        </button>
      </div>
      <div className="metrics compact">
        <Metric a="Modelos de FVS" b="24" />
        <Metric a="Inspeções" b={String(records.length)} />
        <Metric a="Aprovadas" b={String(records.filter((x) => x.general === 'Aprovado').length)} />
        <Metric a="Com NC" b={String(records.filter((x) => x.general === 'Reprovado').length)} />
      </div>
      <div className="toolbar op-search">
        <label><input placeholder="Buscar FVS, serviço ou unidade..." value={filter} onChange={(e) => setFilter(e.target.value)} /></label>
      </div>
      <div className="panel table op-table">
        <table>
          <thead>
            <tr><th>FVS / serviço</th><th>Unidade / ambiente</th><th>Data</th><th>Inspetor</th><th>Resultado</th><th></th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6}>Carregando...</td></tr>
            ) : shown.length === 0 ? (
              <tr><td colSpan={6}><Empty text="Nenhuma inspeção registrada." action={open} /></td></tr>
            ) : (
              shown.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.code}</strong><small>{r.service}</small></td>
                  <td>{r.unit}<small>{r.environment}</small></td>
                  <td>{formatDate(r.date)}</td>
                  <td>{r.inspector}</td>
                  <td><Status v={r.general} /></td>
                  <td className="row-actions">
                    <button onClick={() => openRecord(r)}>Abrir</button>
                    {canEdit(role, session.user.id, r.user_id) && (
                      <button aria-label="Excluir" onClick={() => confirm('Excluir esta inspeção?') && remove(r.id)}>
                        <Trash2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {editing && (
        <Modal title={`${editing.code} — ${editing.service}`} close={() => setEditing(null)} wide>
          <form onSubmit={save} className="op-form">
            {!editing._isNew && !canEdit(role, session.user.id, editing.user_id) && (
              <p className="readonly-banner">
                Modo somente leitura — este registro foi criado por outro colaborador. Você pode ver e imprimir, mas não editar.
              </p>
            )}
            <fieldset disabled={!editing._isNew && !canEdit(role, session.user.id, editing.user_id)} style={{ border: 0, padding: 0, margin: 0 }}>
            <div className="print-identification">
              <div><small>Empresa / CNPJ</small><strong>GLAUCIO ALMEIDA DE ANDRADE LTDA — 24.763.309/0001-00</strong></div>
              <div><small>Obra</small><strong>RESIDENCIAL RES. MARIA DO CARMO</strong></div>
              <div><small>Endereço</small><strong>PE-109 KM 08, ALTO BONITO/PE</strong></div>
              <div><small>ART / Responsável técnico</small><strong>PE20261586920 — FÁBIO LUIZ GODOY DO AMARAL</strong></div>
            </div>
            <Field label="Modelo de FVS">
              <select value={Number(editing.code.slice(4)) - 1} onChange={(e) => template(Number(e.target.value))}>
                {fvsTemplates.map((x, i) => <option value={i} key={x}>FVS-{String(i + 1).padStart(2, '0')} — {x}</option>)}
              </select>
            </Field>
            <div className="form-grid">
              <Field label="Unidade / frente"><input required value={editing.unit} onChange={(e) => setEditing({ ...editing, unit: e.target.value })} placeholder="Ex.: UH-C3" /></Field>
              <Field label="Local / ambiente"><input required value={editing.environment} onChange={(e) => setEditing({ ...editing, environment: e.target.value })} placeholder="Ex.: Banheiro" /></Field>
              <Field label="Data"><input type="date" required value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} /></Field>
              <Field label="Inspetor"><input required value={editing.inspector} onChange={(e) => setEditing({ ...editing, inspector: e.target.value })} /></Field>
              <Field label="Projeto / revisão"><input value={editing.project} onChange={(e) => setEditing({ ...editing, project: e.target.value })} /></Field>
              <Field label="Procedimento"><input value={editing.procedure} onChange={(e) => setEditing({ ...editing, procedure: e.target.value })} /></Field>
            </div>
            <Field label="Equipe / executor"><input value={editing.team} onChange={(e) => setEditing({ ...editing, team: e.target.value })} /></Field>
            {(() => {
              const ref = fvsNormativeRefs[Number(editing.code.slice(4)) - 1];
              if (!ref) return null;
              return (
                <div className="normative-box">
                  <strong>Referência normativa e tolerância</strong>
                  <ul>
                    {ref.standards.map((s) => <li key={s}>{s}</li>)}
                  </ul>
                  <p>{ref.tolerance}</p>
                  <small>Complementa o critério de aceitação do projeto/procedimento executivo — não substitui exigência específica de projeto.</small>
                </div>
              );
            })()}
            <div className="check-head">
              <b>Itens de verificação</b>
              <span>{editing.answers.filter((a) => a.result).length} de {checks.length} preenchidos</span>
            </div>
            <div className="checklist">
              {checks.map((check, i) => (
                <div className="check-item" key={check}>
                  <b>{i + 1}</b>
                  <div>
                    <strong>{check}</strong>
                    <small>Critério: projeto, procedimento, fabricante e norma aplicável.</small>
                    <input
                      placeholder="Resultado medido / evidência / observação"
                      value={editing.answers[i].evidence}
                      onChange={(e) => {
                        const a = [...editing.answers];
                        a[i] = { ...a[i], evidence: e.target.value };
                        setEditing({ ...editing, answers: a });
                      }}
                    />
                    <div className="photo-control">
                      {editing.answers[i].photoUrl ? <div className="photo-preview"><img src={editing.answers[i].photoUrl} alt={`Evidência do item ${i + 1}`} /><span><ImageIcon size={14}/>{editing.answers[i].photoName || 'Foto anexada'}</span><button type="button" onClick={() => removePhoto(i)}>Remover</button></div> : <label className="photo-button"><Camera size={15}/>{uploading === i ? 'Enviando...' : 'Tirar ou anexar foto'}<input type="file" accept="image/*" capture="environment" disabled={uploading === i} onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0], i)} /></label>}
                    </div>
                  </div>
                  <div className="result-buttons">
                    {(['C', 'NC', 'NA'] as const).map((v) => (
                      <button
                        type="button"
                        className={editing.answers[i].result === v ? 'selected' : ''}
                        key={v}
                        onClick={() => {
                          const a = [...editing.answers];
                          a[i] = { ...a[i], result: v };
                          setEditing({ ...editing, answers: a });
                        }}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <Field label="Pendência, RNC, correção ou reinspeção">
              <textarea value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} />
            </Field>
            </fieldset>
            <div className="print-actions">
              <button type="button" className="print-button" onClick={printWithPhotos}><Printer size={16}/>Imprimir / Salvar PDF</button>
              {driveStatus && <span className="drive-status">{driveStatus}</span>}
              {(editing._isNew || canEdit(role, session.user.id, editing.user_id)) && (
                <Actions cancel={() => setEditing(null)} label="Salvar inspeção" disabled={saving || uploading !== null} />
              )}
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
