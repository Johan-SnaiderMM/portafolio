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
    detail: {
      seeDetail: "Ver el proyecto",
      back: "Todos los proyectos",
      highlightsTitle: "Qué hace y cómo está hecho",
      stackTitle: "Tecnologías",
      limitsTitle: "Límites",
      previous: "Anterior",
      next: "Siguiente",
      navLabel: "Más proyectos",
    },
    note: "98,1 % es con un dígito aislado de MNIST; los números de varios dígitos se midieron con secuencias sintéticas (86,5 % bien). Las demos usan datos inventados.",
    featured: {
      "mesa-ayuda": {
        name: "Mesa de ayuda TI",
        summary:
          "Sistema de tickets de soporte, como un osTicket moderno: tres roles, estados que se validan, asignación, comentarios internos y un panel de métricas de SLA.",
        metricValue: "294",
        metricLabel: "pruebas automáticas, 108 de ellas contra PostgreSQL real",
        lead: "Sistema de tickets de soporte, como un osTicket moderno, que armé para aprender y practicar Angular y NestJS: API en NestJS 12 con Prisma y PostgreSQL, y web en Angular 22 con Material.",
        highlights: [
          "Tres roles (solicitante, agente y administrador) y estados que se validan: abierto, en progreso, en espera, resuelto y cerrado, con nota y responsable obligatorios según el caso.",
          "Asignación, comentarios internos, historial de cada ticket y un panel de métricas de SLA: cumplimiento, tiempos de resolución, vencidos y carga por agente.",
          "Si dos agentes cambian el mismo ticket a la vez, solo gana uno. La API decide qué puede hacer cada rol y la web solo muestra eso.",
          "294 pruebas automáticas: 64 unitarias y 108 de integración contra PostgreSQL real en la API, y 122 en la web. Integración continua con GitHub Actions, despliegue en Vercel con la base en Neon, JWT y contraseñas con argon2.",
        ],
        limits:
          "Es un proyecto de portafolio: la demo usa datos ficticios, también las cifras del panel, y tiene cuentas de demostración de un clic. La API gratuita puede tardar hasta un minuto en despertar la primera vez.",
        coverAlt: "Panel de la mesa de ayuda TI con las métricas de SLA",
      },
      "red-neuronal": {
        name: "Red neuronal desde cero",
        summary:
          "Un perceptrón multicapa escrito con NumPy, sin PyTorch ni TensorFlow: retropropagación, Adam e inicialización de He a mano. La demo corre en el navegador y lee lo que dibujas.",
        metricValue: "98,1 %",
        metricLabel: "de acierto en las 10 000 imágenes de prueba de MNIST",
        lead: "Una red neuronal que escribí con NumPy, sin PyTorch ni TensorFlow, para entender cómo aprende una red.",
        highlights: [
          "Perceptrón multicapa 784-128-64-10 con retropropagación, optimizador Adam e inicialización de He programados a mano.",
          "Verifiqué los gradientes contra diferencias finitas (error del orden de 1e-10) y contrasté el resultado con la misma red en PyTorch, que llega a 97,8 %.",
          "La demo corre en el navegador, sin servidor: dibujas un número y la red lo lee dígito por dígito. Tu dibujo no sale de tu dispositivo.",
          "Para dígitos sueltos acierta 98,1 % en las 10 000 imágenes de prueba de MNIST; los números de varios dígitos se midieron con secuencias sintéticas (86,5 % bien).",
        ],
        limits:
          "Es un proyecto de aprendizaje, no un producto.",
        coverAlt: "Demo de la red neuronal leyendo el número 73 dibujado a mano",
      },
      "hojas-banano": {
        name: "Clasificador de hojas de banano",
        summary:
          "Dice si una hoja está sana o tiene Sigatoka, Cordana o Pestalotiopsis. Corre en el navegador y la foto no sale de tu dispositivo. Se entrenó con fotos de Bangladesh y falta validarlo con hojas de Urabá.",
        metricValue: "98,5 %",
        metricLabel: "de acierto en 134 fotos de prueba",
        lead: "Clasificador de imágenes que dice si una hoja de banano parece sana o con Sigatoka, Cordana o Pestalotiopsis. Nace de mi interés por Urabá, zona bananera.",
        highlights: [
          "Transfer learning con MobileNetV2 preentrenada en ImageNet (PyTorch), sobre BananaLSD, un dataset público de 937 fotos.",
          "Exportado a ONNX para que corra en el navegador con onnxruntime-web: la foto no sale de tu dispositivo.",
          "Evaluación cuidada: agrupé las fotos duplicadas para que ninguna copia quedara en entrenamiento y prueba, no usé las imágenes aumentadas del dataset y miré el conjunto de prueba una sola vez.",
          "98,5 % de acierto en 134 fotos de prueba (intervalo de confianza del 95 %: 96,3 a 100 %). Los dos errores fueron hojas enfermas clasificadas como sanas.",
        ],
        limits:
          "Las fotos son de Bangladesh y todavía no lo he validado con hojas de Urabá. Es un proyecto educativo, no una herramienta de diagnóstico.",
        coverAlt: "Demo del clasificador con una foto de ejemplo de hoja de banano",
      },
      origenes: {
        name: "Orígenes",
        summary:
          "Plataforma para preservar la memoria histórica de Urabá: escenas 360°, realidad aumentada y Aruma, una avatar historiadora con IA (Llama 3.3 con contexto por escena y voz neuronal).",
        metricValue: "Proyecto de grado",
        metricLabel: "Universidad Católica Luis Amigó",
        lead: "Plataforma inmersiva para preservar, digitalizar y revivir la memoria histórica de Urabá, donde los relatos orales y los registros se pierden con el tiempo. Fue mi proyecto de grado.",
        highlights: [
          "Visor de escenas 360° (imágenes equirectangulares), realidad aumentada en la web y modelos 3D con Three.js y model-viewer.",
          "Aruma, una avatar historiadora con IA: Llama 3.3 70B por la API de Groq, con los datos del momento histórico que se está viendo inyectados en el prompt del servidor (un mini-RAG) para que no invente, y voz neuronal de Azure.",
          "Audios un 75 % más livianos para el celular (MP3 a 32 kbps), degradación elegante si el servicio de voz falla y un límite de 3 peticiones por minuto por IP.",
          "Muro comunitario (relatos, comentarios anidados, me gusta, reportes para moderar) y panel de administración protegido con JWT y registro de auditoría.",
        ],
        limits:
          "Es una plataforma en línea con cuentas: para entrar hay que registrarse (con verificación por correo), así que el enlace del sitio lleva al inicio de sesión.",
        coverAlt: "Esquema de un panorama 360° con la marca de Orígenes",
      },
      comanda: {
        name: "Comanda",
        summary:
          "App para restaurantes pequeños: pedidos por mesa, para llevar y domicilio, fiado, gastos y cierre del día. Funciona sin conexión. La demo usa datos ficticios.",
        metricValue: "En uso real",
        metricLabel: "en un restaurante",
        lead: "App para dueños de locales pequeños de comida rápida y carnes a la plancha en Colombia. Hay una versión real en uso en un negocio (su repositorio es privado) y una demo pública con datos ficticios.",
        highlights: [
          "Pedidos por mesa, para llevar y a domicilio; cobro en efectivo, Nequi, mixto o fiado; gastos y cierre del día con el resumen por WhatsApp.",
          "Pedidos en línea sin cuenta: el cliente abre el enlace o el QR del local, arma su pedido y lo sigue en vivo. Nada llega a la cocina hasta que el dueño lo acepta.",
          "Pantalla de plancha: cada plato es un botón grande y el pedido pasa solo a «listo» cuando todos lo están.",
          "Pensada primero para un celular Android de gama media, con una mano: botones de 48 px, texto de 16 px y funcionamiento sin conexión.",
        ],
        limits:
          "La demo pública usa datos inventados y el código que enlazo es el de la demo; la versión que usa el negocio es privada.",
        coverAlt: "Pantalla de inicio de Comanda en un celular",
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
