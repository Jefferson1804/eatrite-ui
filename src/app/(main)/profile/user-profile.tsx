"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  User as UserIcon, 
  Heart, 
  Target, 
  Activity, 
  Save, 
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"

// Types for user profile data
interface UserProfile {
  id: string
  email: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  bio: string | null
  date_of_birth: string | null
  height_cm: number | null
  weight_kg: number | null
  activity_level: string | null
  dietary_preferences: string[]
  allergies: string[]
  goals: string[]
  timezone: string
  language: string
  is_premium: boolean
  created_at: string
  updated_at: string
}

interface NutritionGoals {
  id: string
  user_id: string
  daily_calories: number | null
  daily_protein_g: number | null
  daily_carbs_g: number | null
  daily_fat_g: number | null
  daily_fiber_g: number | null
  daily_sugar_g: number | null
  daily_sodium_mg: number | null
  is_active: boolean
}

// Dietary preferences and health goals options
const DIETARY_PREFERENCES = [
  "vegetarian",
  "vegan",
  "gluten-free",
  "dairy-free",
  "keto",
  "paleo",
  "mediterranean",
  "low-carb",
  "low-fat",
  "pescatarian",
  "flexitarian"
]

const HEALTH_GOALS = [
  "weight_loss",
  "weight_gain",
  "muscle_gain",
  "maintenance",
  "improve_energy",
  "better_sleep",
  "reduce_stress",
  "improve_digestion",
  "heart_health",
  "diabetes_management"
]

