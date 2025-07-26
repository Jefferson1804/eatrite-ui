import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import RegisterPage from '../register/page'

// Test suite for the Register Page
// - Verifies rendering, form fields, and submit button

describe('RegisterPage', () => {
  it('renders without crashing', () => {
    render(<RegisterPage />)
    expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument()
  })

  it('renders all required form fields', () => {
    render(<RegisterPage />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    // Add more fields as needed
  })

  it('renders the submit button', () => {
    render(<RegisterPage />)
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument()
  })

  it('submits the form (mocked)', () => {
    render(<RegisterPage />)
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /register/i }))
    // Add assertions for submission side effects if possible (mock handlers)
  })
}) 