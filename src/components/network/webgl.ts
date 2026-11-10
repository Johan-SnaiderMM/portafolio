/**
 * Comprueba si el navegador puede crear un contexto WebGL, sin cargar Three.js
 * (que escribe errores en la consola cuando falla) y sin descargar el *chunk*
 * de 132 kB si de todos modos no va a servir.
 *
 * Por defecto exige aceleración por hardware (`failIfMajorPerformanceCaveat`):
 * WebGL por software, en equipos sin controlador gráfico, sería una escena a
 * saltos. Con `allowSoftware` (`?3d=on`) también se acepta.
 */
export function hasWebGL(allowSoftware: boolean): boolean {
  const attempt = (strict: boolean) => {
    try {
      const canvas = document.createElement("canvas");
      const options = { failIfMajorPerformanceCaveat: strict };
      const gl = (canvas.getContext("webgl2", options) ??
        canvas.getContext("webgl", options)) as
        | WebGLRenderingContext
        | WebGL2RenderingContext
        | null;
      if (!gl) return false;
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      return true;
    } catch {
      return false;
    }
  };
  return attempt(true) || (allowSoftware && attempt(false));
}
