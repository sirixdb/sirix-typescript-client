interface SirixInfo {
  sirixUri: string
  databaseInfo?: DatabaseInfo[]
}

interface DatabaseInfo {
  name: string
  type: string
  resources: string[]
} 

interface LoginInfo {
  username: string
  password: string
  clientId: string
}

interface AuthData {
  access_token: string
  expires_in: number
  refresh_expires_in: number
  refresh_token: string
  token_type: string
  not_before_policy: number
  session_state: string
  scope: string
}