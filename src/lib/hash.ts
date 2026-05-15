export async function generarHashRecibo(params: {
  vendedorId: string
  clienteId: string
  monto: number
  timestamp: number
  nonce: string
}): Promise<string> {
  const data = `${params.vendedorId}|${params.clienteId}|${params.monto}|${params.timestamp}|${params.nonce}`
  const encoder = new TextEncoder()
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(data))
  const hashArray = Array.from(new Uint8Array(buffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()
}

export function generarNonce(): string {
  return crypto.randomUUID().replace(/-/g, '').substring(0, 8).toUpperCase()
}
