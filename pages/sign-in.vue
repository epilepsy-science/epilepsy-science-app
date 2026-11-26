<template>
  <section class="auth">
    <div v-if="state !== 'checking'" class="card">
      <p class="es-label">Notebooks</p>
      <h1>Sign in</h1>
      <p class="sub">Use your Pennsieve account. Notebooks run as you.</p>

      <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" class="error" />

      <el-form
        v-if="state === 'logIn'"
        ref="logInRef"
        :model="logIn"
        :rules="logInRules"
        label-position="top"
        hide-required-asterisk
        @submit.prevent="submitLogIn"
      >
        <el-form-item label="Email" prop="email">
          <el-input v-model="logIn.email" type="email" autocomplete="username" autofocus />
        </el-form-item>
        <el-form-item label="Password" prop="password">
          <el-input v-model="logIn.password" type="password" autocomplete="current-password" show-password />
        </el-form-item>
        <el-button type="primary" native-type="submit" :loading="busy" class="submit">Sign in</el-button>
      </el-form>

      <el-form
        v-else
        ref="codeRef"
        :model="mfa"
        :rules="codeRules"
        label-position="top"
        hide-required-asterisk
        @submit.prevent="submitCode"
      >
        <template v-if="state === 'totpSetup'">
          <p>Your account needs an authenticator app. Add this key to it, then enter the code it shows.</p>
          <p class="secret"><code>{{ totpSecret }}</code></p>
        </template>
        <p v-else>Enter the code from your authenticator app.</p>
        <el-form-item label="Code" prop="code">
          <el-input v-model="mfa.code" autocomplete="one-time-code" inputmode="numeric" autofocus />
        </el-form-item>
        <el-button type="primary" native-type="submit" :loading="busy" class="submit">Verify</el-button>
        <el-button link class="back" @click="restart">Back to sign in</el-button>
      </el-form>

      <div v-if="state === 'logIn'" class="sign-up">
        <p>
          <strong>Don't have a Pennsieve account?</strong>
          Create one on Pennsieve, free. You'll get an email to set your password; then sign in here with the same
          account.
        </p>
        <a :href="signUpUrl" target="_blank" rel="noopener" class="sign-up__link">Create a Pennsieve account ↗</a>
      </div>
    </div>
  </section>
</template>

<script setup>
// Signing in with a Pennsieve account (pennsieve-app's LoginV2.vue, as in
// LabBooks): a password, and a TOTP code when the account has one.
import { confirmSignIn, signIn } from 'aws-amplify/auth'
import { endSession, safeRedirectPath } from '@/utils/visitorAuth'
import { useVisitorStore } from '@/store/visitor'

useHead({ title: 'Sign in · Epilepsy.Science' })

const route = useRoute()
const router = useRouter()
const visitor = useVisitorStore()
const runtimeConfig = useRuntimeConfig()

// checking, logIn, totpCode or totpSetup
const state = ref('checking')
const error = ref('')
const busy = ref(false)

const logInRef = ref(null)
const logIn = ref({ email: '', password: '' })
const logInRules = {
  email: [{ required: true, message: 'Enter your email', trigger: 'submit' }],
  password: [{ required: true, message: 'Enter your password', trigger: 'submit' }],
}

const codeRef = ref(null)
const mfa = ref({ code: '' })
const codeRules = { code: [{ required: true, message: 'Enter the code', trigger: 'submit' }] }
const totpSecret = ref('')

// Accounts are made on Pennsieve: its invitation email, password and profile
// setup all happen there.
const signUpUrl = `${runtimeConfig.public.workspace_app_host}/sign-up`

const landingPath = () => safeRedirectPath(route.query.redirectTo) || '/notebooks'

async function finish() {
  await visitor.load(true)
  await router.replace(landingPath())
}

onBeforeMount(async () => {
  if (await visitor.load()) {
    await router.replace(landingPath())
    return
  }
  state.value = 'logIn'
})

function restart() {
  error.value = ''
  logIn.value.password = ''
  mfa.value.code = ''
  state.value = 'logIn'
}

// A sign-in that can't finish here: its partial session ends.
async function abandon(message) {
  await endSession(runtimeConfig.public.app_domain)
  state.value = 'logIn'
  error.value = message
}

function submitLogIn() {
  if (busy.value) return
  logInRef.value.validate(async (valid) => {
    if (!valid) return
    busy.value = true
    error.value = ''
    try {
      // A stale session would make Amplify reject the sign-in.
      await endSession(runtimeConfig.public.app_domain)
      const result = await signIn({
        username: logIn.value.email.trim(),
        password: logIn.value.password,
        options: { authFlowType: 'USER_PASSWORD_AUTH' },
      })
      await nextStep(result)
    } catch (err) {
      await abandon(err.message)
    }
    busy.value = false
  })
}

function submitCode() {
  if (busy.value) return
  codeRef.value.validate(async (valid) => {
    if (!valid) return
    busy.value = true
    error.value = ''
    try {
      await nextStep(await confirmSignIn({ challengeResponse: mfa.value.code.trim() }))
    } catch (err) {
      error.value = err.message
    }
    busy.value = false
  })
}

async function nextStep(result) {
  const step = result.nextStep.signInStep
  switch (step) {
    case 'DONE':
      await finish()
      break
    case 'CONFIRM_SIGN_IN_WITH_TOTP_CODE':
      state.value = 'totpCode'
      break
    case 'CONTINUE_SIGN_IN_WITH_TOTP_SETUP':
      totpSecret.value = result.nextStep.totpSetupDetails.sharedSecret
      state.value = 'totpSetup'
      break
    case 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED':
      await abandon("Your Pennsieve account setup isn't finished. Use the link in your invitation email first.")
      break
    case 'RESET_PASSWORD':
      await abandon('Your password needs to be reset. Reset it on Pennsieve, then sign in here.')
      break
    default:
      console.warn('Unsupported sign-in step:', step)
      await abandon("We couldn't complete sign in for this account.")
  }
}
</script>

<style lang="scss" scoped>
.auth {
  display: grid;
  place-items: center;
  padding: 72px 20px 64px;
  background: $es-panel-grey;
}

.card {
  width: 100%;
  max-width: 420px;
  padding: 40px;
  background: #fff;
  border: 1px solid $es-border;
  border-radius: $es-radius;
}

.es-label {
  margin: 0;
}

h1 {
  margin: 8px 0 4px;
  font-size: 1.8rem;
  font-weight: 500;
}

.sub {
  margin: 0 0 24px;
  color: #555;
  line-height: 1.5;
}

.error {
  margin-bottom: 16px;
}

.submit {
  width: 100%;
  margin-top: 8px;
}

.back {
  display: block;
  margin: 12px auto 0;
}

.secret code {
  word-break: break-all;
}

// The way to a new account, under the form.
.sign-up {
  margin: 28px 0 0;
  padding-top: 20px;
  border-top: 1px solid $es-border;

  p {
    margin: 0 0 12px;
    color: #555;
    font-size: 0.9rem;
    line-height: 1.5;
  }

  strong {
    display: block;
    margin-bottom: 2px;
    color: $es-black;
    font-weight: 600;
  }
}

.sign-up__link {
  display: inline-block;
  padding: 8px 16px;
  border: 1px solid $es-primary;
  border-radius: $es-radius-sm;
  color: $es-primary;
  font-weight: 600;
  font-size: 0.85rem;
  text-decoration: none;
  transition: background-color 0.2s, color 0.2s;

  &:hover,
  &:focus-visible {
    background: $es-primary;
    color: #fff;
  }
}
</style>
