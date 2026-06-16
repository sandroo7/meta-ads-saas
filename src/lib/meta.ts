/**
 * Helpers de la Graph API de Meta (Marketing API).
 * Versión de la API alineada con tu script de Python.
 */

const API_VERSION = "v21.0";
const GRAPH = `https://graph.facebook.com/${API_VERSION}`;

const APP_ID = process.env.META_APP_ID!;
const APP_SECRET = process.env.META_APP_SECRET!;
const REDIRECT_URI = process.env.META_REDIRECT_URI!;
// Facebook Login for Business usa un config_id en vez de permisos sueltos.
const CONFIG_ID = process.env.META_CONFIG_ID;

// Permisos (solo se usan con Facebook Login clásico, sin config_id).
const SCOPES = [
  "ads_management",
  "ads_read",
  "business_management",
  "pages_show_list",
  "pages_read_engagement",
  "instagram_basic",
].join(",");

/** URL del diálogo de login de Facebook (a donde mandamos al usuario). */
export function getOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: APP_ID,
    redirect_uri: REDIRECT_URI,
    state,
    response_type: "code",
  });
  if (CONFIG_ID) {
    // Facebook Login for Business (lo que tienes configurado).
    params.set("config_id", CONFIG_ID);
  } else {
    // Facebook Login clásico.
    params.set("scope", SCOPES);
  }
  return `https://www.facebook.com/${API_VERSION}/dialog/oauth?${params.toString()}`;
}

/** Canjea el `code` del callback por un token de corta duración. */
export async function exchangeCodeForToken(code: string): Promise<string> {
  const params = new URLSearchParams({
    client_id: APP_ID,
    redirect_uri: REDIRECT_URI,
    client_secret: APP_SECRET,
    code,
  });
  const res = await fetch(`${GRAPH}/oauth/access_token?${params.toString()}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? "Error al obtener el token");
  return data.access_token as string;
}

/** Cambia el token corto por uno de larga duración (~60 días). */
export async function exchangeForLongLived(
  shortToken: string
): Promise<{ token: string; expiresIn?: number }> {
  const params = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: APP_ID,
    client_secret: APP_SECRET,
    fb_exchange_token: shortToken,
  });
  const res = await fetch(`${GRAPH}/oauth/access_token?${params.toString()}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? "Error al canjear el token largo");
  return { token: data.access_token as string, expiresIn: data.expires_in as number | undefined };
}

/** Datos básicos del usuario de Facebook dueño del token. */
export async function getMetaUser(token: string): Promise<{ id: string; name: string }> {
  const res = await fetch(`${GRAPH}/me?fields=id,name&access_token=${token}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? "Error al leer el usuario");
  return data;
}

/** Lista las cuentas de anuncios a las que el usuario tiene acceso. */
export async function getAdAccounts(
  token: string
): Promise<{ account_id: string; name: string; currency: string; id: string }[]> {
  const res = await fetch(
    `${GRAPH}/me/adaccounts?fields=account_id,name,currency&limit=200&access_token=${token}`
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? "Error al listar las cuentas");
  return data.data ?? [];
}

/** Campañas ACTIVAS de una cuenta. adAccountId con prefijo act_. */
export async function getCampaigns(
  token: string,
  adAccountId: string
): Promise<{ id: string; name: string; status: string }[]> {
  const res = await fetch(
    `${GRAPH}/${adAccountId}/campaigns?fields=id,name,status,effective_status&limit=500&access_token=${token}`
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? "Error al listar campañas");
  return (data.data ?? []).filter(
    (c: { status: string }) => c.status === "ACTIVE"
  );
}

/** Ad sets ACTIVOS de una campaña. */
export async function getAdSets(
  token: string,
  campaignId: string
): Promise<{ id: string; name: string; status: string }[]> {
  const res = await fetch(
    `${GRAPH}/${campaignId}/adsets?fields=id,name,status,effective_status&limit=500&access_token=${token}`
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? "Error al listar ad sets");
  return (data.data ?? []).filter(
    (a: { status: string }) => a.status === "ACTIVE"
  );
}

type Pagina = { id: string; name: string; ig_id: string; ig_user: string };

function _mapPages(arr: unknown[]): Pagina[] {
  return (arr as Record<string, unknown>[]).map((p) => {
    const ig = (p.instagram_business_account ?? {}) as Record<string, string>;
    return {
      id: String(p.id),
      name: String(p.name ?? "?"),
      ig_id: ig.id ?? "",
      ig_user: ig.username ?? "",
    };
  });
}

/**
 * Páginas disponibles para la cuenta (las que puede promocionar),
 * con su cuenta de Instagram vinculada. Si no hay, cae a las del usuario.
 */
export async function getPages(token: string, adAccountId: string): Promise<Pagina[]> {
  const fields = "id,name,instagram_business_account{id,username}";
  try {
    const res = await fetch(
      `${GRAPH}/${adAccountId}/promote_pages?fields=${fields}&limit=200&access_token=${token}`
    );
    const data = await res.json();
    if (res.ok && Array.isArray(data.data) && data.data.length > 0) {
      return _mapPages(data.data);
    }
  } catch {
    // ignora y prueba el fallback
  }
  // Fallback: páginas del propio usuario
  const res2 = await fetch(
    `${GRAPH}/me/accounts?fields=${fields}&limit=200&access_token=${token}`
  );
  const data2 = await res2.json();
  if (!res2.ok) throw new Error(data2.error?.message ?? "Error al listar páginas");
  return _mapPages(data2.data ?? []);
}

/**
 * Cuentas de Instagram disponibles para la cuenta de anuncios:
 * combina las vinculadas a la cuenta y las vinculadas a sus páginas.
 */
export async function getInstagramAccounts(
  token: string,
  adAccountId: string
): Promise<{ id: string; username: string }[]> {
  const map = new Map<string, { id: string; username: string }>();

  // 1) IG conectadas a la cuenta de anuncios
  try {
    const res = await fetch(
      `${GRAPH}/${adAccountId}/instagram_accounts?fields=id,username&limit=200&access_token=${token}`
    );
    const data = await res.json();
    if (res.ok) {
      for (const a of data.data ?? []) {
        map.set(a.id, { id: a.id, username: a.username ?? "" });
      }
    }
  } catch {
    // ignora
  }

  // 2) IG vinculadas a las páginas de la cuenta
  try {
    const pages = await getPages(token, adAccountId);
    for (const p of pages) {
      if (p.ig_id) map.set(p.ig_id, { id: p.ig_id, username: p.ig_user });
    }
  } catch {
    // ignora
  }

  return [...map.values()];
}

/**
 * Crea una campaña básica (en pausa) en la cuenta indicada.
 * adAccountId debe llevar el prefijo act_ (ej. act_123456).
 */
export async function createCampaign(
  token: string,
  adAccountId: string,
  name: string,
  objective = "OUTCOME_TRAFFIC"
): Promise<string> {
  const body = new URLSearchParams({
    name,
    objective,
    status: "PAUSED",
    special_ad_categories: JSON.stringify([]),
    access_token: token,
  });
  const res = await fetch(`${GRAPH}/${adAccountId}/campaigns`, {
    method: "POST",
    body,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? "Error al crear la campaña");
  return data.id as string;
}
