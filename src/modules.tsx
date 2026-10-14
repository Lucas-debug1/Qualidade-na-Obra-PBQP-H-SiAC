import { CrudModule } from './components/CrudModule';
import type { Record0 } from './components/CrudModule';

let ncSeq = 30;
export function NonConformitiesPage() {
  return (
    <CrudModule
      table="non_conformities"
      eyebrow="TRATAMENTO DE NÃO CONFORMIDADES"
      title="Não conformidades"
      description="Registre, classifique e acompanhe o tratamento de cada NC."
      addLabel="Nova NC"
      emptyText="Nenhuma não conformidade registrada."
      modalTitle={(_e, isNew) => (isNew ? 'Nova não conformidade' : 'Editar não conformidade')}
      fields={[
        { key: 'code', label: 'Código', type: 'text', required: true, placeholder: `NC-${String(++ncSeq).padStart(3, '0')}` },
        { key: 'description', label: 'Descrição', type: 'text', required: true, placeholder: 'Ex.: Caimento insuficiente no box' },
        { key: 'location', label: 'Local / referência', type: 'text', placeholder: 'Ex.: UH-C3 • Banheiro' },
        { key: 'severity', label: 'Severidade', type: 'select', options: ['Baixa', 'Média', 'Crítica'] },
        { key: 'status', label: 'Status', type: 'select', options: ['Aberta', 'Em tratamento', 'Concluída'] },
        { key: 'date', label: 'Data', type: 'date' },
        { key: 'treatment', label: 'Ação de tratamento / correção', type: 'textarea', placeholder: 'Causa raiz, correção e responsável...' },
      ]}
      columns={[
        { key: 'code', header: 'Código', secondaryKey: 'description' },
        { key: 'location', header: 'Local' },
        { key: 'severity', header: 'Severidade', isStatus: true },
        { key: 'status', header: 'Status', isStatus: true },
        { key: 'date', header: 'Data', isDate: true },
      ]}
      metrics={(records: Record0[]) => [
        { a: 'Total de NC', b: String(records.length) },
        { a: 'Críticas', b: String(records.filter((r) => r.severity === 'Crítica').length) },
        { a: 'Abertas', b: String(records.filter((r) => r.status === 'Aberta').length) },
        { a: 'Concluídas', b: String(records.filter((r) => r.status === 'Concluída').length) },
      ]}
    />
  );
}

export function AuditsPage() {
  return (
    <CrudModule
      table="audit_items"
      eyebrow="PRONTIDÃO PARA AUDITORIA SiAC"
      title="Auditorias"
      description="Checklist de prontidão e itens verificados na auditoria interna/externa."
      addLabel="Novo item"
      emptyText="Nenhum item de auditoria registrado."
      modalTitle={(_e, isNew) => (isNew ? 'Novo item de auditoria' : 'Editar item de auditoria')}
      fields={[
        { key: 'item', label: 'Item verificado', type: 'text', required: true, placeholder: 'Ex.: Controle de documentos' },
        { key: 'category', label: 'Categoria / requisito SiAC', type: 'text', placeholder: 'Ex.: 4.2 Documentação' },
        { key: 'status', label: 'Situação', type: 'select', options: ['Conforme', 'Atenção', 'Não conforme'] },
        { key: 'score', label: 'Aderência (%)', type: 'text', placeholder: 'Ex.: 92%' },
        { key: 'responsible', label: 'Responsável', type: 'text' },
        { key: 'date', label: 'Data da verificação', type: 'date' },
        { key: 'notes', label: 'Observações', type: 'textarea' },
      ]}
      columns={[
        { key: 'item', header: 'Item', secondaryKey: 'category' },
        { key: 'responsible', header: 'Responsável' },
        { key: 'score', header: 'Aderência' },
        { key: 'status', header: 'Situação', isStatus: true },
        { key: 'date', header: 'Data', isDate: true },
      ]}
      metrics={(records: Record0[]) => [
        { a: 'Itens verificados', b: String(records.length) },
        { a: 'Conformes', b: String(records.filter((r) => r.status === 'Conforme').length) },
        { a: 'Em atenção', b: String(records.filter((r) => r.status === 'Atenção').length) },
        { a: 'Não conformes', b: String(records.filter((r) => r.status === 'Não conforme').length) },
      ]}
    />
  );
}

export function ProcessesPage() {
  return (
    <CrudModule
      table="processes"
      eyebrow="GESTÃO DE PROCESSOS"
      title="Processos"
      description="Acompanhe a eficácia de cada processo do SGQ e seus indicadores."
      addLabel="Novo processo"
      emptyText="Nenhum processo cadastrado."
      modalTitle={(_e, isNew) => (isNew ? 'Novo processo' : 'Editar processo')}
      fields={[
        { key: 'name', label: 'Processo', type: 'text', required: true, placeholder: 'Ex.: Execução de obra' },
        { key: 'responsible', label: 'Responsável', type: 'text' },
        { key: 'effectiveness', label: 'Eficácia (%)', type: 'text', placeholder: 'Ex.: 92%' },
        { key: 'indicators', label: 'Indicadores monitorados', type: 'text', placeholder: 'Ex.: Prazo, retrabalho, NC' },
        { key: 'notes', label: 'Observações', type: 'textarea' },
      ]}
      columns={[
        { key: 'name', header: 'Processo', secondaryKey: 'indicators' },
        { key: 'responsible', header: 'Responsável' },
        { key: 'effectiveness', header: 'Eficácia' },
      ]}
      metrics={(records: Record0[]) => [
        { a: 'Processos', b: String(records.length) },
        {
          a: 'Eficácia média',
          b: records.length
            ? `${Math.round(
                records.reduce((s, r) => s + (parseFloat(String(r.effectiveness ?? '0')) || 0), 0) / records.length,
              )}%`
            : '—',
        },
      ]}
    />
  );
}

