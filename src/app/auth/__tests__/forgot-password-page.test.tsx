import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ForgotPasswordPage from '../forgot-password/page'

// Test suite for the Forgot Password Page
// - Verifies rendering, form fields, and submit button

describe('ForgotPasswordPage', () => {
  it('renders without crashing', () => {
    render(<ForgotPasswordPage />)
    expect(screen.getByRole('heading', { name: /forgot password/i })).toBeInTheDocument()
  })

  it('renders the email field', () => {
    render(<ForgotPasswordPage />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('renders the submit button', () => {
    render(<ForgotPasswordPage />)
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument()
  })

  it('submits the form (mocked)', () => {
    render(<ForgotPasswordPage />)
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }))
    // Add assertions for submission side effects if possible (mock handlers)
  })
}) 