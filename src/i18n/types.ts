import type { FeaturedId, OtherId } from "../content/projects";

export interface FeaturedText {
  name: string;
  summary: string;
  metricValue: string;
  metricLabel: string;
}

export interface OtherText {
  name: string;
  description: string;
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
    featured: Record<FeaturedId, FeaturedText>;
    otherTitle: string;
    other: Record<OtherId, OtherText>;
  };
  lab: PanelText & { linkLabel: string };
  agent: PanelText & { linkLabel: string };
  contact: PanelText & { linkedinLabel: string; githubLabel: string };
  footer: { rights: string; built: string };
}
