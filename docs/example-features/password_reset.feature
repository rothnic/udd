Feature: Password Reset
  # User Need: Users need to regain access when they forget their password
  # Who: All registered users who have forgotten their credentials
  # Why: Common security requirement - users forget passwords and need secure recovery
  # 
  # Alternatives Considered:
  #   - SMS verification: Deferred to Phase 3 (requires phone collection and SMS provider)
  #   - Security questions: Rejected (less secure, users forget answers, not NIST recommended)
  #   - Admin password reset: Rejected (not scalable, privacy concerns, requires support staff)
  #   - Email with time-limited reset link: CHOSEN (standard, secure, no additional user data required)
  #
  # Success Criteria:
  #   - Reset email arrives within 60 seconds
  #   - Reset link is valid for 1 hour
  #   - Previous reset links are invalidated when new one is requested
  #   - Password complexity requirements are enforced
  #   - User is automatically logged in after successful reset
  #
  # Edge Cases to Cover:
  #   - Email doesn't exist in system
  #   - Reset link expires before use
  #   - User requests multiple resets
  #   - Weak password attempts
  #   - Reset link is reused after successful reset

  Background:
    Given the password reset feature is enabled
    And the email service is available

  Scenario: User requests password reset
    Given a registered user with email "user@example.com"
    When user navigates to login page
    And user clicks "Forgot Password"
    And user enters email "user@example.com"
    And user clicks "Send Reset Link"
    Then user sees message "Check your email for reset instructions"
    And an email is sent to "user@example.com"
    And the email subject is "Password Reset Request"
    And the email contains a reset link valid for 1 hour

  Scenario: User completes password reset successfully
    Given user "user@example.com" has requested a password reset
    And user has received a valid reset link
    When user clicks the reset link in email
    Then user is taken to password reset page
    When user enters new password "SecurePass123!"
    And user confirms password "SecurePass123!"
    And user clicks "Reset Password"
    Then password is updated in the system
    And user is automatically logged in
    And user sees success message "Password reset successful"
    And user is redirected to dashboard

  Scenario: Reset link expires after time limit
    Given user "user@example.com" has requested a password reset
    And the reset link was generated 2 hours ago
    When user clicks the expired reset link
    Then user sees message "This reset link has expired"
    And user sees a button "Request New Reset Link"
    And the expired link cannot be used to reset password

  Scenario: User requests multiple resets in succession
    Given user "user@example.com" exists
    When user requests password reset at "14:00:00"
    And user requests password reset again at "14:05:00"
    And user requests password reset again at "14:10:00"
    Then only the most recent reset link is valid
    And the two previous reset links are invalidated
    And user receives only one active reset email

  Scenario: Non-existent email address
    Given no user exists with email "nonexistent@example.com"
    When user requests password reset for "nonexistent@example.com"
    Then user sees message "Check your email for reset instructions"
    And no email is sent
    And no error reveals that the email doesn't exist

  Scenario: Password doesn't meet complexity requirements
    Given user "user@example.com" has a valid reset link
    When user clicks the reset link
    And user enters new password "weak"
    And user clicks "Reset Password"
    Then user sees error "Password must be at least 8 characters and include uppercase, lowercase, and number"
    And password is not changed
    And user can try again

  Scenario: Passwords don't match during reset
    Given user "user@example.com" has a valid reset link
    When user clicks the reset link
    And user enters new password "SecurePass123!"
    And user enters confirmation password "DifferentPass456!"
    And user clicks "Reset Password"
    Then user sees error "Passwords do not match"
    And password is not changed
    And form remains populated for retry

  Scenario: Reset link is single-use
    Given user "user@example.com" has a valid reset link
    When user completes password reset successfully
    And user tries to use the same reset link again
    Then user sees message "This reset link has already been used"
    And user is prompted to request a new link if needed

  Scenario: Rate limiting on reset requests
    Given user "user@example.com" exists
    When user requests password reset 5 times within 1 minute
    Then subsequent requests are blocked
    And user sees message "Too many reset requests. Please try again in 15 minutes."
    And no additional emails are sent

  Scenario: Reset link contains secure token
    Given user "user@example.com" requests a password reset
    When the reset email is generated
    Then the reset link contains a cryptographically secure random token
    And the token is at least 32 characters long
    And the token is single-use
    And the token cannot be guessed or enumerated
