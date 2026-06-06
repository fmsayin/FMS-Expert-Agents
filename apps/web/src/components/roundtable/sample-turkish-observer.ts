import type { TurkishSummaryStructured } from "@/components/roundtable/types";

export type SampleTurkishObserverEntry = {
  figureName: string;
  preview: string;
  structured: TurkishSummaryStructured;
};

/** Static preview when no live debate summaries exist */
export const SAMPLE_TURKISH_OBSERVER_ENTRIES: SampleTurkishObserverEntry[] = [
  {
    figureName: "Churchill",
    preview:
      "Churchill: Uluslararası kurumların yapay zekâyı kriz diplomasisi öncesinde düzenlemesi gerektiğini savunuyor; özgürlükler pazarlık konusu olmamalıdır.",
    structured: {
      anaArguman:
        "Uluslararası kurumlar, özerk sistemleri kriz diplomasisinden önce düzenlemelidir; barış cesur halkların uyanıklığına bağlıdır.",
      stratejikCikarim:
        "Teknolojik üstünlük, kurumsal caydırıcılık olmadan stratejik kırılganlığa dönüşebilir.",
      politikaIliskisi:
        "Çok taraflı AI yönetişimi ve müttefik koordinasyonu için bağlayıcı çerçeveler şarttır.",
    },
  },
  {
    figureName: "Gandhi",
    preview:
      "Gandhi: İnsan onurunun algoritmalar tarafından ölçülemeyeceğini; gerçek diplomasinin güçlünün kendini sınırlamasından doğduğunu vurguluyor.",
    structured: {
      anaArguman:
        "Korkuya dayalı barış uzlaşmadır; zayıf sesler duyulmadan sürdürülebilir diplomasi kurulamaz.",
      stratejikCikarim:
        "Teknoloji, etik sınırlar ve katılımcı meşruiyet olmadan istikrarı zayıflatır.",
      politikaIliskisi:
        "İnsan hakları denetimi ve şeffaf karar süreçleri çok taraflı müzakerelerin merkezine alınmalıdır.",
    },
  },
  {
    figureName: "Napoleon",
    preview:
      "Napoleon: Kuralların ancak güç dengesi ve uygulanabilir antlaşmalarla anlam kazandığını; düzeni kurumların dişiyle koruduğunu belirtiyor.",
    structured: {
      anaArguman:
        "Duygusal çağrılar haritaları değiştirmez; düzen, güç dengesi ve uygulanabilir antlaşmalarla korunur.",
      stratejikCikarim:
        "Kriz anlarında otomasyon, müzakere masasını hızlandırmaktan çok çatışma dinamiklerini keskinleştirebilir.",
      politikaIliskisi:
        "Denetlenebilir müdahale yetkileri ve dengeleyici ittifaklar üzerinden kurumsal zorlayıcı güç tasarlanmalıdır.",
    },
  },
];

export const SAMPLE_TURKISH_OBSERVER_TITLE = "Türkçe Stratejik Özet";
export const SAMPLE_TURKISH_OBSERVER_LABEL = "Örnek analiz";
export const SAMPLE_TURKISH_OBSERVER_HINT =
  "Tartışma başladığında canlı özetler bu örneğin yerini alır.";
