import type { Dictionary } from "./types";

export const es = {
  meta: {
    title: "Johan Moreno · Ingeniero de Sistemas",
    description:
      "Portafolio de Johan Moreno, ingeniero de sistemas de Urabá. Aplicaciones web completas, redes neuronales con cifras medidas y proyectos en uso real.",
  },
  common: {
    skipToContent: "Saltar al contenido",
    opensInNewTab: "se abre en una pestaña nueva",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    mainNav: "Principal",
    languageNav: "Idioma",
    switchLanguage: "Cambiar a inglés",
    links: { demo: "Demo", site: "Sitio", code: "Código" },
  },
  nav: {
    projects: "Proyectos",
    lab: "Laboratorio",
    agent: "Agente",
    contact: "Contacto",
  },
  hero: {
    status: "Ingeniero de Sistemas · Apartadó, Urabá",
    lead: "Desarrollo web full stack e IA aplicada. Escribí una red neuronal desde cero (98,1 % en MNIST), entrené un clasificador de hojas de banano (98,5 %) y construí una mesa de ayuda con 294 pruebas automáticas.",
    availability:
      "Busco mi primer empleo como desarrollador junior y tomo proyectos freelance de apps para negocios pequeños.",
    ctaProjects: "Ver proyectos",
    ctaContact: "Contacto",
    networkLabel:
      "Esquema de la red neuronal 784-128-64-10 que escribí desde cero con NumPy",
    networkCaption: "Esquema simplificado de mi red de MNIST: 784-128-64-10.",
  },
  projects: {
    intro:
      "Cinco proyectos, con lo que medí en cada uno y enlaces para probarlos.",
    note: "98,1 % es con un dígito aislado de MNIST; los números de varios dígitos se midieron con secuencias sintéticas (86,5 % bien). Las demos usan datos inventados.",
    featured: {
      "mesa-ayuda": {
        name: "Mesa de ayuda TI",
        summary:
          "Sistema de tickets de soporte, como un osTicket moderno: tres roles, estados que se validan, asignación, comentarios internos y un panel de métricas de SLA.",
        metricValue: "294",
        metricLabel: "pruebas automáticas, 108 de ellas contra PostgreSQL real",
      },
      "red-neuronal": {
        name: "Red neuronal desde cero",
        summary:
          "Un perceptrón multicapa escrito con NumPy, sin PyTorch ni TensorFlow: retropropagación, Adam e inicialización de He a mano. La demo corre en el navegador y lee lo que dibujas.",
        metricValue: "98,1 %",
        metricLabel: "de acierto en las 10 000 imágenes de prueba de MNIST",
      },
      "hojas-banano": {
        name: "Clasificador de hojas de banano",
        summary:
          "Dice si una hoja está sana o tiene Sigatoka, Cordana o Pestalotiopsis. Corre en el navegador y la foto no sale de tu dispositivo. Se entrenó con fotos de Bangladesh y falta validarlo con hojas de Urabá.",
        metricValue: "98,5 %",
        metricLabel: "de acierto en 134 fotos de prueba",
      },
      origenes: {
        name: "Orígenes",
        summary:
          "Plataforma para preservar la memoria histórica de Urabá: escenas 360°, realidad aumentada y Aruma, una avatar historiadora con IA (Llama 3.3 con contexto por escena y voz neuronal).",
        metricValue: "Proyecto de grado",
        metricLabel: "Universidad Católica Luis Amigó",
      },
      comanda: {
        name: "Comanda",
        summary:
          "App para restaurantes pequeños: pedidos por mesa, para llevar y domicilio, fiado, gastos y cierre del día. Funciona sin conexión. La demo usa datos ficticios.",
        metricValue: "En uso real",
        metricLabel: "en un restaurante",
      },
    },
    otherTitle: "Otros proyectos",
    other: {
      "polo-air-cool": {
        name: "Polo Air Cool",
        description:
          "Taller de aire acondicionado automotriz, en uso real: órdenes con bitácora fotográfica, inventario y garantías.",
      },
      barberias: {
        name: "Barberías",
        description: "Agenda, reservas por enlace o QR y cierre del día (demo).",
      },
      servitecas: {
        name: "Servitecas",
        description:
          "El cliente del taller ve el avance de su vehículo y autoriza trabajos adicionales (demo).",
      },
      consultorio: {
        name: "Consultorio de psicología",
        description:
          "Citas sin cruces, lista de espera e historiales en PDF (demo).",
      },
      "reporte-ambiental": {
        name: "Reporte ambiental",
        description:
          "Prototipo para reportar afectaciones ambientales con foto y ubicación en un mapa.",
      },
    },
  },
  lab: {
    heading: "Dibuja un dígito y mira cómo lo lee la red.",
    text: "Pronto podrás probar aquí la red neuronal que escribí con NumPy, directamente en tu navegador: tu dibujo no sale de tu dispositivo.",
    status: "En construcción",
    linkLabel: "Probar la demo completa",
  },
  agent: {
    heading: "Pregúntale a mi asistente con IA.",
    text: "Responderá sobre mi experiencia y mis proyectos usando solo la información de este sitio. Si no sabe algo, lo dirá.",
    status: "En construcción",
    linkLabel: "Mientras tanto, escríbeme por LinkedIn",
  },
  contact: {
    heading: "Cuéntame qué necesitas.",
    text: "Pronto podrás abrir un ticket desde aquí y te responderé por correo. Por ahora, escríbeme por LinkedIn o revisa mi código en GitHub.",
    status: "Formulario en construcción",
    linkedinLabel: "LinkedIn",
    githubLabel: "GitHub",
  },
  footer: {
    rights: "© 2026 Johan Moreno",
    built: "Hecho con Next.js y desplegado en Vercel.",
  },
} satisfies Dictionary;
