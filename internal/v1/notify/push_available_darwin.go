//go:build darwin

package notify

// Push notifications are disabled on macOS because the UNUserNotificationCenter
// API requires the app to be bundled and signed, which is not the case during
// development. Calling into it crashes with an unrecoverable cgo/Objective-C signal.
var pushAvailable = false
