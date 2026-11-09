import { NextResponse, type NextRequest } from "next/server";
import { negotiateLocale } from "./i18n/negotiate";

/**
 * `/` no tiene página propia: manda al visitante a /es o /en según el idioma
 * de su navegador. Es temporal (307) porque depende de la cabecera.
 */
export function proxy(request: NextRequest) {
  const locale = negotiateLocale(request.headers.get("accept-language"));
  const response = NextResponse.redirect(new URL(`/${locale}`, request.url), 307);
  response.headers.set("Vary", "Accept-Language");
  return response;
}

export const config = {
  matcher: "/",
};
