'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from '@/components/auth-provider'

const activityLevels = [
  { value: 'sedentary', label: 'Sedentary (little or no exercise)' },
  { value: 'lightly_active', label: 'Lightly Active (light exercise/sports 1-3 days/week)' },
  { value: 'moderately_active', label: 'Moderately Active (moderate exercise/sports 3-5 days/week)' },
  { value: 'very_active', label: 'Very Active (hard exercise/sports 6-7 days a week)' },
  { value: 'extremely_active', label: 'Extremely Active (very hard exercise, physical job)' },
]

const dietaryPreferences = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'pescatarian', label: 'Pescatarian' },
  { value: 'gluten_free', label: 'Gluten-Free' },
  { value: 'dairy_free', label: 'Dairy-Free' },
  { value: 'keto', label: 'Keto' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'low_carb', label: 'Low-Carb' },
  { value: 'none', label: 'No specific diet' },
]

const healthGoals = [
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'weight_gain', label: 'Weight Gain' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'improve_health', label: 'Improve Overall Health' },
  { value: 'increase_energy', label: 'Increase Energy' },
  { value: 'better_sleep', label: 'Better Sleep' },
  { value: 'reduce_stress', label: 'Reduce Stress' },
]

const commonAllergies = [
  { value: 'peanuts', label: 'Peanuts' },
  { value: 'tree_nuts', label: 'Tree Nuts' },
  { value: 'milk', label: 'Milk' },
  { value: 'eggs', label: 'Eggs' },
  { value: 'soy', label: 'Soy' },
  { value: 'wheat', label: 'Wheat' },
  { value: 'fish', label: 'Fish' },
  { value: 'shellfish', label: 'Shellfish' },
  { value: 'gluten', label: 'Gluten' },
  { value: 'lactose', label: 'Lactose' },
  { value: 'none', label: 'No allergies' },
]

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [activityLevel, setActivityLevel] = useState('')
  const [selectedDietaryPreferences, setSelectedDietaryPreferences] = useState<string[]>([])
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([])
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const { signUp } = useAuth()
  const router = useRouter()

  const handleNext = () => {
    if (step === 1) {
      if (!email || !password || !confirmPassword || !fullName) {
        setError('Please fill in all required fields')
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long')
        return
      }
    }
    setError(null)
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const profile = {
        full_name: fullName,
        username: username || undefined,
        date_of_birth: dateOfBirth || undefined,
        height_cm: heightCm ? parseInt(heightCm) : undefined,
        weight_kg: weightKg ? parseFloat(weightKg) : undefined,
        activity_level: activityLevel || undefined,
        dietary_preferences: selectedDietaryPreferences.length > 0 ? selectedDietaryPreferences : undefined,
        allergies: selectedAllergies.length > 0 ? selectedAllergies : undefined,
        goals: selectedGoals.length > 0 ? selectedGoals : undefined,
      }

      const { data, error } = await signUp(email, password, profile)
      
      if (error) {
        setError(error.message)
      } else {
        setMessage('Registration successful! Please check your email to confirm your account.')
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const toggleDietaryPreference = (value: string) => {
    setSelectedDietaryPreferences(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value)
        : [...prev, value]
    )
  }

  const toggleAllergy = (value: string) => {
    setSelectedAllergies(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value)
        : [...prev, value]
    )
  }

  const toggleGoal = (value: string) => {
    setSelectedGoals(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value)
        : [...prev, value]
    )
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          {step === 1 ? 'Enter your basic information' : 
           step === 2 ? 'Tell us about your health profile' : 
           'Set your preferences and goals'}
        </p>
      </div>
      
      {error && (
        <div className="bg-destructive/15 text-destructive px-3 py-2 rounded-md text-sm">
          {error}
        </div>
      )}

      {message && (
        <div className="bg-green-500/15 text-green-600 px-3 py-2 rounded-md text-sm">
          {message}
        </div>
      )}

      {/* Step 1: Basic Information */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter your basic account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input 
                id="fullName" 
                type="text" 
                placeholder="John Doe" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required 
                disabled={loading}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="email">Email *</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                disabled={loading}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="username">Username (optional)</Label>
              <Input 
                id="username" 
                type="text" 
                placeholder="johndoe" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="password">Password *</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                disabled={loading}
                minLength={6}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
                disabled={loading}
              />
            </div>
            <Button type="button" onClick={handleNext} className="w-full" disabled={loading}>
              Next
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Health Profile */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Health Profile</CardTitle>
            <CardDescription>Help us personalize your experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input 
                id="dateOfBirth" 
                type="date" 
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-3">
                <Label htmlFor="heightCm">Height (cm)</Label>
                <Input 
                  id="heightCm" 
                  type="number" 
                  placeholder="175" 
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="weightKg">Weight (kg)</Label>
                <Input 
                  id="weightKg" 
                  type="number" 
                  placeholder="70" 
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="activityLevel">Activity Level</Label>
              <Select value={activityLevel} onValueChange={setActivityLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your activity level" />
                </SelectTrigger>
                <SelectContent>
                  {activityLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleBack} disabled={loading}>
                Back
              </Button>
              <Button type="button" onClick={handleNext} className="flex-1" disabled={loading}>
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Preferences and Goals */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Preferences & Goals</CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Dietary Preferences</Label>
              <div className="grid grid-cols-2 gap-2">
                {dietaryPreferences.map((pref) => (
                  <div key={pref.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={pref.value}
                      checked={selectedDietaryPreferences.includes(pref.value)}
                      onCheckedChange={() => toggleDietaryPreference(pref.value)}
                      disabled={loading}
                    />
                    <Label htmlFor={pref.value} className="text-sm">{pref.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Allergies & Intolerances</Label>
              <div className="grid grid-cols-2 gap-2">
                {commonAllergies.map((allergy) => (
                  <div key={allergy.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={allergy.value}
                      checked={selectedAllergies.includes(allergy.value)}
                      onCheckedChange={() => toggleAllergy(allergy.value)}
                      disabled={loading}
                    />
                    <Label htmlFor={allergy.value} className="text-sm">{allergy.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Health Goals</Label>
              <div className="grid grid-cols-2 gap-2">
                {healthGoals.map((goal) => (
                  <div key={goal.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={goal.value}
                      checked={selectedGoals.includes(goal.value)}
                      onCheckedChange={() => toggleGoal(goal.value)}
                      disabled={loading}
                    />
                    <Label htmlFor={goal.value} className="text-sm">{goal.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleBack} disabled={loading}>
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-center text-sm">
        Already have an account?{" "}
        <a href="/login" className="underline underline-offset-4">
          Sign in
        </a>
      </div>
    </form>
  )
} 