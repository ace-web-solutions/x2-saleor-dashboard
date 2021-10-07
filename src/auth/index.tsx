import { User } from "@saleor/fragments/types/User";
import {
  AccountErrorFragment,
  CreateToken,
  MutationSetPasswordArgs,
  SetPasswordMutation,
  UserFragment
} from "@saleor/sdk/dist/apollo/types";
import { FetchResult } from "apollo-link";
import { parse as parseQs } from "qs";
import React, { MutableRefObject } from "react";
import { Route, RouteComponentProps, Switch } from "react-router-dom";

import Layout from "./components/Layout";
import {
  LoginUrlQueryParams,
  newPasswordPath,
  passwordResetPath,
  passwordResetSuccessPath
} from "./urls";
import LoginViewComponent from "./views/Login";
import NewPassword from "./views/NewPassword";
import ResetPassword from "./views/ResetPassword";
import ResetPasswordSuccess from "./views/ResetPasswordSuccess";

const LoginView: React.FC<RouteComponentProps<any>> = () => {
  const qs = parseQs(location.search.substr(1));
  const params: LoginUrlQueryParams = qs;

  return <LoginViewComponent params={params} />;
};

interface UserContext {
  login: (
    username: string,
    password: string
  ) => Promise<
    Pick<CreateToken, "refreshToken" | "token" | "csrfToken"> & {
      errors: AccountErrorFragment[];
      user?: UserFragment;
    }
  >;
  // loginByExternalPlugin: (
  //   input: ExternalLoginInput
  // ) => Promise<ExternalObtainAccessTokens_externalObtainAccessTokens>;
  logout: () => Promise<void>;
  // requestLoginByExternalPlugin: (
  //   pluginId: string,
  //   input: RequestExternalLoginInput
  // ) => Promise<void>;
  setPassword: (
    opts: MutationSetPasswordArgs
  ) => Promise<
    FetchResult<SetPasswordMutation, Record<string, any>, Record<string, any>>
  >;
  user?: User;
  autologinPromise?: MutableRefObject<Promise<any>>;
  authenticating: boolean;
  authenticated: boolean;
}

export const UserContext = React.createContext<UserContext>({
  login: undefined,
  // loginByExternalPlugin: undefined,
  logout: undefined,
  // requestLoginByExternalPlugin: undefined,
  setPassword: undefined,
  authenticating: false,
  authenticated: false
});

const AuthRouter: React.FC = () => (
  <Layout>
    <Switch>
      <Route path={passwordResetSuccessPath} component={ResetPasswordSuccess} />
      <Route path={passwordResetPath} component={ResetPassword} />
      <Route path={newPasswordPath} component={NewPassword} />
      <Route component={LoginView} />
    </Switch>
  </Layout>
);

AuthRouter.displayName = "AuthRouter";
export default AuthRouter;

export * from "./utils";
