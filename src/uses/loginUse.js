import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from 'src/stores/authStore'

export function useLogin () {
    const router    = useRouter()
    const route     = useRoute()
    const authStore = useAuthStore()

    const form         = reactive( { email: '', password: '' } )
    const loading      = ref( false )
    const errorMessage = ref( null )

    async function submit () {
        loading.value      = true
        errorMessage.value = null
        try {
            await authStore.login( form )
            const redirect = typeof route.query.redirect === 'string'
                ? route.query.redirect
                : '/'
            router.replace( redirect )
        }
        catch ( err ) {
            errorMessage.value = err?.body?.error?.message || err.message || 'Login failed'
        }
        finally {
            loading.value = false
        }
    }

    return {
        form,
        loading,
        errorMessage,
        submit,
    }
}
