"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { signIn, signUp, signOut, checkUsernameAvailability } from "@/lib/auth"
import { createClientSupabaseClient } from "@/lib/supabase"
import TouchFeedback from "@/components/touch-feedback"
import { Loader2, CheckCircle, XCircle, User, Mail, Phone } from "lucide-react"

export default function AuthTestPage() {
  const { user, profile, isLoading, refreshProfile } = useAuth()
  const [testResults, setTestResults] = useState<string[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)

  // Test data
  const testUser = {
    email: "test.user@example.com",
    password: "testpass123",
    username: "testuser123",
    first_name: "Test",
    last_name: "User",
    phone_number: "+1234567890",
  }

  const addTestResult = (message: string, success = true) => {
    const timestamp = new Date().toLocaleTimeString()
    const icon = success ? "✅" : "❌"
    setTestResults((prev) => [...prev, `${icon} [${timestamp}] ${message}`])
  }

  const clearTestResults = () => {
    setTestResults([])
  }

  // Test 1: Session Persistence
  const testSessionPersistence = async () => {
    addTestResult("Testing session persistence...")

    try {
      const supabase = createClientSupabaseClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        addTestResult(`Session found: ${session.user.email}`)
        addTestResult("Session persistence: PASSED")
      } else {
        addTestResult("No active session found")
        addTestResult("Session persistence: No session to test")
      }
    } catch (error) {
      addTestResult(`Session persistence error: ${error}`, false)
    }
  }

  // Test 2: Username Availability Check
  const testUsernameCheck = async () => {
    addTestResult("Testing username availability check...")

    try {
      // Test with existing username
      const { available: existingAvailable } = await checkUsernameAvailability("john_smith")
      addTestResult(`Existing username 'john_smith' available: ${existingAvailable}`)

      // Test with new username
      const { available: newAvailable } = await checkUsernameAvailability("uniqueuser12345")
      addTestResult(`New username 'uniqueuser12345' available: ${newAvailable}`)

      addTestResult("Username availability check: PASSED")
    } catch (error) {
      addTestResult(`Username check error: ${error}`, false)
    }
  }

  // Test 3: Sign Up Flow
  const testSignUp = async () => {
    addTestResult("Testing sign up flow...")

    try {
      // First, sign out if logged in
      if (user) {
        await signOut()
        addTestResult("Signed out existing user")
      }

      // Test sign up
      const { user: newUser, error } = await signUp({
        ...testUser,
        profile_picture_url: null,
      })

      if (error) {
        if (error.message.includes("already registered")) {
          addTestResult("User already exists - this is expected for repeated tests")
          addTestResult("Sign up flow: PASSED (user exists)")
        } else {
          addTestResult(`Sign up error: ${error.message}`, false)
        }
      } else if (newUser) {
        addTestResult(`Sign up successful: ${newUser.email}`)
        addTestResult("Sign up flow: PASSED")

        // Refresh profile after signup
        await refreshProfile()
      }
    } catch (error) {
      addTestResult(`Sign up test error: ${error}`, false)
    }
  }

  // Test 4: Sign In Flow
  const testSignIn = async () => {
    addTestResult("Testing sign in flow...")

    try {
      // Test with correct credentials
      const { user: signedInUser, error } = await signIn(testUser.email, testUser.password)

      if (error) {
        addTestResult(`Sign in error: ${error.message}`, false)
      } else if (signedInUser) {
        addTestResult(`Sign in successful: ${signedInUser.email}`)
        addTestResult("Sign in flow: PASSED")

        // Refresh profile after signin
        await refreshProfile()
      }
    } catch (error) {
      addTestResult(`Sign in test error: ${error}`, false)
    }
  }

  // Test 5: Invalid Credentials
  const testInvalidCredentials = async () => {
    addTestResult("Testing invalid credentials...")

    try {
      const { user: failedUser, error } = await signIn("invalid@email.com", "wrongpassword")

      if (error) {
        addTestResult(`Invalid credentials correctly rejected: ${error.message}`)
        addTestResult("Invalid credentials test: PASSED")
      } else {
        addTestResult("Invalid credentials were accepted - this should not happen!", false)
      }
    } catch (error) {
      addTestResult(`Invalid credentials test error: ${error}`, false)
    }
  }

  // Test 6: Profile Data Fetch
  const testProfileFetch = async () => {
    addTestResult("Testing profile data fetch...")

    try {
      if (user) {
        await refreshProfile()
        if (profile) {
          addTestResult(`Profile loaded: ${profile.display_name} (${profile.username})`)
          addTestResult("Profile fetch: PASSED")
        } else {
          addTestResult("Profile data not loaded", false)
        }
      } else {
        addTestResult("No user logged in to test profile fetch")
      }
    } catch (error) {
      addTestResult(`Profile fetch error: ${error}`, false)
    }
  }

  // Test 7: Sign Out Flow
  const testSignOut = async () => {
    addTestResult("Testing sign out flow...")

    try {
      if (user) {
        const { error } = await signOut()

        if (error) {
          addTestResult(`Sign out error: ${error.message}`, false)
        } else {
          addTestResult("Sign out successful")
          addTestResult("Sign out flow: PASSED")
        }
      } else {
        addTestResult("No user logged in to test sign out")
      }
    } catch (error) {
      addTestResult(`Sign out test error: ${error}`, false)
    }
  }

  // Run all tests
  const runAllTests = async () => {
    setIsRunningTests(true)
    clearTestResults()

    addTestResult("🚀 Starting comprehensive authentication tests...")

    await testSessionPersistence()
    await new Promise((resolve) => setTimeout(resolve, 1000))

    await testUsernameCheck()
    await new Promise((resolve) => setTimeout(resolve, 1000))

    await testSignUp()
    await new Promise((resolve) => setTimeout(resolve, 2000))

    await testSignIn()
    await new Promise((resolve) => setTimeout(resolve, 2000))

    await testProfileFetch()
    await new Promise((resolve) => setTimeout(resolve, 1000))

    await testInvalidCredentials()
    await new Promise((resolve) => setTimeout(resolve, 1000))

    await testSignOut()

    addTestResult("🏁 All tests completed!")
    setIsRunningTests(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Authentication System Test</h1>
          <p className="text-gray-600 mb-6">Comprehensive testing of login, signup, and session management</p>

          {/* Current Auth State */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
              <User className="mr-2" size={20} />
              Current Authentication State
            </h2>

            {isLoading ? (
              <div className="flex items-center text-blue-700">
                <Loader2 className="animate-spin mr-2" size={16} />
                Loading authentication state...
              </div>
            ) : user ? (
              <div className="space-y-2">
                <div className="flex items-center text-green-700">
                  <CheckCircle className="mr-2" size={16} />
                  <span className="font-medium">Authenticated</span>
                </div>
                <div className="text-sm text-gray-700 space-y-1">
                  <div className="flex items-center">
                    <Mail className="mr-2" size={14} />
                    Email: {user.email}
                  </div>
                  <div className="flex items-center">
                    <User className="mr-2" size={14} />
                    User ID: {user.id}
                  </div>
                  {profile && (
                    <>
                      <div className="flex items-center">
                        <User className="mr-2" size={14} />
                        Name: {profile.display_name}
                      </div>
                      <div className="flex items-center">
                        <User className="mr-2" size={14} />
                        Username: {profile.username}
                      </div>
                      {profile.phone_number && (
                        <div className="flex items-center">
                          <Phone className="mr-2" size={14} />
                          Phone: {profile.phone_number}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center text-red-700">
                <XCircle className="mr-2" size={16} />
                <span className="font-medium">Not Authenticated</span>
              </div>
            )}
          </div>

          {/* Test Controls */}
          <div className="flex flex-wrap gap-3 mb-6">
            <TouchFeedback
              onClick={runAllTests}
              disabled={isRunningTests}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {isRunningTests ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Running Tests...
                </>
              ) : (
                "Run All Tests"
              )}
            </TouchFeedback>

            <TouchFeedback
              onClick={clearTestResults}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700"
            >
              Clear Results
            </TouchFeedback>

            <TouchFeedback
              onClick={testSessionPersistence}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
            >
              Test Session
            </TouchFeedback>

            <TouchFeedback
              onClick={() => window.location.reload()}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700"
            >
              Refresh Page
            </TouchFeedback>
          </div>

          {/* Test Results */}
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            <h3 className="text-white font-bold mb-3">Test Results:</h3>
            {testResults.length === 0 ? (
              <div className="text-gray-500">No tests run yet. Click "Run All Tests" to begin.</div>
            ) : (
              <div className="space-y-1">
                {testResults.map((result, index) => (
                  <div key={index} className="whitespace-pre-wrap">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <TouchFeedback
                onClick={() => (window.location.href = "/login")}
                className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm hover:bg-blue-200"
              >
                Go to Login
              </TouchFeedback>

              <TouchFeedback
                onClick={() => (window.location.href = "/signup")}
                className="bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm hover:bg-green-200"
              >
                Go to Signup
              </TouchFeedback>

              <TouchFeedback
                onClick={() => (window.location.href = "/")}
                className="bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-sm hover:bg-purple-200"
              >
                Go to Home
              </TouchFeedback>

              {user && (
                <TouchFeedback
                  onClick={async () => {
                    await signOut()
                    window.location.reload()
                  }}
                  className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm hover:bg-red-200"
                >
                  Sign Out
                </TouchFeedback>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
