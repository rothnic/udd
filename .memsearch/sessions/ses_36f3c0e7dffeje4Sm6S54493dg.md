# Create mobile_widget Gherkin scenario file (@Sisyphus-Junior subagent)

**ID**: ses_36f3c0e7dffeje4Sm6S54493dg
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/24/2026, 11:48:06 AM
**Stats**: 1 files changed, +15 -0

---

## USER (11:48:06 AM)

@phase:1
Feature: Mobile lock-screen quick capture

  As a user who needs to record tasks quickly,
  I want to capture a task from the device lock screen,
  so I can record ideas without unlocking my phone.

  Scenario: Capture a new task from lock screen widget
    Given the mobile app is installed and the quick capture widget is available on the lock screen
    And the user is on the device lock screen
    When the user taps the quick capture widget
    And the user enters "Buy milk" into the quick capture input
    And the user taps the Save button on the widget
    Then a new task with title "Buy milk" should be created in the user's inbox
    And the app should show a confirmation notification from the lock screen


## USER (11:51:18 AM)

@phase:4
Feature: Mobile lock-screen quick capture

  As a user who needs to record tasks quickly,
  I want to capture a task from the device lock screen,
  so I can record ideas without unlocking my phone.

  Scenario: Capture a new task from lock screen widget
    Given the mobile app is installed and the quick capture widget is available on the lock screen
    And the user is on the device lock screen
    When the user taps the quick capture widget
    And the user enters "Buy milk" into the quick capture input
    And the user taps the Save button on the widget
    Then a new task with title "Buy milk" should be created in the user's inbox
    And the app should show a confirmation notification from the lock screen


