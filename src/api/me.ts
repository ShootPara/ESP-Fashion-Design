import { SUPPORT_EMAIL, SUPPORT_LOGIN_URL } from "../auth/identity";
import type { AuthenticatedAppUser } from "../db/users";

export function createMeResponse(appUser: AuthenticatedAppUser): Response {
  return Response.json({
    authenticated: true,
    user: {
      id: appUser.row.id,
      email: appUser.row.email,
      display_name: appUser.row.display_name,
      role: appUser.row.role,
      is_superuser: appUser.isSuperuser,
      is_root_superuser: appUser.isRootSuperuser,
      is_enabled: Boolean(appUser.row.is_enabled),
      is_test_mode: Boolean(appUser.row.is_test_mode),
      first_login_at: appUser.row.first_login_at,
      last_login_at: appUser.row.last_login_at
    },
    access: {
      can_access_admin: appUser.isSuperuser,
      visible_modules: appUser.visibleModules
    },
    support: {
      email: SUPPORT_EMAIL,
      login_help_url: SUPPORT_LOGIN_URL
    }
  });
}
