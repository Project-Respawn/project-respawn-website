<template>
  <main class="join-page container py-5">
    <section class="join-section">
      <div class="row">
        <div class="col-lg-8 mx-auto join-column">
          <h1 class="mb-2">Join Project Respawn</h1>
          <p class="lead text-secondary mb-4">
            Create an account or sign in to stay connected with the community.
          </p>

          <div v-if="authStatus === 'loading'" class="card border mb-4">
            <div class="card-body d-flex flex-wrap align-items-center gap-3">
              <p class="mb-0">Checking your session…</p>
            </div>
          </div>

          <div v-else-if="isSignedIn" class="card border mb-4">
            <div class="card-body d-flex flex-wrap align-items-center gap-3">
              <p class="mb-0">You're signed in.</p>
              <router-link to="/account" class="btn btn-primary btn-sm">
                View your account
              </router-link>
            </div>
          </div>

          <template v-else>
            <ul class="nav nav-pills join-tabs mb-4" role="tablist">
              <li class="nav-item" role="presentation">
                <button
                  type="button"
                  class="nav-link"
                  :class="{ active: activeTab === 'signin' }"
                  @click="switchTab('signin')"
                >
                  Sign in
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button
                  type="button"
                  class="nav-link"
                  :class="{ active: activeTab === 'signup' }"
                  @click="switchTab('signup')"
                >
                  Create account
                </button>
              </li>
            </ul>

            <div v-if="errorMessage" class="alert alert-danger" role="alert">
              {{ errorMessage }}
            </div>
            <div v-if="successMessage" class="alert alert-success" role="alert">
              {{ successMessage }}
            </div>

            <form
              v-if="activeTab === 'signin' && signInSubView === 'signin'"
              class="join-form"
              @submit.prevent="handleSignIn"
            >
              <div class="mb-3">
                <label for="join-signin-email" class="form-label">Email</label>
                <input
                  id="join-signin-email"
                  v-model="signInForm.email"
                  type="email"
                  class="form-control"
                  autocomplete="email"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="join-signin-password" class="form-label">Password</label>
                <input
                  id="join-signin-password"
                  v-model="signInForm.password"
                  type="password"
                  class="form-control"
                  autocomplete="current-password"
                  required
                />
              </div>
              <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
                <button
                  type="submit"
                  class="btn btn-primary btn-lg"
                  :disabled="loading"
                >
                  {{ loading ? "Signing in…" : "Sign in" }}
                </button>
                <button
                  type="button"
                  class="btn btn-link px-0"
                  :disabled="loading"
                  @click="openForgotPassword"
                >
                  Forgot password?
                </button>
              </div>
            </form>

            <form
              v-else-if="activeTab === 'signin' && signInSubView === 'forgot-request'"
              class="join-form"
              @submit.prevent="handleForgotPasswordRequest"
            >
              <p class="text-secondary mb-3">
                Enter your account email. We'll send a code to reset your password.
              </p>
              <div class="mb-3">
                <label for="join-forgot-email" class="form-label">Email</label>
                <input
                  id="join-forgot-email"
                  v-model="forgotForm.email"
                  type="email"
                  class="form-control"
                  autocomplete="email"
                  required
                />
              </div>
              <button
                type="submit"
                class="btn btn-primary btn-lg"
                :disabled="loading"
              >
                {{ loading ? "Sending…" : "Send reset code" }}
              </button>
              <button
                type="button"
                class="btn btn-link"
                :disabled="loading"
                @click="backToSignInFromForgot"
              >
                Back to sign in
              </button>
            </form>

            <form
              v-else-if="activeTab === 'signin' && signInSubView === 'forgot-confirm'"
              class="join-form"
              @submit.prevent="handleForgotPasswordConfirm"
            >
              <p class="text-secondary mb-3">
                Enter the code we sent and choose a new password.
              </p>
              <div class="mb-3">
                <label for="join-reset-code" class="form-label">Verification code</label>
                <input
                  id="join-reset-code"
                  v-model="forgotForm.code"
                  type="text"
                  class="form-control"
                  inputmode="numeric"
                  autocomplete="one-time-code"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="join-new-password" class="form-label">New password</label>
                <input
                  id="join-new-password"
                  v-model="forgotForm.newPassword"
                  type="password"
                  class="form-control"
                  autocomplete="new-password"
                  required
                  minlength="8"
                />
                <p class="form-text mb-0">
                  At least 8 characters, with uppercase, lowercase, number, and symbol.
                </p>
              </div>
              <div class="mb-3">
                <label for="join-new-password-confirm" class="form-label">Confirm new password</label>
                <input
                  id="join-new-password-confirm"
                  v-model="forgotForm.confirmPassword"
                  type="password"
                  class="form-control"
                  autocomplete="new-password"
                  required
                  minlength="8"
                />
              </div>
              <button
                type="submit"
                class="btn btn-primary btn-lg"
                :disabled="loading"
              >
                {{ loading ? "Updating…" : "Set new password" }}
              </button>
              <button
                type="button"
                class="btn btn-link"
                :disabled="loading"
                @click="resendForgotCode"
              >
                Resend code to email
              </button>
              <button
                type="button"
                class="btn btn-link"
                :disabled="loading"
                @click="backToSignInFromForgot"
              >
                Back to sign in
              </button>
            </form>

            <template v-else>
              <form
                v-if="signupStep === 'form'"
                class="join-form"
                @submit.prevent="handleSignUp"
              >
                <div class="mb-3">
                  <label for="join-email" class="form-label">Email</label>
                  <input
                    id="join-email"
                    v-model="signUpForm.email"
                    type="email"
                    class="form-control"
                    autocomplete="email"
                    required
                  />
                </div>
                <div class="mb-3">
                  <label for="join-username" class="form-label">Username</label>
                  <input
                    id="join-username"
                    v-model="signUpForm.username"
                    type="text"
                    class="form-control"
                    autocomplete="username"
                    minlength="1"
                    required
                  />
                  <div class="form-text">
                    Shown on your profile. Sign in still uses your email.
                  </div>
                </div>
                <div class="mb-3">
                  <label for="join-password" class="form-label">Password</label>
                  <input
                    id="join-password"
                    v-model="signUpForm.password"
                    type="password"
                    class="form-control"
                    autocomplete="new-password"
                    required
                    minlength="8"
                  />
                  <p class="form-text mb-0">
                    At least 8 characters, with uppercase, lowercase, number, and symbol.
                  </p>
                </div>
                <div class="mb-3">
                  <label for="join-password-confirm" class="form-label">Confirm password</label>
                  <input
                    id="join-password-confirm"
                    v-model="signUpForm.confirmPassword"
                    type="password"
                    class="form-control"
                    autocomplete="new-password"
                    required
                    minlength="8"
                  />
                </div>
                <button
                  type="submit"
                  class="btn btn-primary btn-lg"
                  :disabled="loading"
                >
                  {{ loading ? "Creating account…" : "Create account" }}
                </button>
              </form>

              <form
                v-else
                class="join-form"
                @submit.prevent="handleConfirmSignUp"
              >
                <p class="mb-3">
                  We sent a confirmation code to
                  <strong>{{ pendingSignUpEmail }}</strong>. Enter it below.
                </p>
                <div class="mb-3">
                  <label for="join-confirm-code" class="form-label">Confirmation code</label>
                  <input
                    id="join-confirm-code"
                    v-model="confirmCode"
                    type="text"
                    class="form-control"
                    inputmode="numeric"
                    autocomplete="one-time-code"
                    required
                  />
                </div>
                <button
                  type="submit"
                  class="btn btn-primary btn-lg"
                  :disabled="loading"
                >
                  {{ loading ? "Verifying…" : "Confirm account" }}
                </button>
                <button
                  type="button"
                  class="btn btn-link"
                  :disabled="loading"
                  @click="backToSignUpForm"
                >
                  Back to form
                </button>
              </form>
            </template>
          </template>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import {
  signUp,
  signIn,
  confirmSignUp,
  resetPassword,
  confirmResetPassword,
} from "aws-amplify/auth";
import { useAuth, ensureAuthReady, refreshAuth } from "../../composables/useAuth.js";

