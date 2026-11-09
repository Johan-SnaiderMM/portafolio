import type { Dictionary } from "./types";

export const en = {
  meta: {
    title: "Johan Moreno · Systems Engineer",
    description:
      "Portfolio of Johan Moreno, a systems engineer from Urabá, Colombia. Full-stack web apps, neural networks with measured results and projects in real use.",
  },
  common: {
    skipToContent: "Skip to content",
    opensInNewTab: "opens in a new tab",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    mainNav: "Main",
    languageNav: "Language",
    switchLanguage: "Switch to Spanish",
    links: { demo: "Demo", site: "Site", code: "Code" },
  },
  nav: {
    projects: "Projects",
    lab: "Lab",
    agent: "Agent",
    contact: "Contact",
  },
  hero: {
    status: "Systems Engineer · Apartadó, Urabá, Colombia",
    lead: "Full-stack web development and applied AI. I wrote a neural network from scratch (98.1% on MNIST), trained a banana-leaf disease classifier (98.5%) and built a help desk with 294 automated tests.",
    availability:
      "Looking for my first junior developer job. Open to freelance apps for small businesses.",
    ctaProjects: "See projects",
    ctaContact: "Contact",
    networkLabel:
      "Diagram of the 784-128-64-10 neural network I wrote from scratch with NumPy",
    networkCaption: "Simplified diagram of my MNIST network: 784-128-64-10.",
  },
  projects: {
    intro:
      "Five projects, with what I measured in each one and links to try them.",
    note: "98.1% is on a single MNIST digit; multi-digit numbers were measured on synthetic sequences (86.5% correct). The demos use made-up data.",
    featured: {
      "mesa-ayuda": {
        name: "IT help desk",
        summary:
          "Support ticket system, like a modern osTicket: three roles, validated states, assignment, internal comments and an SLA metrics dashboard.",
        metricValue: "294",
        metricLabel: "automated tests, 108 of them against a real PostgreSQL",
      },
      "red-neuronal": {
        name: "Neural network from scratch",
        summary:
          "A multilayer perceptron written with NumPy, no PyTorch or TensorFlow: backpropagation, Adam and He initialization by hand. The demo runs in the browser and reads what you draw.",
        metricValue: "98.1%",
        metricLabel: "accuracy on the 10,000 MNIST test images",
      },
      "hojas-banano": {
        name: "Banana leaf classifier",
        summary:
          "Tells whether a leaf is healthy or has Sigatoka, Cordana or Pestalotiopsis. It runs in the browser and your photo never leaves your device. Trained on photos from Bangladesh; still to be validated with leaves from Urabá.",
        metricValue: "98.5%",
        metricLabel: "accuracy on 134 test photos",
      },
      origenes: {
        name: "Orígenes",
        summary:
          "Platform to preserve the historical memory of Urabá: 360° scenes, augmented reality and Aruma, an AI historian avatar (Llama 3.3 with per-scene context and a neural voice).",
        metricValue: "Capstone project",
        metricLabel: "Universidad Católica Luis Amigó",
      },
      comanda: {
        name: "Comanda",
        summary:
          "App for small restaurants: table, takeaway and delivery orders, customer tabs, expenses and end-of-day closing. Works offline. The demo uses fictitious data.",
        metricValue: "In real use",
        metricLabel: "at a restaurant",
      },
    },
    otherTitle: "Other projects",
    other: {
      "polo-air-cool": {
        name: "Polo Air Cool",
        description:
          "Automotive air-conditioning shop, in real use: orders with photo log, inventory and warranties.",
      },
      barberias: {
        name: "Barberías",
        description:
          "Scheduling, booking by link or QR and end-of-day totals (demo).",
      },
      servitecas: {
        name: "Servitecas",
        description:
          "Shop customers follow their vehicle's progress and approve extra work (demo).",
      },
      consultorio: {
        name: "Psychology practice",
        description:
          "Appointments without double-booking, waiting list and PDF medical records (demo).",
      },
      "reporte-ambiental": {
        name: "Environmental reports",
        description:
          "Prototype to report environmental incidents with a photo and location on a map.",
      },
    },
  },
  lab: {
    heading: "Draw a digit and see how the network reads it.",
    text: "Soon you'll be able to try the neural network I wrote with NumPy right here, in your browser: your drawing never leaves your device.",
    status: "Under construction",
    linkLabel: "Try the full demo",
  },
  agent: {
    heading: "Ask my AI assistant.",
    text: "It will answer about my experience and projects using only the information on this site. If it doesn't know something, it will say so.",
    status: "Under construction",
    linkLabel: "Meanwhile, message me on LinkedIn",
  },
  contact: {
    heading: "Tell me what you need.",
    text: "Soon you'll be able to open a ticket from here and I'll reply by email. For now, message me on LinkedIn or browse my code on GitHub.",
    status: "Form under construction",
    linkedinLabel: "LinkedIn",
    githubLabel: "GitHub",
  },
  footer: {
    rights: "© 2026 Johan Moreno",
    built: "Built with Next.js and deployed on Vercel.",
  },
} satisfies Dictionary;