export function RisksPage() {
  return (
    <CrudModule
      table="risks"
      eyebrow="RISCOS E OPORTUNIDADES"
      title="Riscos e oportunidades"
      description="Identifique, classifique e trate riscos e oportunidades da obra."
      addLabel="Novo item"
      emptyText="Nenhum risco ou oportunidade registrado."
      modalTitle={(_e, isNew) => (isNew ? 'Novo risco/oportunidade' : 'Editar risco/oportunidade')}
      fields={[
        { key: 'description', label: 'Descrição', type: 'text', required: true, placeholder: 'Ex.: Atraso de materiais' },
        { key: 'category', label: 'Categoria', type: 'select', options: ['Risco', 'Oportunidade'] },
        { key: 'level', label: 'Nível', type: 'select', options: ['Baixo', 'Médio', 'Alto'] },
        { key: 'status', label: 'Tratamento', type: 'select', options: ['Monitorar', 'Mitigar', 'Reduzir', 'Explorar'] },
        { key: 'treatment', label: 'Plano de ação', type: 'textarea' },
      ]}
      columns={[
        { key: 'description', header: 'Descrição' },
        { key: 'category', header: 'Categoria' },
        { key: 'level', header: 'Nível', isStatus: true },
        { key: 'status', header: 'Tratamento', isStatus: true },
      ]}
      metrics={(records: Record0[]) => [
        { a: 'Total', b: String(records.length) },
        { a: 'Riscos altos', b: String(records.filter((r) => r.level === 'Alto' && r.category === 'Risco').length) },
        { a: 'Oportunidades', b: String(records.filter((r) => r.category === 'Oportunidade').length) },
      ]}
    />
  );
}

export function TeamPage() {
  return (
    <CrudModule
      table="team_members"
      eyebrow="EQUIPE E COMPETÊNCIAS"
      title="Equipe e competências"
      description="Cadastro de colaboradores, funções e situação de treinamento."
      addLabel="Novo colaborador"
      emptyText="Nenhum colaborador cadastrado."
      modalTitle={(_e, isNew) => (isNew ? 'Novo colaborador' : 'Editar colaborador')}
      fields={[
        { key: 'name', label: 'Nome', type: 'text', required: true },
        { key: 'role', label: 'Função', type: 'text', placeholder: 'Ex.: Mestre de obras' },
        { key: 'training_status', label: 'Situação de treinamento', type: 'select', options: ['Regular', 'Atualizar NR-35', 'Pendente'] },
        { key: 'hours', label: 'Horas no mês', type: 'text', placeholder: 'Ex.: 116h' },
      ]}
      columns={[
        { key: 'name', header: 'Nome', secondaryKey: 'role' },
        { key: 'hours', header: 'Horas no mês' },
        { key: 'training_status', header: 'Treinamento', isStatus: true },
      ]}
      metrics={(records: Record0[]) => [
        { a: 'Colaboradores', b: String(records.length) },
        { a: 'Pendências', b: String(records.filter((r) => r.training_status !== 'Regular').length) },
      ]}
    />
  );
}

export function ScenariosPage() {
  return (
    <CrudModule
      table="scenarios"
      eyebrow="ANÁLISE DE CENÁRIOS (SWOT)"
      title="Análise de cenários"
      description="Forças, fraquezas, oportunidades e ameaças relacionadas ao SGQ."
      addLabel="Novo item"
      emptyText="Nenhum item de cenário registrado."
      modalTitle={(_e, isNew) => (isNew ? 'Novo item de cenário' : 'Editar item de cenário')}
      fields={[
        { key: 'category', label: 'Categoria', type: 'select', options: ['Força', 'Fraqueza', 'Oportunidade', 'Ameaça'] },
        { key: 'description', label: 'Descrição', type: 'text', required: true },
        { key: 'action', label: 'Ação recomendada', type: 'select', options: ['Potencializar', 'Tratar', 'Explorar', 'Monitorar', 'Mitigar'] },
      ]}
      columns={[
        { key: 'category', header: 'Categoria', isStatus: true },
        { key: 'description', header: 'Descrição' },
        { key: 'action', header: 'Ação', isStatus: true },
      ]}
      metrics={(records: Record0[]) => [
        { a: 'Forças', b: String(records.filter((r) => r.category === 'Força').length) },
        { a: 'Fraquezas', b: String(records.filter((r) => r.category === 'Fraqueza').length) },
        { a: 'Oportunidades', b: String(records.filter((r) => r.category === 'Oportunidade').length) },
        { a: 'Ameaças', b: String(records.filter((r) => r.category === 'Ameaça').length) },
      ]}
    />
  );
}