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
    detail: {
      seeDetail: "See the project",
      back: "All projects",
      highlightsTitle: "What it does and how it's built",
      stackTitle: "Technologies",
      limitsTitle: "Limits",
      previous: "Previous",
      next: "Next",
      navLabel: "More projects",
    },
    note: "98.1% is on a single MNIST digit; multi-digit numbers were measured on synthetic sequences (86.5% correct). The demos use made-up data.",
    featured: {
      "mesa-ayuda": {
        name: "IT help desk",
        summary:
          "Support ticket system, like a modern osTicket: three roles, validated states, assignment, internal comments and an SLA metrics dashboard.",
        metricValue: "294",
        metricLabel: "automated tests, 108 of them against a real PostgreSQL",
        lead: "A support ticket system, like a modern osTicket, that I built to learn and practice Angular and NestJS: a NestJS 12 API with Prisma and PostgreSQL, and an Angular 22 web app with Material.",
        highlights: [
          "Three roles (requester, agent and administrator) and validated states: open, in progress, on hold, resolved and closed, with a note and an owner required where it matters.",
          "Assignment, internal comments, a history for every ticket and an SLA metrics dashboard: compliance, resolution times, overdue tickets and workload per agent.",
          "If two agents change the same ticket at once, only one wins. The API decides what each role can do and the web app only shows that.",
          "294 automated tests: 64 unit and 108 integration tests against a real PostgreSQL in the API, and 122 in the web app. Continuous integration with GitHub Actions, deployed on Vercel with the database on Neon, JWT and argon2 password hashing.",
        ],
        limits:
          "It's a portfolio project: the demo uses fictitious data, dashboard figures included, and has one-click demo accounts. The free API can take up to a minute to wake up the first time.",
        coverAlt: "IT help desk dashboard with SLA metrics",
      },
      "red-neuronal": {
        name: "Neural network from scratch",
        summary:
          "A multilayer perceptron written with NumPy, no PyTorch or TensorFlow: backpropagation, Adam and He initialization by hand. The demo runs in the browser and reads what you draw.",
        metricValue: "98.1%",
        metricLabel: "accuracy on the 10,000 MNIST test images",
        lead: "A neural network I wrote with NumPy, with no PyTorch or TensorFlow, to understand how a network learns.",
        highlights: [
          "784-128-64-10 multilayer perceptron with backpropagation, the Adam optimizer and He initialization, all coded by hand.",
          "I checked the gradients against finite differences (error around 1e-10) and compared the result with the same network in PyTorch, which reaches 97.8%.",
          "The demo runs in the browser, with no server: you draw a number and the network reads it digit by digit. Your drawing never leaves your device.",
          "On single digits it reaches 98.1% on the 10,000 MNIST test images; multi-digit numbers were measured on synthetic sequences (86.5% correct).",
        ],
        limits: "It's a learning project, not a product.",
        coverAlt: "Neural network demo reading the handwritten number 73",
      },
      "hojas-banano": {
        name: "Banana leaf classifier",
        summary:
          "Tells whether a leaf is healthy or has Sigatoka, Cordana or Pestalotiopsis. It runs in the browser and your photo never leaves your device. Trained on photos from Bangladesh; still to be validated with leaves from Urabá.",
        metricValue: "98.5%",
        metricLabel: "accuracy on 134 test photos",
        lead: "An image classifier that tells whether a banana leaf looks healthy or has Sigatoka, Cordana or Pestalotiopsis. It comes from my interest in Urabá, a banana-growing region.",
        highlights: [
          "Transfer learning with MobileNetV2 pretrained on ImageNet (PyTorch), on BananaLSD, a public dataset of 937 photos.",
          "Exported to ONNX so it runs in the browser with onnxruntime-web: your photo never leaves your device.",
          "Careful evaluation: I grouped duplicate photos so no copy ended up in both training and test, left out the dataset's augmented images and looked at the test set only once.",
          "98.5% accuracy on 134 test photos (95% confidence interval: 96.3 to 100%). Both errors were diseased leaves classified as healthy.",
        ],
        limits:
          "The photos are from Bangladesh and I haven't validated it with leaves from Urabá yet. It's an educational project, not a diagnostic tool.",
        coverAlt: "Classifier demo with an example banana leaf photo",
      },
      origenes: {
        name: "Orígenes",
        summary:
          "Platform to preserve the historical memory of Urabá: 360° scenes, augmented reality and Aruma, an AI historian avatar (Llama 3.3 with per-scene context and a neural voice).",
        metricValue: "Capstone project",
        metricLabel: "Universidad Católica Luis Amigó",
        lead: "An immersive platform to preserve, digitize and revive the historical memory of Urabá, where oral stories and records fade with time. It was my capstone project.",
        highlights: [
          "360° scene viewer (equirectangular images), web augmented reality and 3D models with Three.js and model-viewer.",
          "Aruma, an AI historian avatar: Llama 3.3 70B through the Groq API, with the data of the historical moment being viewed injected into the server prompt (a mini-RAG) so it doesn't make things up, and an Azure neural voice.",
          "Audio files 75% lighter for phones (MP3 at 32 kbps), graceful degradation if the voice service fails and a limit of 3 requests per minute per IP.",
          "Community wall (stories, nested comments, likes, moderation reports) and an admin panel protected with JWT and an audit log.",
        ],
        limits:
          "It's an online platform with accounts: you have to sign up (with email verification) to get in, so the site link leads to the login page.",
        coverAlt: "Diagram of a 360° panorama with the Orígenes mark",
      },
      comanda: {
        name: "Comanda",
        summary:
          "App for small restaurants: table, takeaway and delivery orders, customer tabs, expenses and end-of-day closing. Works offline. The demo uses fictitious data.",
        metricValue: "In real use",
        metricLabel: "at a restaurant",
        lead: "An app for owners of small fast-food and grill restaurants in Colombia. A real version is in use at one business (its repository is private) and there's a public demo with fictitious data.",
        highlights: [
          "Table, takeaway and delivery orders; payment in cash, Nequi, mixed or on credit; expenses and an end-of-day closing with the summary sent over WhatsApp.",
          "Online orders without an account: customers open the restaurant's link or QR, build their order and follow it live. Nothing reaches the kitchen until the owner accepts it.",
          "Grill screen: every dish is a big button and the order flips to “ready” on its own when all of them are.",
          "Designed first for a mid-range Android phone, one-handed: 48 px buttons, 16 px text and offline operation.",
        ],
        limits:
          "The public demo uses made-up data and the code I link is the demo's; the version the business uses is private.",
        coverAlt: "Comanda home screen on a phone",
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
    heading: "Try the models: they run in your browser.",
    text: "A neural network written with NumPy and a banana-leaf classifier. Your drawings and photos stay on your device.",
    digits: {
      title: "Neural network from scratch",
      kicker: "NumPy · backpropagation by hand · runs in your browser",
      intro:
        "Write a number with one or several digits. The network was trained without PyTorch or TensorFlow and reads it one digit at a time.",
      help: "Write with your finger or the mouse: one digit or several, kept apart (about 6 fit; about 4 on a phone). The network reads when you pause.",
      canvasLabel: "Canvas to write a number",
      clear: "Clear",
      loading: "Loading the neural network…",
      loadError: "I couldn't load the model. Reload the page to try again.",
      empty: "Nothing drawn yet.",
      readsOne: "The network thinks it's a",
      readsMany: "The network reads the number",
      glued:
        "Some digits seem to be touching. Pull them apart a little: the network reads one digit at a time.",
      doubtOne:
        "The network isn't very sure about digit {list}: try a bigger, clearer stroke.",
      doubtMany:
        "The network isn't very sure about digits {list}: try a bigger, clearer stroke.",
      detectedLabel: "Detected digits",
      digitN: "Digit {n}",
      unreliable: "unreliable",
      gluedBox:
        "This box seems to hold more than one digit, so no probabilities are shown: the network can only read one.",
      probsTitle: "Probability of each digit for digit {n}",
      probsHint: "(tap another tile to switch)",
      probsLabel: "Probability of each digit",
      how: "Each box is a digit the network found: it is cropped, shrunk to 28×28 pixels and centred, just like the images it was trained on (the thumbnails). Below {pct} confidence, the network says it doubts.",
      model:
        "Network {arch} · {params} parameters · {acc} accuracy on the 10,000 MNIST test images (a single isolated digit).",
      privacy: "Your drawing never leaves your device.",
      seeProject: "See the project",
    },
    leaves: {
      title: "Banana leaves: disease detector",
      kicker: "PyTorch · MobileNetV2 · ONNX · runs in your browser",
      intro:
        "A photo of a banana leaf and a computer-vision model tells you whether it looks healthy or shows Sigatoka, Cordana or Pestalotiopsis. It comes from my interest in Urabá, a banana-growing region.",
      takePhoto: "Take photo",
      pickImage: "Choose image",
      placeholder: "Upload or take a close-up photo of a banana leaf.",
      canvasLabel: "Photo the model analyses, cropped to a square",
      examplesHint: "No leaf at hand? Try an example photo:",
      downloadNote:
        "The first time you analyse a photo, about 24 MB are downloaded (the model and WebAssembly). Nothing is downloaded before that.",
      idle: "The result will appear here. Your photo never leaves your device.",
      preparing: "Preparing the model (≈ 24 MB, first time only)…",
      analyzing: "Analysing the leaf…",
      errorImage: "I couldn't prepare the image.",
      errorExample: "I couldn't load the example photo.",
      errorAnalyze: "I couldn't analyse the image.",
      thinksIt: "The model thinks it is:",
      lowConfidence:
        "Low confidence ({pct}): try another photo, close up, in good light, with the leaf filling the frame.",
      probsLabel: "Probability of each class",
      privacy: "Your photo never leaves your device.",
      classes: {
        cordana: {
          name: "Cordana (leaf spot)",
          short: "Cordana",
          description:
            "Leaf spot caused by the Cordana fungus: oval lesions with a brown centre, often with a yellow halo.",
        },
        sana: {
          name: "Healthy leaf",
          short: "Healthy leaf",
          description:
            "None of the spots of the three diseases the model knows are visible.",
        },
        pestalotiopsis: {
          name: "Pestalotiopsis (leaf blight)",
          short: "Pestalotiopsis",
          description:
            "Leaf blight caused by fungi of the Pestalotiopsis genus: dry, irregular lesions that spread across the leaf.",
        },
        sigatoka: {
          name: "Sigatoka",
          short: "Sigatoka",
          description:
            "Leaf disease caused by fungi (Pseudocercospora): dark streaks and spots that gradually dry the leaf.",
        },
      },
      model:
        "{acc} accuracy on {n} test photos the model never saw (95% confidence interval: {low}–{high}) · macro F1 {f1} · {params} M parameters.",
      limitsTitle: "Limits: read them before trusting the result",
      limits: [
        "It was trained on banana-leaf photos taken in Bangladesh (BananaLSD). It has not been validated on photos from Urabá or Colombia: other varieties, climates and cameras can lower accuracy.",
        "It only knows three diseases and the healthy leaf. If the photo isn't a banana leaf, it will still answer with one of the four.",
        "The test set is small ({n} photos), which is why the interval is wide. It is an estimate, not a guarantee.",
        "It is an educational tool: it does not replace the diagnosis of an agricultural technician.",
      ],
      credit:
        "Photos and labels: BananaLSD, Arman et al. (2023), Mendeley Data, CC BY 4.0 licence. The example photos come from that set.",
      seeProject: "See the project",
    },
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
