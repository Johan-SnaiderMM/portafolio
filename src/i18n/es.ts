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
    heading: "Prueba los modelos: corren en tu navegador.",
    text: "Una red neuronal escrita con NumPy y un clasificador de hojas de banano. Tus dibujos y tus fotos se quedan en tu dispositivo.",
    digits: {
      title: "Red neuronal desde cero",
      kicker: "NumPy · retropropagación a mano · corre en tu navegador",
      intro:
        "Escribe un número de uno o de varios dígitos. La red se entrenó sin PyTorch ni TensorFlow y lo lee dígito por dígito.",
      help: "Escribe con el dedo o el mouse: un dígito o varios, separados entre sí (hasta unos 6; en celular caben unos 4). La red lee cuando haces una pausa.",
      canvasLabel: "Lienzo para escribir un número",
      clear: "Borrar",
      loading: "Cargando la red neuronal…",
      loadError: "No pude cargar el modelo. Recarga la página para intentarlo de nuevo.",
      empty: "Todavía no hay dibujo.",
      readsOne: "La red cree que es un",
      readsMany: "La red lee el número",
      glued:
        "Parece que hay dígitos pegados. Sepáralos un poco: la red solo lee un dígito a la vez.",
      doubtOne:
        "La red no está muy segura del dígito {list}: prueba con un trazo más grande y claro.",
      doubtMany:
        "La red no está muy segura de los dígitos {list}: prueba con un trazo más grande y claro.",
      detectedLabel: "Dígitos detectados",
      digitN: "Dígito {n}",
      unreliable: "no fiable",
      gluedBox:
        "Este recuadro parece tener más de un dígito, así que no se muestran probabilidades: la red solo sabe leer uno.",
      probsTitle: "Probabilidad de cada dígito para el dígito {n}",
      probsHint: "(toca otra ficha para cambiar)",
      probsLabel: "Probabilidad de cada dígito",
      how: "Cada recuadro es un dígito que encontró la red: se recorta, se reduce a 28×28 píxeles y se centra, igual que las imágenes con las que se entrenó (las miniaturas). Por debajo de {pct} de seguridad, la red avisa que duda.",
      model:
        "Red {arch} · {params} parámetros · {acc} de acierto en las 10 000 imágenes de prueba de MNIST (un dígito aislado).",
      privacy: "Tu dibujo no sale de tu dispositivo.",
      seeProject: "Ver el proyecto",
    },
    leaves: {
      title: "Hojas de banano: detector de enfermedades",
      kicker: "PyTorch · MobileNetV2 · ONNX · corre en tu navegador",
      intro:
        "Una foto de una hoja de banano y un modelo de visión por computador te dice si parece sana o con Sigatoka, Cordana o Pestalotiopsis. Nace de mi interés por Urabá, zona bananera.",
      takePhoto: "Tomar foto",
      pickImage: "Elegir imagen",
      placeholder: "Sube o toma una foto de cerca de una hoja de banano.",
      canvasLabel: "Foto que analiza el modelo, recortada en cuadrado",
      examplesHint: "¿No tienes una hoja a la mano? Prueba con una foto de ejemplo:",
      downloadNote:
        "La primera vez que analices una foto se descargan unos 24 MB (el modelo y WebAssembly). Antes de eso no se descarga nada.",
      idle: "El resultado aparecerá aquí. La foto no sale de tu dispositivo.",
      preparing: "Preparando el modelo (≈ 24 MB, solo la primera vez)…",
      analyzing: "Analizando la hoja…",
      errorImage: "No pude preparar la imagen.",
      errorExample: "No pude cargar la foto de ejemplo.",
      errorAnalyze: "No pude analizar la imagen.",
      thinksIt: "El modelo cree que es:",
      lowConfidence:
        "Seguridad baja ({pct}): prueba con otra foto, de cerca, con buena luz y la hoja ocupando el cuadro.",
      probsLabel: "Probabilidad de cada clase",
      privacy: "Tu foto no sale de tu dispositivo.",
      classes: {
        cordana: {
          name: "Cordana (mancha foliar)",
          short: "Cordana",
          description:
            "Mancha de la hoja causada por el hongo Cordana: lesiones ovaladas de centro pardo, a menudo con un halo amarillo.",
        },
        sana: {
          name: "Hoja sana",
          short: "Hoja sana",
          description:
            "No se ven las manchas de las tres enfermedades que conoce el modelo.",
        },
        pestalotiopsis: {
          name: "Pestalotiopsis (tizón foliar)",
          short: "Pestalotiopsis",
          description:
            "Tizón de la hoja causado por hongos del género Pestalotiopsis: lesiones secas e irregulares que van avanzando sobre la hoja.",
        },
        sigatoka: {
          name: "Sigatoka",
          short: "Sigatoka",
          description:
            "Enfermedad foliar causada por hongos (Pseudocercospora): rayas y manchas oscuras que van secando la hoja.",
        },
      },
      model:
        "{acc} de acierto en {n} fotos de prueba que el modelo nunca vio (intervalo de confianza 95 %: {low}–{high}) · F1 macro {f1} · {params} M de parámetros.",
      limitsTitle: "Límites: léelos antes de confiar en el resultado",
      limits: [
        "Se entrenó con fotos de hojas de banano tomadas en Bangladesh (BananaLSD). No se ha validado con fotos de Urabá ni de Colombia: otras variedades, climas y cámaras pueden bajar la precisión.",
        "Solo conoce tres enfermedades y la hoja sana. Si la foto no es de una hoja de banano, igual responderá con una de las cuatro.",
        "El conjunto de prueba es pequeño ({n} fotos): por eso el intervalo es ancho. Es una estimación, no una garantía.",
        "Es una herramienta educativa: no sustituye el diagnóstico de un técnico agropecuario.",
      ],
      credit:
        "Fotos y etiquetas: BananaLSD, Arman et al. (2023), Mendeley Data, licencia CC BY 4.0. Las fotos de ejemplo salen de ese conjunto.",
      seeProject: "Ver el proyecto",
    },
  },
  agent: {
    heading: "Pregúntale a mi asistente con IA.",
    text: "Responde sobre mi experiencia y mis proyectos usando solo la información de este sitio. Si no sabe algo, lo dice.",
    title: "Asistente con IA",
    welcome:
      "Hola, soy el asistente con IA de este portafolio. Pregúntame por la experiencia, los proyectos o las tecnologías de Johan.",
    disclosure:
      "Es una IA y puede equivocarse. No guardo las conversaciones, pero el modelo (Groq o Google) las procesa: no escribas datos personales.",
    suggestionsLabel: "Preguntas para empezar",
    suggestions: [
      "¿Qué proyectos destacan y qué midió Johan en cada uno?",
      "¿Qué tecnologías usa?",
      "¿Qué tanto sabe de IA y aprendizaje automático?",
      "¿Está buscando trabajo?",
    ],
    inputLabel: "Tu pregunta",
    placeholder: "Escribe tu pregunta sobre Johan…",
    send: "Enviar",
    thinking: "Pensando…",
    reset: "Nueva conversación",
    you: "Tú",
    assistant: "Asistente",
    counter: "{n}/{max}",
    contactCta: "Escríbele a Johan por LinkedIn",
    errors: {
      rate: "Hiciste varias preguntas seguidas. Espera unos minutos y vuelve a intentarlo.",
      daily: "Hoy ya se usaron todas las preguntas del asistente. Vuelve mañana.",
      quota: "La cuota gratuita del asistente se agotó por ahora. Intenta más tarde.",
      unavailable: "El asistente no está disponible en este momento.",
      network: "No pude conectarme. Revisa tu conexión e inténtalo de nuevo.",
      tooLong: "Tu mensaje es muy largo: el máximo es {max} caracteres.",
      generic: "Algo falló al responder. Inténtalo de nuevo.",
    },
  },
  contact: {
    heading: "Abre un ticket y cuéntame qué necesitas.",
    text: "Una vacante, un proyecto o una duda: escríbeme y te respondo por correo. Cada mensaje recibe un código de ticket.",
    linkedinLabel: "LinkedIn",
    githubLabel: "GitHub",
    alsoOn: "También en",
    form: {
      name: "Tu nombre",
      email: "Tu correo",
      subject: "Asunto",
      priority: "Prioridad",
      priorities: { low: "Baja", normal: "Normal", high: "Alta" },
      message: "Mensaje",
      messageHint: "Cuéntame el contexto: empresa, cargo o proyecto, y para cuándo.",
      send: "Enviar ticket",
      sending: "Enviando…",
      counter: "{n}/{max}",
      privacy: "Tu correo solo se usa para responderte. El sitio no guarda el mensaje; solo llega a mi bandeja.",
    },
    success: {
      title: "Ticket {id} enviado",
      text: "Te responderé al correo que dejaste. Guarda el código por si quieres referirte a este mensaje.",
      another: "Enviar otro ticket",
    },
    errors: {
      name: "Escribe tu nombre (2 a 80 caracteres).",
      email: "Revisa tu correo: parece incompleto.",
      subject: "El asunto debe tener entre 3 y 100 caracteres.",
      priority: "Elige una prioridad.",
      message: "El mensaje debe tener entre 10 y 1500 caracteres.",
      rate: "Enviaste varios tickets seguidos. Espera un rato o escríbeme por LinkedIn.",
      unavailable: "No pude enviar el ticket en este momento. Escríbeme por LinkedIn mientras lo arreglo.",
      network: "No pude conectarme. Revisa tu conexión e inténtalo de nuevo.",
      generic: "Algo falló al enviar. Inténtalo de nuevo.",
    },
  },
  footer: {
    rights: "© 2026 Johan Moreno",
    built: "Hecho con Next.js y desplegado en Vercel.",
  },
} satisfies Dictionary;