const router = useRouter();
const { isSignedIn, authStatus } = useAuth();

const activeTab = ref("signin");
const signInSubView = ref("signin");
const signupStep = ref("form");
const loading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const confirmCode = ref("");
const pendingSignUpEmail = ref("");
const pendingForgotEmail = ref("");

const signInForm = ref({
  email: "",
  password: "",
});

const forgotForm = ref({
  email: "",
  code: "",
  newPassword: "",
  confirmPassword: "",
});

const signUpForm = ref({
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
});

function clearAlerts() {
  errorMessage.value = "";
  successMessage.value = "";
}

function authErrorMessage(err) {
  if (err && typeof err.message === "string" && err.message) {
    return err.message;
  }
  return "Something went wrong. Please try again.";
}

function switchTab(tab) {
  activeTab.value = tab;
  signInSubView.value = "signin";
  clearAlerts();
  if (tab === "signup") {
    signupStep.value = "form";
    confirmCode.value = "";
    pendingSignUpEmail.value = "";
  }
}

function openForgotPassword() {
  clearAlerts();
  forgotForm.value.email = signInForm.value.email.trim();
  signInSubView.value = "forgot-request";
}

function backToSignInFromForgot() {
  clearAlerts();
  signInSubView.value = "signin";
  forgotForm.value = {
    email: "",
    code: "",
    newPassword: "",
    confirmPassword: "",
  };
  pendingForgotEmail.value = "";
}

function backToSignUpForm() {
  signupStep.value = "form";
  confirmCode.value = "";
  clearAlerts();
}

onMounted(() => {
  ensureAuthReady();
});

