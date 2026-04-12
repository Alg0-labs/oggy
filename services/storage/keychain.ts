import * as SecureStore from 'expo-secure-store'

export type APIProvider = 'openai' | 'google' | 'anthropic'

class KeychainManager {
  private servicePrefix = 'oggy.apikey'

  private getServiceKey(provider: APIProvider): string {
    return `${this.servicePrefix}.${provider}`
  }

  async storeAPIKey(provider: APIProvider, apiKey: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.getServiceKey(provider), apiKey)
    } catch (error) {
      console.error(`Failed to store API key for ${provider}:`, error)
      throw new Error(`Failed to store API key: ${error}`)
    }
  }

  async retrieveAPIKey(provider: APIProvider): Promise<string | null> {
    try {
      const key = await SecureStore.getItemAsync(this.getServiceKey(provider))
      return key
    } catch (error) {
      console.error(`Failed to retrieve API key for ${provider}:`, error)
      return null
    }
  }

  async deleteAPIKey(provider: APIProvider): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.getServiceKey(provider))
    } catch (error) {
      console.error(`Failed to delete API key for ${provider}:`, error)
      throw new Error(`Failed to delete API key: ${error}`)
    }
  }

  async listStoredServices(): Promise<APIProvider[]> {
    const providers: APIProvider[] = ['openai', 'google', 'anthropic']
    const stored: APIProvider[] = []

    for (const provider of providers) {
      const key = await this.retrieveAPIKey(provider)
      if (key) {
        stored.push(provider)
      }
    }

    return stored
  }

  async hasAPIKey(provider: APIProvider): Promise<boolean> {
    const key = await this.retrieveAPIKey(provider)
    return key !== null && key.length > 0
  }
}

export const keychainManager = new KeychainManager()
