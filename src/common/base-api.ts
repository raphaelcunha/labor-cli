import fetch, { Response } from 'node-fetch'
import Config from '../config'

export const root = 'https://api.getlabor.com.br'

export type ResponseType = Response

function stripLeadingSlash(uri: string): string {
  if (uri.startsWith('/')) return uri.slice(1)
  return uri
}

function toDataURL(data: object): string {
  return Object.entries(data || {})
    .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
    .join('&')
}

async function failUnauthorized(response: Response): Promise<Response> {
  if (!response.ok && !response.body && response.status === 401) {
    return Promise.reject({ reauth: true })
  }

  return response
}

function updateAuthData(response: Response): Response {
  Config.set({
    auth: {
      'token-type': response.headers.get('token-type') || '',
      'access-token': response.headers.get('access-token') || '',
      client: response.headers.get('client') || '',
      uid: response.headers.get('uid') || '',
    },
  })

  return response
}

interface Error {
  success: false
  errors: string[]
}

interface APIAccess<Success> {
  get: (data?: object) => Promise<(Success & { success: undefined }) | Error>
  post: (data?: object) => Promise<(Success & { success: undefined }) | Error>
}

export default function baseAPI<Data>(uri: string): APIAccess<Data> {
  const config = Config.get()
  const headers = {
    'Content-Type': 'application/json;charset=UTF-8',
    Accept: 'application/json, text/plain, */*',
    'accept-encoding': 'deflate, br',
    'x-key-inflection': 'camel',
    ...(config && config.auth),
  }

  return {
    get: (data?: object) =>
      fetch(`${root}/${stripLeadingSlash(uri)}?${toDataURL(data || {})}`, {
        headers,
      })
        .then(failUnauthorized)
        .then(updateAuthData)
        .then(response => response.json()),
    post: (data?: object) =>
      fetch(`${root}/${stripLeadingSlash(uri)}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data || {}),
      })
        .then(failUnauthorized)
        .then(updateAuthData)
        .then(response => response.json()),
  }
}