async function handleSignIn() {
  clearAlerts();
  await ensureAuthReady();

  if (isSignedIn.value) {
    signInForm.value.password = "";
    await router.push("/home");
    return;
  }

  loading.value = true;
  try {
    const addr = signInForm.value.email.trim();
    await signIn({ username: addr, password: signInForm.value.password });
    await refreshAuth();
    signInForm.value.password = "";
    await router.push("/home");
  } catch (err) {
    const alreadySignedIn =
      err?.name === "UserAlreadyAuthenticatedException" ||
      /already (?:a )?signed in user|already authenticated/i.test(
        String(err?.message || "")
      );

    if (alreadySignedIn) {
      await refreshAuth();
      if (isSignedIn.value) {
        signInForm.value.password = "";
        await router.push("/account");
        return;
      }
    }

    errorMessage.value = authErrorMessage(err);
  } finally {
    loading.value = false;
  }
}

async function resendForgotCode() {
  if (!pendingForgotEmail.value) {
    signInSubView.value = "forgot-request";
    return;
  }
  clearAlerts();
  loading.value = true;
  try {
    await resetPassword({ username: pendingForgotEmail.value });
    successMessage.value = "A new reset code has been sent.";
  } catch (err) {
    errorMessage.value = authErrorMessage(err);
  } finally {
    loading.value = false;
  }
}

async function handleForgotPasswordRequest() {
  clearAlerts();
  loading.value = true;
  try {
    const addr = forgotForm.value.email.trim();
    await resetPassword({ username: addr });
    pendingForgotEmail.value = addr;
    signInSubView.value = "forgot-confirm";
    forgotForm.value.code = "";
    forgotForm.value.newPassword = "";
    forgotForm.value.confirmPassword = "";
    successMessage.value =
      "If an account exists for that email, a reset code has been sent.";
  } catch (err) {
    errorMessage.value = authErrorMessage(err);
  } finally {
    loading.value = false;
  }
}

async function handleForgotPasswordConfirm() {
  clearAlerts();
  const { newPassword, confirmPassword, code } = forgotForm.value;
  if (newPassword !== confirmPassword) {
    errorMessage.value = "Passwords do not match.";
    return;
  }
  loading.value = true;
  try {
    await confirmResetPassword({
      username: pendingForgotEmail.value,
      confirmationCode: code.trim(),
      newPassword,
    });
    const restoredEmail = pendingForgotEmail.value;
    signInSubView.value = "signin";
    signInForm.value.email = restoredEmail;
    forgotForm.value = {
      email: "",
      code: "",
      newPassword: "",
      confirmPassword: "",
    };
    pendingForgotEmail.value = "";
    errorMessage.value = "";
    successMessage.value =
      "Your password was updated. You can sign in with your new password.";
  } catch (err) {
    errorMessage.value = authErrorMessage(err);
  } finally {
    loading.value = false;
  }
}

async function handleSignUp() {
  clearAlerts();

  const addr = signUpForm.value.email.trim();
  const username = signUpForm.value.username.trim();
  const { password, confirmPassword } = signUpForm.value;

  if (password !== confirmPassword) {
    errorMessage.value = "Passwords do not match.";
    return;
  }

  loading.value = true;
  try {
    const { nextStep } = await signUp({
      username: addr,
      password,
      options: {
        userAttributes: {
          email: addr,
          preferred_username: username,
        },
      },
    });

    pendingSignUpEmail.value = addr;

    if (nextStep.signUpStep === "CONFIRM_SIGN_UP") {
      signupStep.value = "confirm";
      successMessage.value = "Check your email for a confirmation code.";
    } else if (nextStep.signUpStep === "DONE") {
      await refreshAuth();
      signUpForm.value = {
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
      };
      await router.push("/account");
    }
  } catch (err) {
    errorMessage.value = authErrorMessage(err);
  } finally {
    loading.value = false;
  }
}

async function handleConfirmSignUp() {
  clearAlerts();
  loading.value = true;
  const addr = pendingSignUpEmail.value;
  try {
    const { nextStep } = await confirmSignUp({
      username: addr,
      confirmationCode: confirmCode.value.trim(),
    });

    if (nextStep.signUpStep === "DONE") {
      successMessage.value =
        "Your email is verified. You can sign in with your email and password.";
      signupStep.value = "form";
      confirmCode.value = "";
      pendingSignUpEmail.value = "";
      activeTab.value = "signin";
      signInForm.value.email = addr;
      signUpForm.value = {
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
      };
    } else if (nextStep.signUpStep === "COMPLETE_AUTO_SIGN_IN") {
      await refreshAuth();
      signupStep.value = "form";
      confirmCode.value = "";
      pendingSignUpEmail.value = "";
      signUpForm.value = {
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
      };
      await router.push("/account");
    }
  } catch (err) {
    errorMessage.value = authErrorMessage(err);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped src="./Join.css"></style>
