import { defineStore } from "pinia"

export const useAPIKeyStore = defineStore('APIKeyStore', () => {
    let apiKeys = reactive([] as APIKey[])
    const setAPIKey = (value: APIKey) => {
        // set if exists
        const index = apiKeys.findIndex(t => t.name === value.name)
        if (index !== -1) {
            apiKeys[index] = value
        }
        // add if not exists
        else {
            apiKeys.push(value)
        }
        saveState()
    }

    const addAPIKey = (name: string, key: string) => {
        const newAPIKey: APIKey = {
            name,
            key
        }
        setAPIKey(newAPIKey)
        saveState()
    }

    const editAPIKey = (key: number, action: CallableFunction) => {
        action(apiKeys[key])
        saveState()
    }

    const removeAPIKey = (key: number) => {
        apiKeys = apiKeys.filter(k => k.name !== apiKeys[key].name)
        saveState()
    }

    const saveState = () => {
        if (process.client) {
            console.log("saveState API keys")
            localStorage.setItem('api-keys', JSON.stringify(apiKeys))
        }
    }

    return {
        apiKeys,
        setAPIKey,
        addAPIKey,
        editAPIKey,
        removeAPIKey
    }
})
