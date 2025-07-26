import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import LoginPage from '../../login/page'

// Test suite for the Login Page
// - Verifies rendering, form fields, and submit button

describe('LoginPage', () => {
  it('renders without crashing', () => {
    render(<LoginPage />)
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument()
  })

  it('renders all required form fields', () => {
    render(<LoginPage />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    // Add more fields as needed
  })

  it('renders the submit button', () => {
    render(<LoginPage />)
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('submits the form (mocked)', () => {
    render(<LoginPage />)
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /login/i }))
    // Add assertions for submission side effects if possible (mock handlers)
  })
}) 