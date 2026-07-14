export async function limitRequestBody(
  request: Request,
  maxBytes: number,
): Promise<Request | Response> {
  const declaredLength = Number(request.headers.get("content-length"))
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    return Response.json({ error: "Request body is too large." }, { status: 413 })
  }
  if (!request.body) return request

  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let length = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    length += value.byteLength
    if (length > maxBytes) {
      await reader.cancel()
      return Response.json({ error: "Request body is too large." }, { status: 413 })
    }
    chunks.push(value)
  }

  const body = new Uint8Array(length)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }

  return new Request(request, { body: Uint8Array.from(body).buffer })
}
