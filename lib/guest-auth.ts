import type { User } from '@supabase/supabase-js';

type GuestCapableUser = Pick<User, 'is_anonymous' | 'user_metadata'> & {
  identities?: Array<{ provider?: string | null } | null> | null;
};

export const MANAGED_GUEST_NAME = 'Invitado Vyra';
const MANAGED_GUEST_EMAIL_DOMAIN = 'vyra-guest.example';

function hasLinkedUpgradeIdentity(user: GuestCapableUser | null | undefined) {
  if (!Array.isArray(user?.identities)) return false;

  return user.identities.some((identity) => {
    const provider = typeof identity?.provider === 'string'
      ? identity.provider.trim().toLowerCase()
      : '';
    return provider !== '' && provider !== 'email' && provider !== 'anonymous';
  });
}

export function isGuestAuthUser(user: GuestCapableUser | null | undefined) {
  if (!user) return false;
  if (user.is_anonymous) return true;

  const guestFlag = user.user_metadata?.vyra_guest;
  const isManagedGuest = guestFlag === true || guestFlag === 'true';

  if (!isManagedGuest) return false;
  return !hasLinkedUpgradeIdentity(user);
}

export function buildManagedGuestCredentials(now = Date.now()) {
  const nonce = `${now}${Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, '0')}`;

  return {
    email: `guest.${nonce}@${MANAGED_GUEST_EMAIL_DOMAIN}`,
    password: `VyraGuest!${nonce.slice(-10)}`,
  };
}

export function buildManagedGuestMetadata(name = MANAGED_GUEST_NAME) {
  return {
    name,
    vyra_guest: true,
  };
}
