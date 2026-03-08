/**
 * E2E Auth Flow Test — requires Android emulator with Detox
 * Run: npx detox test --configuration android.emu.debug
 *
 * NOTE: Twilio must be active for OTP flow to complete.
 * Until then, tests marked with .skip can be enabled post-Twilio.
 */

describe('Auth Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true })
  })

  beforeEach(async () => {
    await device.reloadReactNative()
  })

  it('shows phone input screen on launch', async () => {
    await expect(element(by.text('Pop Culture CLE'))).toBeVisible()
    await expect(element(by.id('phone-input'))).toBeVisible()
  })

  it.skip('full OTP login flow — requires Twilio', async () => {
    // Enable once Twilio number is approved
    await element(by.id('phone-input')).typeText('2165551234')
    await element(by.id('send-code-button')).tap()
    // OTP received via SMS... enter code
    await element(by.id('otp-input')).typeText('123456')
    await element(by.id('verify-button')).tap()
    await expect(element(by.text('My Stamps'))).toBeVisible()
  })
})
