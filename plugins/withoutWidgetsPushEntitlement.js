const { withEntitlementsPlist } = require('expo/config-plugins');

// expo-widgets' own withPushNotifications plugin unconditionally sets
// aps-environment on the main app's entitlements regardless of the
// enablePushNotifications config option (that option only toggles an
// Info.plist flag, not the entitlement itself - see
// node_modules/expo-widgets/plugin/src/ios/withPushNotifications.ts).
// A personal/free Apple Developer team can't provision an app with Push
// Notifications at all, which blocks device builds before we're ready to
// pay for a paid account (tracked separately - Phase 6 push notifications).
// Config plugin mods wrap in reverse of registration order (the
// last-registered mod's callback runs first, then delegates to the one
// registered before it) - so this plugin must be listed *before*
// expo-widgets in app.json's plugins array to end up as the innermost,
// last-to-run mod and have its deletion be the one that sticks.
//
// Gated on the same enablePushNotifications flag passed to the expo-widgets
// entry in app.json - when Phase 6 push notifications work starts (needs a
// paid Apple Developer account), flip *both* to true together, or this
// plugin will keep silently deleting the entitlement push notifications
// then need.
module.exports = function withoutWidgetsPushEntitlement(config, { enablePushNotifications = false } = {}) {
  if (enablePushNotifications) return config;
  return withEntitlementsPlist(config, (mod) => {
    delete mod.modResults['aps-environment'];
    return mod;
  });
};
