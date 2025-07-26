"use client"

import { useState } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  Search, 
  ChevronDown, 
  ChevronUp,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Users,
  Settings,
  ChefHat,
  Calendar,
  ShoppingBasket,
  Heart,
  User,
  Sparkles,
  Camera,
  Upload,
  Clock,
  Utensils,
  FileText,
  ExternalLink,
  Send
} from "lucide-react"
import { toast } from "sonner"

// FAQ Data
const faqData = [
  {
    category: "Getting Started",
    icon: BookOpen,
    items: [
      {
        question: "How do I create my first recipe?",
        answer: "Navigate to the Recipes page and click 'Add Recipe'. You can either type in your ingredients manually or upload a photo of your ingredients. The AI will then generate a personalized recipe based on what you have available."
      },
      {
        question: "How do I set up my dietary preferences?",
        answer: "Go to your Profile page and scroll to the 'Dietary Preferences' section. You can select from various options like vegetarian, vegan, gluten-free, and more. You can also add specific allergies and intolerances."
      },
      {
        question: "Can I use EatRite without creating an account?",
        answer: "While you can browse some features, creating an account allows you to save recipes, create meal plans, and get personalized AI recommendations based on your preferences and history."
      }
    ]
  },
  {
    category: "Recipe Creation",
    icon: ChefHat,
    items: [
      {
        question: "How does the AI recipe generation work?",
        answer: "Our AI analyzes your ingredients, dietary preferences, and cooking time preferences to create personalized recipes. It considers nutritional balance, cooking techniques, and flavor combinations to suggest the best possible dishes."
      },
      {
        question: "Can I upload photos of my ingredients?",
        answer: "Yes! Click the camera icon in the recipe creation page to upload a photo of your ingredients. The AI will identify the ingredients and you can add or remove items as needed."
      },
      {
        question: "How accurate are the nutritional information?",
        answer: "Nutritional information is calculated based on standard ingredient databases. However, actual values may vary based on specific brands and preparation methods. We recommend using this as a general guide."
      }
    ]
  },
  {
    category: "Meal Planning",
    icon: Calendar,
    items: [
      {
        question: "How do I create a meal plan?",
        answer: "Go to the Meal Plan page and click 'Create Plan'. Choose a time frame (1 week, 2 weeks, or 1 month), give your plan a name, and start adding meals. You can also use AI to generate a complete meal plan automatically."
      },
      {
        question: "Can I share my meal plans with family?",
        answer: "Currently, meal plans are private to your account. We're working on sharing features that will allow you to collaborate with family members and share meal plans."
      },
      {
        question: "How do I modify a meal plan?",
        answer: "Click on any date in your meal plan calendar to view and edit meals. You can add, remove, or modify meals, change serving sizes, and add notes to each meal."
      }
    ]
  },
  {
    category: "Account & Settings",
    icon: Settings,
    items: [
      {
        question: "How do I change my password?",
        answer: "Go to your Profile page and click on 'Account Settings'. You'll find an option to change your password. You'll need to enter your current password for security."
      },
      {
        question: "Can I export my recipes?",
        answer: "Yes! In your Profile settings, you can export all your saved recipes, meal plans, and preferences. This data is provided in a standard format that you can save or share."
      },
      {
        question: "How do I delete my account?",
        answer: "Go to Account Settings in your Profile and scroll to the bottom. You'll find a 'Delete Account' option. Please note that this action is permanent and will remove all your data."
      }
    ]
  },
  {
    category: "Troubleshooting",
    icon: AlertCircle,
    items: [
      {
        question: "The AI isn't generating recipes. What should I do?",
        answer: "First, make sure you have ingredients added to your recipe. Check your internet connection and try refreshing the page. If the problem persists, try adding more specific ingredients or contact support."
      },
      {
        question: "My meal plan isn't saving. What's wrong?",
        answer: "Ensure you're logged into your account. Check your browser's storage settings and try using a different browser. If the issue continues, clear your browser cache and try again."
      },
      {
        question: "I can't upload photos. What's the issue?",
        answer: "Make sure you're using a supported browser (Chrome, Firefox, Safari, Edge). Check that the image file is under 10MB and in a common format (JPG, PNG, WebP). Try refreshing the page if the upload button isn't working."
      }
    ]
  }
]

// Contact form data
const contactCategories = [
  { value: "technical", label: "Technical Issue" },
  { value: "feature", label: "Feature Request" },
  { value: "billing", label: "Billing Question" },
  { value: "bug", label: "Bug Report" },
  { value: "general", label: "General Inquiry" }
]

export default function HelpPage() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    category: "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter FAQ based on search query
  const filteredFAQ = faqData.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0)

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      toast.success("Thank you! Your message has been sent. We'll get back to you within 24 hours.")
      setContactForm({
        name: "",
        email: "",
        category: "",
        subject: "",
        message: ""
      })
      setIsSubmitting(false)
    }, 2000)
  }

  const handleInputChange = (field: string, value: string) => {
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="flex flex-1 flex-col gap-6 pl-2 pr-6 pb-6 pt-0">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Help & Support</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Help Articles
          </CardTitle>
          <CardDescription>
            Find answers to common questions and troubleshooting guides
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              User Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Complete guide to using EatRite</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Live Chat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Chat with our support team</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Send us an email</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Call Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Speak with support</p>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Find answers to the most common questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredFAQ.map((category) => (
                <Collapsible
                  key={category.category}
                  open={expandedCategory === category.category}
                  onOpenChange={(open) => setExpandedCategory(open ? category.category : null)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-4 h-auto"
                    >
                      <div className="flex items-center gap-2">
                        <category.icon className="h-4 w-4" />
                        <span className="font-medium">{category.category}</span>
                        <Badge variant="secondary">{category.items.length}</Badge>
                      </div>
                      {expandedCategory === category.category ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 pl-6">
                    {category.items.map((item, index) => (
                      <div key={index} className="border-l-2 border-muted pl-4 py-2">
                        <h4 className="font-medium text-sm mb-1">{item.question}</h4>
                        <p className="text-sm text-muted-foreground">{item.answer}</p>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Contact Support
            </CardTitle>
            <CardDescription>
              Send us a message and we&apos;ll get back to you within 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={contactForm.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={contactForm.category}
                  onValueChange={(value) => handleInputChange("category", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={contactForm.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  placeholder="Brief description of your issue"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={contactForm.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  placeholder="Please provide details about your issue or question..."
                  rows={4}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Additional Support Options */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Community Forum
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Connect with other EatRite users, share recipes, and get tips from the community.
            </p>
            <Button variant="outline" className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit Forum
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Access detailed documentation, API references, and developer guides.
            </p>
            <Button variant="outline" className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Docs
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Feature Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Suggest new features and vote on ideas from other users.
            </p>
            <Button variant="outline" className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              Submit Idea
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Other Ways to Reach Us</CardTitle>
          <CardDescription>
            We&apos;re here to help with any questions or issues you might have
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">support@eatrite.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Hours</p>
                <p className="text-sm text-muted-foreground">Mon-Fri 9AM-6PM EST</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Live Chat</p>
                <p className="text-sm text-muted-foreground">Available 24/7</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 