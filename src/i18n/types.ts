import type { FeaturedId, OtherId } from "../content/projects";
import type { Clase } from "../lib/lab/hojas/clases";

export interface FeaturedText {
  name: string;
  summary: string;
  metricValue: string;
  metricLabel: string;
  /** Párrafo de arriba de la página de detalle. */
  lead: string;
  /** Lo que hace y cómo está hecho, en frases completas. */
  highlights: readonly string[];
  /** Lo que el proyecto no es o no ha probado: se dice sin rodeos. */
  limits: string;
  /** Descripción de la portada para lectores de pantalla. */
  coverAlt: string;
}

export interface OtherText {
  name: string;
  description: string;
}

/** Textos del laboratorio de dígitos. `{n}`, `{list}`… son marcas que se reemplazan al mostrarlos. */
export interface DigitsLabText {
  title: string;
  kicker: string;
  intro: string;
  help: string;
  canvasLabel: string;
  clear: string;
  loading: string;
  loadError: string;
  empty: string;
  readsOne: string;
  readsMany: string;
  glued: string;
  doubtOne: string;
  doubtMany: string;
  detectedLabel: string;
  digitN: string;
  unreliable: string;
  gluedBox: string;
  probsTitle: string;
  probsHint: string;
  probsLabel: string;
  how: string;
  model: string;
  privacy: string;
  seeProject: string;
}

/** Textos del laboratorio de hojas de banano. `{n}`, `{pct}`… son marcas que se reemplazan al mostrarlos. */
export interface LeavesLabText {
  title: string;
  kicker: string;
  intro: string;
  takePhoto: string;
  pickImage: string;
  placeholder: string;
  canvasLabel: string;
  examplesHint: string;
  downloadNote: string;
  idle: string;
  preparing: string;
  analyzing: string;
  errorImage: string;
  errorExample: string;
  errorAnalyze: string;
  thinksIt: string;
  lowConfidence: string;
  probsLabel: string;
  privacy: string;
  classes: Record<Clase, { name: string; short: string; description: string }>;
  model: string;
  limitsTitle: string;
  limits: readonly string[];
  credit: string;
  seeProject: string;
}

/** Textos del asistente con IA. `{n}` y `{max}` son marcas que se reemplazan al mostrarlos. */
export interface AgentText {
  heading: string;
  text: string;
  title: string;
  welcome: string;
  disclosure: string;
  suggestionsLabel: string;
  suggestions: readonly string[];
  inputLabel: string;
  placeholder: string;
  send: string;
  thinking: string;
  reset: string;
  you: string;
  assistant: string;
  counter: string;
  contactCta: string;
  errors: {
    rate: string;
    daily: string;
    quota: string;
    unavailable: string;
    network: string;
    tooLong: string;
    generic: string;
  };
}

/** Textos del formulario de contacto «como ticket». `{id}`, `{n}` y `{max}` se reemplazan al mostrarlos. */
export interface ContactText {
  heading: string;
  text: string;
  linkedinLabel: string;
  githubLabel: string;
  alsoOn: string;
  cvLabel: string;
  cvFile: string;
  form: {
    name: string;
    email: string;
    subject: string;
    priority: string;
    priorities: { low: string; normal: string; high: string };
    message: string;
    messageHint: string;
    send: string;
    sending: string;
    counter: string;
    privacy: string;
  };
  success: { title: string; text: string; another: string };
  errors: {
    name: string;
    email: string;
    subject: string;
    priority: string;
    message: string;
    rate: string;
    unavailable: string;
    network: string;
    generic: string;
  };
}

export interface PanelText {
  heading: string;
  text: string;
  status: string;
}

export interface Dictionary {
  meta: { title: string; description: string };
  common: {
    skipToContent: string;
    opensInNewTab: string;
    openMenu: string;
    closeMenu: string;
    mainNav: string;
    languageNav: string;
    switchLanguage: string;
    links: { demo: string; site: string; code: string };
  };
  nav: { projects: string; lab: string; agent: string; contact: string };
  hero: {
    status: string;
    lead: string;
    availability: string;
    ctaProjects: string;
    ctaContact: string;
    networkLabel: string;
    networkCaption: string;
  };
  projects: {
    intro: string;
    note: string;
    detail: {
      /** Enlace de la lista a la página del proyecto. */
      seeDetail: string;
      back: string;
      highlightsTitle: string;
      stackTitle: string;
      limitsTitle: string;
      previous: string;
      next: string;
      /** Texto del enlace a otro proyecto: «Proyecto anterior: X». */
      navLabel: string;
    };
    featured: Record<FeaturedId, FeaturedText>;
    otherTitle: string;
    other: Record<OtherId, OtherText>;
  };
  lab: {
    heading: string;
    text: string;
    digits: DigitsLabText;
    leaves: LeavesLabText;
  };
  agent: AgentText;
  contact: ContactText;
  footer: { rights: string; built: string };
}
