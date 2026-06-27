/* =====================================================================
   i18n — multilingual UI layer.
   Add a language by appending an entry to LANGS and a block to STRINGS.
   The course CONTENT stays in English (technical canon); the UI chrome
   and the repeated fact labels are fully translated so the app speaks
   the learner's language.
   ===================================================================== */
window.I18N = (function () {
  const LANGS = [
    { code: "en", label: "English",  flag: "🇬🇧" },
    { code: "es", label: "Español",  flag: "🇪🇸" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "de", label: "Deutsch",  flag: "🇩🇪" },
    { code: "ar", label: "العربية",  flag: "🇸🇦", rtl: true },
  ];

  const STRINGS = {
    en: {
      "brand.sub": "Masterclass",
      "search.placeholder": "Search concepts, e.g. cache, sharding…",
      "nav.topics": "topics read",
      "hero.eyebrow": "END-TO-END · VISUAL · INTERVIEW-READY",
      "hero.title": "High Level Design, Drawn Out From First Principles",
      "hero.subtitle": "Every building block of large-scale systems — what problem it solves, how it works, when to use it, and the tradeoffs to say out loud in an interview. Fully diagram-driven.",
      "hero.start": "Start the journey",
      "hero.path": "See a request's life",
      "footer.note": "Built for teaching. Swap the palette from the top bar, switch languages, and present full-screen.",
      "label.problem": "Problem",
      "label.how": "How it works",
      "label.used": "Used for",
      "label.tradeoff": "Tradeoff",
      "label.examples": "Examples",
      "label.meaning": "Meaning",
      "label.purpose": "Purpose",
      "stat.sections": "Sections",
      "stat.topics": "Concepts",
      "stat.diagrams": "Diagrams",
      "stat.langs": "Languages",
      "search.empty": "No concepts match your search.",
    },
    es: {
      "brand.sub": "Clase magistral",
      "search.placeholder": "Busca conceptos, p. ej. cache, sharding…",
      "nav.topics": "temas leídos",
      "hero.eyebrow": "DE EXTREMO A EXTREMO · VISUAL · LISTO PARA ENTREVISTAS",
      "hero.title": "Diseño de Alto Nivel, explicado desde los principios",
      "hero.subtitle": "Cada bloque de los sistemas a gran escala: qué problema resuelve, cómo funciona, cuándo usarlo y las concesiones que debes mencionar en una entrevista. Totalmente basado en diagramas.",
      "hero.start": "Comenzar el recorrido",
      "hero.path": "Ver la vida de una petición",
      "footer.note": "Creado para enseñar. Cambia la paleta desde la barra superior, cambia de idioma y presenta en pantalla completa.",
      "label.problem": "Problema",
      "label.how": "Cómo funciona",
      "label.used": "Se usa para",
      "label.tradeoff": "Concesión",
      "label.examples": "Ejemplos",
      "label.meaning": "Significado",
      "label.purpose": "Propósito",
      "stat.sections": "Secciones",
      "stat.topics": "Conceptos",
      "stat.diagrams": "Diagramas",
      "stat.langs": "Idiomas",
      "search.empty": "Ningún concepto coincide con tu búsqueda.",
    },
    fr: {
      "brand.sub": "Masterclass",
      "search.placeholder": "Rechercher des concepts, ex. cache, sharding…",
      "nav.topics": "sujets lus",
      "hero.eyebrow": "DE BOUT EN BOUT · VISUEL · PRÊT POUR L'ENTRETIEN",
      "hero.title": "Conception de Haut Niveau, expliquée depuis les fondamentaux",
      "hero.subtitle": "Chaque brique des systèmes à grande échelle — le problème qu'elle résout, son fonctionnement, quand l'utiliser et les compromis à évoquer en entretien. Entièrement basé sur des schémas.",
      "hero.start": "Commencer le parcours",
      "hero.path": "Voir la vie d'une requête",
      "footer.note": "Conçu pour enseigner. Changez la palette depuis la barre supérieure, changez de langue et présentez en plein écran.",
      "label.problem": "Problème",
      "label.how": "Comment ça marche",
      "label.used": "Utilisé pour",
      "label.tradeoff": "Compromis",
      "label.examples": "Exemples",
      "label.meaning": "Signification",
      "label.purpose": "Objectif",
      "stat.sections": "Sections",
      "stat.topics": "Concepts",
      "stat.diagrams": "Schémas",
      "stat.langs": "Langues",
      "search.empty": "Aucun concept ne correspond à votre recherche.",
    },
    de: {
      "brand.sub": "Meisterkurs",
      "search.placeholder": "Konzepte suchen, z. B. cache, sharding…",
      "nav.topics": "Themen gelesen",
      "hero.eyebrow": "END-TO-END · VISUELL · INTERVIEW-BEREIT",
      "hero.title": "High Level Design, von Grund auf erklärt",
      "hero.subtitle": "Jeder Baustein großskaliger Systeme — welches Problem er löst, wie er funktioniert, wann man ihn einsetzt und welche Kompromisse man im Interview nennt. Vollständig diagrammbasiert.",
      "hero.start": "Reise beginnen",
      "hero.path": "Den Weg einer Anfrage sehen",
      "footer.note": "Zum Lehren gebaut. Tausche die Palette in der oberen Leiste, wechsle die Sprache und präsentiere im Vollbild.",
      "label.problem": "Problem",
      "label.how": "Wie es funktioniert",
      "label.used": "Verwendet für",
      "label.tradeoff": "Kompromiss",
      "label.examples": "Beispiele",
      "label.meaning": "Bedeutung",
      "label.purpose": "Zweck",
      "stat.sections": "Abschnitte",
      "stat.topics": "Konzepte",
      "stat.diagrams": "Diagramme",
      "stat.langs": "Sprachen",
      "search.empty": "Keine Konzepte entsprechen deiner Suche.",
    },
    ar: {
      "brand.sub": "دورة متقدّمة",
      "search.placeholder": "ابحث عن المفاهيم، مثل cache، sharding…",
      "nav.topics": "مواضيع مقروءة",
      "hero.eyebrow": "شامل · مرئي · جاهز للمقابلات",
      "hero.title": "التصميم عالي المستوى، مشروحًا من المبادئ الأولى",
      "hero.subtitle": "كل لبنة من أنظمة النطاق الواسع — ما المشكلة التي تحلها، وكيف تعمل، ومتى تُستخدم، والمفاضلات التي تذكرها في المقابلة. قائم بالكامل على المخططات.",
      "hero.start": "ابدأ الرحلة",
      "hero.path": "شاهد رحلة الطلب",
      "footer.note": "مبني للتعليم. غيّر لوحة الألوان من الشريط العلوي، وبدّل اللغة، واعرض بملء الشاشة.",
      "label.problem": "المشكلة",
      "label.how": "كيف يعمل",
      "label.used": "يُستخدم لـ",
      "label.tradeoff": "المفاضلة",
      "label.examples": "أمثلة",
      "label.meaning": "المعنى",
      "label.purpose": "الغرض",
      "stat.sections": "الأقسام",
      "stat.topics": "المفاهيم",
      "stat.diagrams": "المخططات",
      "stat.langs": "اللغات",
      "search.empty": "لا توجد مفاهيم تطابق بحثك.",
    },
  };

  let current = localStorage.getItem("hld-lang") || "en";

  function t(key) {
    return (STRINGS[current] && STRINGS[current][key]) || STRINGS.en[key] || key;
  }
  function set(code) {
    current = STRINGS[code] ? code : "en";
    localStorage.setItem("hld-lang", current);
    const meta = LANGS.find((l) => l.code === current);
    document.documentElement.lang = current;
    document.documentElement.dir = meta && meta.rtl ? "rtl" : "ltr";
  }
  function get() { return current; }

  return { LANGS, STRINGS, t, set, get };
})();
