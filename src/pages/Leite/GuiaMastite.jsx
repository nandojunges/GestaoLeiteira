import React from "react";

export default function GuiaMastite({ onFechar }) {
  return (
    <div style={overlay} onClick={onFechar}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={header}>
          📘 Guia Clínico de Mastite
          <button onClick={onFechar} style={botaoFechar}>×</button>
        </div>
        <div style={conteudo}>
          <h2 style={titulo}>Agentes e Características Clínicas</h2>

          <p><strong>🦠 Staphylococcus aureus:</strong> agente contagioso típico de mastites crônicas. O leite pode conter grumos persistentes e o quarto mamário torna-se endurecido com o tempo. Comum em vacas com vários partos. Forma abscessos que dificultam a ação de antibióticos, reduzindo a taxa de cura. Pode haver baixa produção e, em casos graves, necrose do tecido mamário. Tratamento com Cloxacilina ou Cefquinoma pode ajudar, mas muitas vezes o descarte é indicado.</p>

          <p><strong>🦠 Streptococcus agalactiae:</strong> frequentemente assintomático, mas com CCS elevada. O leite parece normal ou com flocos finos. Bastante responsivo a Penicilinas. A infecção é contagiosa, transmitida facilmente durante a ordenha. Exige tratamento de todo o rebanho infectado.</p>

          <p><strong>🦠 Escherichia coli:</strong> causa mastite ambiental aguda. A vaca pode apresentar febre, anorexia, toxemia e até morte súbita. O leite pode ser aquoso, com sangue ou pus. Requer ação rápida com antibióticos sistêmicos (Ceftiofur, Enrofloxacina), fluidoterapia e anti-inflamatórios.</p>

          <p><strong>🦠 Klebsiella spp.:</strong> mastite grave e semelhante à E. coli, porém mais resistente ao tratamento. Leite com odor forte, aspecto cremoso, presença de coágulos grossos e coloração amarelada ou marrom. O quarto mamário incha rapidamente. O prognóstico é reservado.</p>

          <p><strong>🦠 Candida spp.:</strong> agente fúngico, associado ao uso excessivo de antibióticos. O leite apresenta flocos, grumos pequenos e aparência granulosa. Não responde a antibióticos. Mastite crônica, com endurecimento do quarto. Recomenda-se cessar antibióticos e avaliar descarte.</p>

          <p><strong>🦠 Prototheca spp.:</strong> alga que causa mastite crônica, persistente e incurável. O leite tem aparência normal ou levemente aquosa, com CCS muito alta. O tecido mamário se atrofia com o tempo. O tratamento é ineficaz. Descarte é a única solução viável.</p>

          <p><strong>🦠 Streptococcus uberis e dysgalactiae:</strong> mastite ambiental subclínica ou leve. O leite pode ter grumos leves ou aspecto levemente alterado. Boa resposta a antibióticos como Amoxicilina e Cefalosporinas. Controle exige higiene e ambiente seco.</p>

          <p><strong>🦠 Corynebacterium bovis:</strong> geralmente inofensivo, mas indica falha na vedação do canal do teto. O leite não apresenta alterações visuais. CCS moderadamente elevada. Pode predispor à infecção secundária. Melhoria na ordenha resolve a maioria dos casos.</p>

          <p><strong>🦠 Pseudomonas aeruginosa:</strong> bactéria resistente e grave. Leite com mau cheiro, secreção esverdeada ou azulada. Pode haver febre e toxemia. Resposta a antibióticos é limitada. Evitar reutilização de seringas ou soluções contaminadas.</p>

          <p><strong>🦠 Mycoplasma spp.:</strong> mastite altamente contagiosa e refratária. Leite aguado, com queda de produção severa e envolvimento de vários quartos. Pode vir acompanhada de artrite ou pneumonia. Sem cura, exige isolamento ou descarte.</p>

          <p><strong>🦠 Serratia spp.:</strong> causa quadros crônicos, com secreção densa e alterações na coloração do leite (rosada, esverdeada). Baixa resposta terapêutica. Controle ambiental e higiene são essenciais.</p>

          <p><strong>🦠 Nocardia spp.:</strong> rara, mas grave. Causa mastite granulomatosa com nódulos palpáveis. Leite com pus espesso. Sem resposta a antibióticos. Normalmente exige descarte do animal.</p>

          <p><strong>🦠 Aspergillus spp.:</strong> fungo ambiental encontrado em fenos mofados. O leite pode conter grumos pretos ou arenosos. A glândula apresenta endurecimento e dor. Sem resposta a antibióticos. Prevenção com manejo adequado do ambiente.</p>

          <h2 style={titulo}>📌 Considerações Técnicas</h2>

          <p><strong>💊 Antibióticos e Eficiência:</strong> Penicilinas como Amoxicilina e Cloxacilina são úteis contra Streptococcus spp. e Staphylococcus. Cefalosporinas (Ceftiofur, Cefquinoma) têm ação mais ampla. Fluoroquinolonas como Enrofloxacina são eficazes em infecções sistêmicas. Antibióticos não funcionam contra Candida, Prototheca e Aspergillus.</p>

          <p><strong>🚫 Associações inadequadas:</strong> evitar associar bactericidas (ex: beta-lactâmicos) com bacteriostáticos (ex: Tetraciclinas, Macrolídeos) no mesmo tratamento. Podem competir e reduzir a eficácia. Sempre siga orientações de bula ou veterinário.</p>

          <p><strong>🧪 Sensibilidade e Cultura:</strong> testes de sensibilidade indicam se a bactéria é sensível, intermediária ou resistente a determinado antibiótico. Interpretações erradas podem levar a falha terapêutica. Amostras contaminadas ou mal conservadas geram falsos resultados.</p>

          <p><strong>🧠 Boas práticas:</strong> associar antibióticos sistêmicos e IMM em quadros severos. Fazer cultura quando houver dúvida diagnóstica. Priorizar o bem-estar animal e considerar o descarte em casos de baixa resposta ou risco à saúde pública.</p>

          <p><strong>💉 Sistêmico vs. Intramamário:</strong> infecções localizadas (sem sinais sistêmicos) podem responder bem ao IMM. Em quadros com febre, toxemia ou infecção múltipla, o uso sistêmico é obrigatório, com anti-inflamatórios e suporte clínico.</p>
        </div>
      </div>
    </div>
  );
}

// Estilos
const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999
};

const modal = {
  background: "#fff",
  borderRadius: "1rem",
  width: "90vw",
  maxHeight: "90vh",
  overflowY: "auto",
  padding: "2rem",
  fontFamily: "Poppins, sans-serif",
  boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: "1.5rem",
  fontWeight: "bold",
  color: "#1e40af",
  marginBottom: "1rem"
};

const botaoFechar = {
  background: "none",
  border: "none",
  fontSize: "1.5rem",
  cursor: "pointer"
};

const conteudo = {
  fontSize: "0.95rem",
  color: "#111",
  lineHeight: "1.6"
};

const titulo = {
  fontSize: "1.2rem",
  color: "#111827",
  margin: "1rem 0 0.5rem",
  borderBottom: "1px solid #e5e7eb",
  paddingBottom: "0.25rem"
};