const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary (little or no exercise)" },
  { value: "lightly_active", label: "Lightly Active (light exercise 1-3 days/week)" },
  { value: "moderately_active", label: "Moderately Active (moderate exercise 3-5 days/week)" },
  { value: "very_active", label: "Very Active (hard exercise 6-7 days/week)" },
  { value: "extremely_active", label: "Extremely Active (very hard exercise, physical job)" }
]

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoals | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")
  const [newDietaryPreference, setNewDietaryPreference] = useState("")
  const [newAllergy, setNewAllergy] = useState("")
  const [newGoal, setNewGoal] = useState("")
  
  const router = useRouter()
  const supabase = createClient()

  // Load user and profile data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log("Loading user data...")
        console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
        console.log("Supabase Anon Key exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
        
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          console.error("Auth error:", authError)
          toast.error("Authentication error")
          router.push("/login")
          return
        }
        
        if (!user) {
          console.log("No user found, redirecting to login")
          router.push("/login")
          return
        }

        console.log("User found:", user.id)
        setUser(user)

        // Load user profile
        console.log("Loading profile for user:", user.id)
        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        console.log("Profile query result:", { profileData, profileError })

        if (profileError) {
          console.error("Profile error details:", profileError)
          if (profileError.code === "PGRST116") {
            console.log("No profile found, creating default")
            // Create default profile if none exists
            const defaultProfile: UserProfile = {
              id: user.id,
              email: user.email || "",
              full_name: null,
              username: null,
              avatar_url: null,
              bio: null,
              date_of_birth: null,
              height_cm: null,
              weight_kg: null,
              activity_level: null,
              dietary_preferences: [],
              allergies: [],
              goals: [],
              timezone: "UTC",
              language: "en",
              is_premium: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
            setProfile(defaultProfile)
          } else {
            console.error("Error loading profile:", profileError)
            // Create default profile even on other errors to allow the page to work
            const defaultProfile: UserProfile = {
              id: user.id,
              email: user.email || "",
              full_name: null,
              username: null,
              avatar_url: null,
              bio: null,
              date_of_birth: null,
              height_cm: null,
              weight_kg: null,
              activity_level: null,
              dietary_preferences: [],
              allergies: [],
              goals: [],
              timezone: "UTC",
              language: "en",
              is_premium: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
            setProfile(defaultProfile)
            toast.error("Database connection issue, but you can still set your preferences")
          }
        } else if (profileData) {
          console.log("Profile loaded successfully")
          setProfile(profileData)
        }

        // Load nutrition goals
        console.log("Loading nutrition goals for user:", user.id)
        const { data: nutritionData, error: nutritionError } = await supabase
          .from("user_nutrition_goals")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .single()

        console.log("Nutrition goals query result:", { nutritionData, nutritionError })

        if (nutritionError) {
          console.error("Nutrition goals error details:", nutritionError)
          if (nutritionError.code === "PGRST116") {
            console.log("No nutrition goals found, creating default")
            // Create default nutrition goals if none exist
            const defaultNutritionGoals: NutritionGoals = {
              id: "",
              user_id: user.id,
              daily_calories: null,
              daily_protein_g: null,
              daily_carbs_g: null,
              daily_fat_g: null,
              daily_fiber_g: null,
              daily_sugar_g: null,
              daily_sodium_mg: null,
              is_active: true
            }
            setNutritionGoals(defaultNutritionGoals)
          } else {
            console.error("Error loading nutrition goals:", nutritionError)
            // Create default nutrition goals even on other errors
            const defaultNutritionGoals: NutritionGoals = {
              id: "",
              user_id: user.id,
              daily_calories: null,
              daily_protein_g: null,
              daily_carbs_g: null,
              daily_fat_g: null,
              daily_fiber_g: null,
              daily_sugar_g: null,
              daily_sodium_mg: null,
              is_active: true
            }
            setNutritionGoals(defaultNutritionGoals)
          }
        } else if (nutritionData) {
          console.log("Nutrition goals loaded successfully")
          setNutritionGoals(nutritionData)
        }

      } catch (error) {
        console.error("Error loading user data:", error)
        toast.error("Failed to load user data")
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [router, supabase])

  // Save profile data
  const handleSaveProfile = async () => {
    if (!user || !profile) return

    setIsSaving(true)
    setSaveStatus("idle")

    try {
      const { error } = await supabase
        .from("user_profiles")
        .upsert({
          ...profile,
          id: user.id,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error("Error saving profile:", error)
        setSaveStatus("error")
        toast.error("Failed to save profile")
        return
      }

      setSaveStatus("success")
      toast.success("Profile saved successfully")
    } catch (error) {
      console.error("Error saving profile:", error)
      setSaveStatus("error")
      toast.error("Failed to save profile")
    } finally {
      setIsSaving(false)
    }
  }

  // Save nutrition goals
  const handleSaveNutritionGoals = async () => {
    if (!user || !nutritionGoals) return

    setIsSaving(true)
    setSaveStatus("idle")

    try {
      // Deactivate current active goals if they exist
      if (nutritionGoals.id) {
        await supabase
          .from("user_nutrition_goals")
          .update({ is_active: false })
          .eq("user_id", user.id)
          .eq("is_active", true)
      }

      // Insert new nutrition goals
      const { error } = await supabase
        .from("user_nutrition_goals")
        .insert({
          daily_calories: nutritionGoals.daily_calories,
          daily_protein_g: nutritionGoals.daily_protein_g,
          daily_carbs_g: nutritionGoals.daily_carbs_g,
          daily_fat_g: nutritionGoals.daily_fat_g,
          daily_fiber_g: nutritionGoals.daily_fiber_g,
          daily_sugar_g: nutritionGoals.daily_sugar_g,
          daily_sodium_mg: nutritionGoals.daily_sodium_mg,
          user_id: user.id,
          is_active: true
        })

      if (error) {
        console.error("Error saving nutrition goals:", error)
        setSaveStatus("error")
        toast.error("Failed to save nutrition goals")
        return
      }

      setSaveStatus("success")
      toast.success("Nutrition goals saved successfully")
    } catch (error) {
      console.error("Error saving nutrition goals:", error)
      setSaveStatus("error")
      toast.error("Failed to save nutrition goals")
    } finally {
      setIsSaving(false)
    }
  }

  // Add dietary preference
  const addDietaryPreference = () => {
    if (!newDietaryPreference.trim() || !profile) return
    
    const preference = newDietaryPreference.trim().toLowerCase()
    if (!profile.dietary_preferences.includes(preference)) {
      setProfile({
        ...profile,
        dietary_preferences: [...profile.dietary_preferences, preference]
      })
    }
    setNewDietaryPreference("")
  }

  // Remove dietary preference
  const removeDietaryPreference = (preference: string) => {
    if (!profile) return
    
    setProfile({
      ...profile,
      dietary_preferences: profile.dietary_preferences.filter(p => p !== preference)
    })
  }

  // Add allergy
  const addAllergy = () => {
    if (!newAllergy.trim() || !profile) return
    
    const allergy = newAllergy.trim()
    if (!profile.allergies.includes(allergy)) {
      setProfile({
        ...profile,
        allergies: [...profile.allergies, allergy]
      })
    }
    setNewAllergy("")
  }

  // Remove allergy
  const removeAllergy = (allergy: string) => {
    if (!profile) return
    
    setProfile({
      ...profile,
      allergies: profile.allergies.filter(a => a !== allergy)
    })
  }

  // Add health goal
  const addHealthGoal = () => {
    if (!newGoal.trim() || !profile) return
    
    const goal = newGoal.trim().toLowerCase()
    if (!profile.goals.includes(goal)) {
      setProfile({
        ...profile,
        goals: [...profile.goals, goal]
      })
    }
    setNewGoal("")
  }

  // Remove health goal
  const removeHealthGoal = (goal: string) => {
    if (!profile) return
    
    setProfile({
      ...profile,
      goals: profile.goals.filter(g => g !== goal)
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Authentication required</h2>
          <p className="text-muted-foreground">Please log in to access your profile.</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your preferences, dietary restrictions, and health goals</p>
        </div>
        <div className="flex items-center gap-2">
          {saveStatus === "success" && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Saved</span>
            </div>
          )}
          <Button 
            onClick={handleSaveProfile} 
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Update your basic profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback>
                  {profile.full_name?.charAt(0) || profile.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profile.full_name || ""}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="Enter your full name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={profile.username || ""}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  placeholder="Enter username"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio || ""}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={profile.date_of_birth || ""}
                  onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="activity_level">Activity Level</Label>
                <Select
                  value={profile.activity_level || ""}
                  onValueChange={(value) => setProfile({ ...profile, activity_level: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="height_cm">Height (cm)</Label>
                <Input
                  id="height_cm"
                  type="number"
                  value={profile.height_cm || ""}
                  onChange={(e) => setProfile({ ...profile, height_cm: e.target.value ? Number(e.target.value) : null })}
                  placeholder="170"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="weight_kg">Weight (kg)</Label>
                <Input
                  id="weight_kg"
                  type="number"
                  step="0.1"
                  value={profile.weight_kg || ""}
                  onChange={(e) => setProfile({ ...profile, weight_kg: e.target.value ? Number(e.target.value) : null })}
                  placeholder="70.5"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dietary Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Dietary Preferences
            </CardTitle>
            <CardDescription>
              Manage your dietary restrictions and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Current Dietary Preferences</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.dietary_preferences.map((preference) => (
                  <Badge
                    key={preference}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeDietaryPreference(preference)}
                  >
                    {preference}
                  </Badge>
                ))}
                {profile.dietary_preferences.length === 0 && (
                  <p className="text-sm text-muted-foreground">No dietary preferences set</p>
                )}
              </div>
            </div>

            <div>
              <Label>Add Dietary Preference</Label>
              <div className="flex gap-2 mt-1">
                <Select value={newDietaryPreference} onValueChange={setNewDietaryPreference}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select dietary preference" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIETARY_PREFERENCES.map((preference) => (
                      <SelectItem key={preference} value={preference}>
                        {preference.charAt(0).toUpperCase() + preference.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={addDietaryPreference} size="sm">
                  Add
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <Label>Allergies & Intolerances</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.allergies.map((allergy) => (
                  <Badge
                    key={allergy}
                    variant="destructive"
                    className="cursor-pointer"
                    onClick={() => removeAllergy(allergy)}
                  >
                    {allergy}
                  </Badge>
                ))}
                {profile.allergies.length === 0 && (
                  <p className="text-sm text-muted-foreground">No allergies listed</p>
                )}
              </div>
            </div>

            <div>
              <Label>Add Allergy</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  placeholder="Enter allergy or intolerance"
                  className="flex-1"
                />
                <Button onClick={addAllergy} size="sm">
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Health Goals
            </CardTitle>
            <CardDescription>
              Set and manage your health and fitness goals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Current Health Goals</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.goals.map((goal) => (
                  <Badge
                    key={goal}
                    variant="outline"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeHealthGoal(goal)}
                  >
                    {goal.replace(/_/g, " ")}
                  </Badge>
                ))}
                {profile.goals.length === 0 && (
                  <p className="text-sm text-muted-foreground">No health goals set</p>
                )}
              </div>
            </div>

            <div>
              <Label>Add Health Goal</Label>
              <div className="flex gap-2 mt-1">
                <Select value={newGoal} onValueChange={setNewGoal}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select health goal" />
                  </SelectTrigger>
                  <SelectContent>
                    {HEALTH_GOALS.map((goal) => (
                      <SelectItem key={goal} value={goal}>
                        {goal.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={addHealthGoal} size="sm">
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nutrition Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Nutrition Goals
            </CardTitle>
            <CardDescription>
              Set your daily nutrition targets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="daily_calories">Daily Calories</Label>
                <Input
                  id="daily_calories"
                  type="number"
                  value={nutritionGoals?.daily_calories || ""}
                  onChange={(e) => setNutritionGoals({
                    ...nutritionGoals!,
                    daily_calories: e.target.value ? Number(e.target.value) : null
                  })}
                  placeholder="2000"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="daily_protein">Protein (g)</Label>
                <Input
                  id="daily_protein"
                  type="number"
                  step="0.1"
                  value={nutritionGoals?.daily_protein_g || ""}
                  onChange={(e) => setNutritionGoals({
                    ...nutritionGoals!,
                    daily_protein_g: e.target.value ? Number(e.target.value) : null
                  })}
                  placeholder="150"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="daily_carbs">Carbs (g)</Label>
                <Input
                  id="daily_carbs"
                  type="number"
                  step="0.1"
                  value={nutritionGoals?.daily_carbs_g || ""}
                  onChange={(e) => setNutritionGoals({
                    ...nutritionGoals!,
                    daily_carbs_g: e.target.value ? Number(e.target.value) : null
                  })}
                  placeholder="250"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="daily_fat">Fat (g)</Label>
                <Input
                  id="daily_fat"
                  type="number"
                  step="0.1"
                  value={nutritionGoals?.daily_fat_g || ""}
                  onChange={(e) => setNutritionGoals({
                    ...nutritionGoals!,
                    daily_fat_g: e.target.value ? Number(e.target.value) : null
                  })}
                  placeholder="65"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="daily_fiber">Fiber (g)</Label>
                <Input
                  id="daily_fiber"
                  type="number"
                  step="0.1"
                  value={nutritionGoals?.daily_fiber_g || ""}
                  onChange={(e) => setNutritionGoals({
                    ...nutritionGoals!,
                    daily_fiber_g: e.target.value ? Number(e.target.value) : null
                  })}
                  placeholder="25"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="daily_sugar">Sugar (g)</Label>
                <Input
                  id="daily_sugar"
                  type="number"
                  step="0.1"
                  value={nutritionGoals?.daily_sugar_g || ""}
                  onChange={(e) => setNutritionGoals({
                    ...nutritionGoals!,
                    daily_sugar_g: e.target.value ? Number(e.target.value) : null
                  })}
                  placeholder="50"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="daily_sodium">Sodium (mg)</Label>
              <Input
                id="daily_sodium"
                type="number"
                step="0.1"
                value={nutritionGoals?.daily_sodium_mg || ""}
                onChange={(e) => setNutritionGoals({
                  ...nutritionGoals!,
                  daily_sodium_mg: e.target.value ? Number(e.target.value) : null
                })}
                placeholder="2300"
                className="mt-1"
              />
            </div>

            <Button 
              onClick={handleSaveNutritionGoals} 
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Nutrition Goals
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
