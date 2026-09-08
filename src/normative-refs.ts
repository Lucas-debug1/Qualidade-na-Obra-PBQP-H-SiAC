// Referências normativas e tolerâncias por FVS.
// Índice alinhado ao array fvsTemplates (operational.tsx), posição 0 a 23.
// Normas conferidas: NBR 8545 (alvenaria), NBR 15696 (fôrmas/escoramentos),
// NBR 13749 (revestimento argamassa), NBR 15575 (desempenho, partes 1-6),
// NBR 10821 (esquadrias), NBR 7199 (vidros), NBR 15097/15491 (louças/metais),
// NBR 9050 (acessibilidade), entre outras normas de execução amplamente
// reconhecidas no setor (NBR 5410, 5626, 8160, 10844, 9575/9574, 6118/6122).
export type NormativeRef = { standards: string[]; tolerance: string };

export const fvsNormativeRefs: NormativeRef[] = [
  { standards: ['NBR 13133 — Execução de levantamento topográfico'], tolerance: 'Referência de nível (RN) e esquadro de locação conforme projeto/memorial.' },
  { standards: ['NBR 6122 — Projeto e execução de fundações', 'NBR 9061 — Segurança de escavação a céu aberto'], tolerance: 'Cotas e taludes conforme projeto geotécnico/estrutural.' },
  { standards: ['NBR 6118 — Projeto de estruturas de concreto', 'NBR 6122 — Projeto e execução de fundações'], tolerance: 'Cobrimento de armadura e dimensões conforme projeto estrutural.' },
  { standards: ['NBR 9575 — Impermeabilização (seleção e projeto)', 'NBR 9574 — Execução de impermeabilização'], tolerance: 'Espessura da manta/membrana e caimento conforme projeto de impermeabilização.' },
  { standards: ['NBR 6118 — Projeto de estruturas de concreto', 'NBR 14931 — Execução de estruturas de concreto', 'NBR 15696 — Fôrmas e escoramentos', 'NBR 15575-2 — Desempenho: sistemas estruturais'], tolerance: 'Prumo, nível e cobrimento conforme projeto estrutural; desforma conforme NBR 15696.' },
  { standards: ['NBR 8545 — Execução de alvenaria sem função estrutural', 'NBR 15575-4 — Desempenho: vedações verticais'], tolerance: 'Prumo, nível e alinhamento conforme procedimento executivo; juntas de assentamento até 15 mm.' },
  { standards: ['NBR 13749 — Revestimento de paredes e tetos de argamassas inorgânicas', 'NBR 7200 — Execução de revestimento de argamassa'], tolerance: 'Espessura do revestimento: 5–20 mm (parede interna); 20–30 mm (parede externa). Planeza e prumo conforme NBR 13749.' },
  { standards: ['NBR 15575-3 — Desempenho: sistemas de pisos'], tolerance: 'Nivelamento e caimento (áreas molhadas) conforme projeto.' },
  { standards: ['NBR 9575 — Impermeabilização (seleção e projeto)', 'NBR 9574 — Execução de impermeabilização'], tolerance: 'Caimento mínimo para escoamento e altura de rodapé impermeável conforme projeto.' },
  { standards: ['NBR 13755 — Revestimento cerâmico de fachadas', 'NBR 13753 — Revestimento cerâmico de piso', 'NBR 14081 — Argamassa colante industrializada'], tolerance: 'Juntas de assentamento e alinhamento conforme projeto/fabricante da argamassa colante.' },
  { standards: ['NBR 10821 — Esquadrias para edificações', 'NBR 7199 — Aplicações de vidro na construção civil'], tolerance: 'Estanqueidade, funcionamento e vedação conforme NBR 10821; espessura/fixação de vidros conforme NBR 7199.' },
  { standards: ['NBR 7190 — Projeto de estruturas de madeira (ou NBR 8800 para estrutura metálica)', 'NBR 15575-5 — Desempenho: sistemas de cobertura', 'NBR 15691 — Ensaio não destrutivo por líquido penetrante (se houver solda estrutural metálica)'], tolerance: 'Caimento do telhado e fixação conforme projeto e especificação do fabricante da telha. Em conexões soldadas de estrutura metálica, inspecionar cordão de solda por líquido penetrante conforme NBR 15691.' },
  { standards: ['NBR 15575-4/5 — Desempenho: vedações e coberturas', 'NBR 15758 — Sistemas em chapas de gesso (quando aplicável)'], tolerance: 'Nivelamento e juntas conforme projeto/fabricante.' },
  { standards: ['NBR 5626 — Instalação predial de água fria'], tolerance: 'Pressão, vazão e declividade conforme projeto hidráulico.' },
  { standards: ['NBR 8160 — Sistemas prediais de esgoto sanitário'], tolerance: 'Declividade mínima e ventilação conforme projeto sanitário.' },
  { standards: ['NBR 10844 — Instalações prediais de águas pluviais'], tolerance: 'Dimensionamento de calhas/condutores conforme projeto pluvial.' },
  { standards: ['NBR 5410 — Instalações elétricas de baixa tensão'], tolerance: 'Seção de condutores e proteção conforme projeto elétrico.' },
  { standards: ['NBR 5410 — Instalações elétricas de baixa tensão', 'NBR 8445 — Buchas para transformadores de potência (se houver transformador/subestação)'], tolerance: 'Testes de isolamento, continuidade e disjuntores conforme projeto elétrico. Em instalações com transformador/subestação, verificar buchas conforme NBR 8445.' },
  { standards: ['NBR 15097 — Louças sanitárias', 'NBR 15491 — Caixa de descarga'], tolerance: 'Fixação, vedação e funcionamento conforme especificação do fabricante.' },
  { standards: ['NBR 15575-4 — Desempenho: vedações verticais'], tolerance: 'Número de demãos e acabamento conforme especificação do fabricante da tinta.' },
  { standards: ['NBR 9050 — Acessibilidade a edificações, mobiliário, espaços e equipamentos urbanos'], tolerance: 'Inclinação de rampas, piso tátil e larguras mínimas conforme NBR 9050.' },
  { standards: ['NBR 15575-1 — Desempenho: requisitos gerais'], tolerance: 'Conforme projeto de urbanização/paisagismo específico da obra.' },
  { standards: ['NBR 5410 — Instalações elétricas', 'NBR 5626 — Água fria', 'NBR 8160 — Esgoto sanitário'], tolerance: 'Testes conforme a norma do sistema predial testado.' },
  { standards: ['NBR 15575-1 — Desempenho: requisitos gerais'], tolerance: 'Checklist de entrega conforme manual de uso, operação e manutenção (NBR 15575-1, Anexo A).' },
];
