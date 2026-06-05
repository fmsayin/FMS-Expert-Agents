import type { ThinkTankAnalysis, TurkishExecutiveReport } from "@/components/roundtable/types";

/** Editorial placeholder when debate has not yet produced live analysis */
export const SAMPLE_THINK_TANK_ANALYSIS: ThinkTankAnalysis = {
  executiveSummary:
    "This round table preview frames AI-assisted peace diplomacy as a governance challenge, not merely a technical one. Participants anticipate convergence on human oversight and institutional legitimacy, while strength, ethics, and enforceable law remain in tension until the live debate supplies evidence.",
  consensus:
    "Across the table, voices tend to align that multilateral institutions must retain human judgment over autonomous diplomatic systems, and that algorithmic transparency is a precondition for legitimacy in crisis mediation. Shared language around accountability and auditability appears even before positions harden.",
  disagreements:
    "Churchill and Napoleon diverge on whether deterrence or institutional restraint should be primary; Gandhi challenges both on the moral limits of power exercised through machines. A second fault line runs between rapid deployment for strategic advantage and slower, inclusive treaty-making that smaller states can trust.",
  risks:
    "Escalation through misinterpreted signals, erosion of accountability if states delegate crisis response to opaque systems, and asymmetric access widening the gap between great powers and smaller states. Domestic audiences may also reject outcomes perceived as machine-mediated rather than politically owned.",
  recommendations:
    "Establish a standing council with veto rights for major powers; mandate audit trails for AI-assisted negotiations; pair technical governance with civic education on digital diplomacy. Pilot confidence-building measures before binding automation in high-stakes channels.",
  consensusScore: 72,
  disagreementScore: 48,
};

/** Turkish mirror of sample analysis for bilingual Reports tab */
export const SAMPLE_TURKISH_EXECUTIVE_REPORT: TurkishExecutiveReport = {
  yoneticiOzeti:
    "Bu önizleme, yapay zekâ destekli barış diplomasisini yalnızca teknik değil, aynı zamanda kurumsal bir yönetişim sorunu olarak çerçeveler. Canlı tartışma başlamadan önce katılımcılar insan denetimi ve meşruiyet konusunda yakınsama beklerken güç, etik ve bağlayıcı hukuk gerilimini korur.",
  konsensus:
    "Çok taraflı kurumların özerk diplomatik sistemler üzerinde insan yargısını koruması ve kriz arabuluculuğunda algoritmik şeffaflığın meşruiyet önkoşulu olması yönünde geniş bir eğilim vardır. Hesap verebilirlik ve denetlenebilirlik dili pozisyonlar keskinleşmeden önce bile ortaya çıkar.",
  anlasmazliklar:
    "Churchill ile Napoleon caydırıcılık ile kurumsal öz-disiplin önceliğinde ayrılır; Gandhi her ikisini de makineler aracılığıyla kullanılan gücün ahlaki sınırları konusunda sorgular. İkinci bir kırılma hattı, stratejik üstünlük için hızlı devreye alma ile küçük devletlerin güvenebileceği kapsayıcı antlaşma hızı arasında uzanır.",
  riskler:
    "Yanlış yorumlanan sinyallerle tırmanma, kriz yanıtının opak sistemlere devredilmesiyle hesap verebilirliğin aşınması ve büyük güçler ile küçük devletler arasındaki asimetrik erişim uçurumunun derinleşmesi. İç kamuoyunun makine aracılı sonuçları siyasi sahiplenme olarak görmemesi de risk oluşturur.",
  oneriler:
    "Büyük güçler için veto hakkı olan daimi bir konsey; AI destekli müzakereler için zorunlu denetim izleri; dijital diplomasi için teknik yönetişimi sivil eğitimle eşleştirme. Yüksek riskli kanallarda bağlayıcı otomasyondan önce güven artırıcı pilotlar.",
};

export const SAMPLE_ANALYSIS_LABEL_EN = "Sample";
export const SAMPLE_ANALYSIS_LABEL_TR = "Örnek";

export function hasLiveThinkTankAnalysis(
  analysis: ThinkTankAnalysis | null,
  isPlaceholder: boolean,
): boolean {
  return Boolean(analysis) && !isPlaceholder;
}

export function resolveThinkTankDisplay(
  analysis: ThinkTankAnalysis | null,
  isPlaceholder: boolean,
): { display: ThinkTankAnalysis; showingSample: boolean } {
  const showingSample = !hasLiveThinkTankAnalysis(analysis, isPlaceholder);
  return {
    showingSample,
    display: showingSample ? SAMPLE_THINK_TANK_ANALYSIS : analysis!,
  };
}
