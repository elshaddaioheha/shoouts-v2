/**
 * One-off script to grant or revoke the admin custom claim on a Firebase Auth user.
 *
 * Usage:
 *   npx ts-node scripts/grantAdmin.ts <uid>          # grant admin
 *   npx ts-node scripts/grantAdmin.ts <uid> --revoke # revoke admin
 *
 * Requires GOOGLE_APPLICATION_CREDENTIALS env var pointing to a service account JSON
 * that has the "Firebase Authentication Admin" role, OR run from a machine that already
 * has application default credentials configured.
 *
 * After running, the user must sign out and sign back in for the new claim to take effect.
 */

import * as admin from 'firebase-admin';

async function main() {
  const uid = process.argv[2];
  const revoke = process.argv.includes('--revoke');

  if (!uid) {
    console.error('Usage: npx ts-node scripts/grantAdmin.ts <uid> [--revoke]');
    process.exit(1);
  }

  if (!admin.apps.length) {
    admin.initializeApp();
  }

  const auth = admin.auth();
  const claim = revoke ? {} : { role: 'admin' };

  await auth.setCustomUserClaims(uid, claim);

  const verb = revoke ? 'Revoked admin claim from' : 'Granted admin claim to';
  console.log(`✓ ${verb} user ${uid}`);
  console.log('  The user must sign out and sign back in for the change to take effect.');
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
