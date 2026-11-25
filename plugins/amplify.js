import { Amplify } from "aws-amplify";
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";
import { CookieStorage } from "aws-amplify/utils";

// Cognito for visitors who sign in with their own Pennsieve account
// (pages/sign-in.vue). There is no session otherwise: public pages and
// downloads need none.
export default defineNuxtPlugin(() => {
  const runtimeConfig = useRuntimeConfig();
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolClientId: runtimeConfig.public.userPoolWebClientId,
        userPoolId: runtimeConfig.public.userPoolId,
      },
    },
  });

  cognitoUserPoolsTokenProvider.setKeyValueStorage(
    new CookieStorage({
      domain: runtimeConfig.public.app_domain,
    })
  );
});
