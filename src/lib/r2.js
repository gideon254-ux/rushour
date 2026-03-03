const R2_ACCOUNT_ID = import.meta.env.VITE_R2_ACCOUNT_ID || ''
const R2_ACCESS_KEY_ID = import.meta.env.VITE_R2_ACCESS_KEY_ID || ''
const R2_SECRET_ACCESS_KEY = import.meta.env.VITE_R2_SECRET_ACCESS_KEY || ''
const R2_BUCKET_NAME = import.meta.env.VITE_R2_BUCKET_NAME || 'rushour-files'

const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`

async function signRequest(url, method = 'GET') {
  const date = new Date().toUTCString()
  const authDate = date.split(',')[0] + ' UTC'
  
  const signature = await crypto.subtle.sign(
    'HMAC-SHA256',
    await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(R2_SECRET_ACCESS_KEY),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    ),
    new TextEncoder().encode(authDate)
  )
  
  const signatureHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  
  return {
    'Authorization': `AWS4-HMAC-SHA256 Credential=${R2_ACCESS_KEY_ID}/${authDate}/s3/aws4_request, SignedHeaders=host;x-amz-date, Signature=${signatureHex}`,
    'x-amz-date': authDate
  }
}

export async function uploadToR2(file, key) {
  const url = `${R2_ENDPOINT}/${R2_BUCKET_NAME}/${key}`
  
  const response = await fetch(url, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type
    }
  })
  
  return response.ok
}

export async function getSignedDownloadUrl(key, expiresIn = 3600) {
  const url = `${R2_ENDPOINT}/${R2_BUCKET_NAME}/${key}?X-Amz-Expires=${expiresIn}`
  
  const date = new Date()
  date.setSeconds(date.getSeconds() + expiresIn)
  const expiry = date.toISOString().split('.')[0] + 'Z'
  
  const headers = {
    'x-amz-expires': expiresIn.toString(),
    'x-amz-date': new Date().toISOString().split('.')[0].replace(/[-:]/g, '') + 'Z'
  }
  
  const stringToSign = `GET\n\n\n${expiry}\n/${R2_BUCKET_NAME}/${key}`
  
  const keyBytes = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode('AWS4' + R2_SECRET_ACCESS_KEY),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const dateKey = await crypto.subtle.sign('HMAC-SHA256', keyBytes, new TextEncoder().encode(headers['x-amz-date'].substring(0, 8)))
  const regionKey = await crypto.subtle.sign('HMAC-SHA256', dateKey, new TextEncoder().encode('us-east-1'))
  const serviceKey = await crypto.subtle.sign('HMAC-SHA256', regionKey, new TextEncoder().encode('s3'))
  const signingKey = await crypto.subtle.sign('HMAC-SHA256', serviceKey, new TextEncoder().encode('aws4_request'))
  
  const signature = await crypto.subtle.sign(
    'HMAC-SHA256',
    signingKey,
    new TextEncoder().encode(stringToSign)
  )
  
  const signatureHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  
  const signedUrl = `${url}&X-Amz-Signature=${signatureHex}`
  
  return signedUrl
}

export async function deleteFromR2(key) {
  const url = `${R2_ENDPOINT}/${R2_BUCKET_NAME}/${key}`
  
  const response = await fetch(url, {
    method: 'DELETE'
  })
  
  return response.ok
}

export { R2_BUCKET_NAME }
