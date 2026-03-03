const R2_ACCOUNT_ID = import.meta.env.VITE_R2_ACCOUNT_ID || ''
const R2_ACCESS_KEY_ID = import.meta.env.VITE_R2_ACCESS_KEY_ID || ''
const R2_SECRET_ACCESS_KEY = import.meta.env.VITE_R2_SECRET_ACCESS_KEY || ''
const R2_BUCKET_NAME = import.meta.env.VITE_R2_BUCKET_NAME || 'rushour-files'

const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`

async function hmac(key, data) {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC-SHA256', cryptoKey, new TextEncoder().encode(data))
  return new Uint8Array(signature)
}

async function sha256(data) {
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data))
  return new Uint8Array(hashBuffer)
}

async function getSignature(key, dateStamp, region, service) {
  const kDate = await hmac('AWS4' + key, dateStamp)
  const kRegion = await hmac(Array.from(kDate), region)
  const kService = await hmac(Array.from(kRegion), service)
  const kSigning = await hmac(Array.from(kService), 'aws4_request')
  return Array.from(kSigning).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function uploadToR2(file, key) {
  const date = new Date()
  const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, '').substring(0, 15)
  const dateStamp = amzDate.substring(0, 8)
  const region = 'auto'
  const service = 's3'
  
  const canonicalUri = `/${R2_BUCKET_NAME}/${key}`
  const canonicalQueryString = ''
  const headers = {
    'host': `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    'x-amz-date': amzDate,
    'x-amz-content-sha256': 'UNSIGNED-PAYLOAD'
  }
  
  const canonicalHeaders = Object.entries(headers)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join('\n') + '\n'
  
  const signedHeaders = Object.keys(headers).sort().join(';')
  
  const canonicalRequest = [
    'PUT',
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    'UNSIGNED-PAYLOAD'
  ].join('\n')
  
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    Array.from(await sha256(canonicalRequest)).map(b => b.toString(16).padStart(2, '0')).join('')
  ].join('\n')
  
  const signature = await getSignature(R2_SECRET_ACCESS_KEY, dateStamp, region, service)
  
  const authorizationHeader = [
    `AWS4-HMAC-SHA256 Credential=${R2_ACCESS_KEY_ID}/${credentialScope}`,
    `SignedHeaders=${signedHeaders}`,
    `Signature=${signature}`
  ].join(', ')
  
  const response = await fetch(`${R2_ENDPOINT}/${R2_BUCKET_NAME}/${key}`, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
      'x-amz-date': amzDate,
      'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
      'Authorization': authorizationHeader,
      'host': `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    }
  })
  
  return response.ok
}

export async function getSignedDownloadUrl(key, expiresIn = 3600) {
  const date = new Date()
  const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, '').substring(0, 15)
  const dateStamp = amzDate.substring(0, 8)
  const region = 'auto'
  const service = 's3'
  
  const expirySeconds = expiresIn
  const canonicalUri = `/${R2_BUCKET_NAME}/${key}`
  const canonicalQueryString = `X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=${R2_ACCESS_KEY_ID}%2F${dateStamp}%2F${region}%2F${service}%2Faws4_request&X-Amz-Date=${amzDate}&X-Amz-Expires=${expirySeconds}&X-Amz-SignedHeaders=host`
  
  const headers = {
    'host': `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
  }
  
  const canonicalHeaders = Object.entries(headers)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join('\n') + '\n'
  
  const signedHeaders = Object.keys(headers).sort().join(';')
  
  const canonicalRequest = [
    'GET',
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    'UNSIGNED-PAYLOAD'
  ].join('\n')
  
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    Array.from(await sha256(canonicalRequest)).map(b => b.toString(16).padStart(2, '0')).join('')
  ].join('\n')
  
  const signature = await getSignature(R2_SECRET_ACCESS_KEY, dateStamp, region, service)
  
  const signedUrl = `${R2_ENDPOINT}/${R2_BUCKET_NAME}/${key}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=${R2_ACCESS_KEY_ID}/${credentialScope}&X-Amz-Date=${amzDate}&X-Amz-Expires=${expirySeconds}&X-Amz-SignedHeaders=host&X-Amz-Signature=${signature}`
  
  return signedUrl
}

export { R2_BUCKET_NAME }
