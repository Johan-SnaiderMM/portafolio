/** Clases en el MISMO orden que las etiquetas del dataset y que la salida del modelo (0 cordana, 1 sana, 2 pestalotiopsis, 3 sigatoka). */
export const CLASES = ["cordana", "sana", "pestalotiopsis", "sigatoka"] as const;
export type Clase = (typeof CLASES)[number];

/** Fotos de ejemplo (del conjunto de PRUEBA del dataset, CC BY 4.0) que se sirven desde /lab/hojas/ejemplos/<clase>.jpg. */
export const EJEMPLOS: { clase: Clase; archivo: string }[] = CLASES.map((clase) => ({ clase, archivo: `/lab/hojas/ejemplos/${clase}.jpg` }));
