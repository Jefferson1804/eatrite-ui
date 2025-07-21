import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Plus, Clock, Utensils, Calendar, Search, BookOpen } from "lucide-react"

// Home page now renders the dashboard content
export default function HomePage() {
  return (
    // Removed SidebarProvider, AppSidebar, SidebarInset, and SidebarTrigger as sidebar is now handled in layout
    <div className="flex flex-1 flex-col gap-6 pl-2 pr-6 pb-6 pt-0"> {/* Reduced left padding from p-6 to pl-2 for better alignment */}
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          {/* SidebarTrigger removed */}
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Add Recipe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Plus className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Create new recipe</span>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Meal Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Plan your week</span>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Browse Recipes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Find inspiration</span>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Shopping List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">View ingredients</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Recipes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Recipes</CardTitle>
            <CardDescription>Your recently added or viewed recipes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 rounded-lg border">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <Utensils className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Spaghetti Carbonara</h4>
                  <p className="text-sm text-muted-foreground">Italian • 30 min</p>
                </div>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </div>
              <div className="flex items-center space-x-4 p-3 rounded-lg border">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <Utensils className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Chicken Stir Fry</h4>
                  <p className="text-sm text-muted-foreground">Asian • 25 min</p>
                </div>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </div>
              <div className="flex items-center space-x-4 p-3 rounded-lg border">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <Utensils className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Greek Salad</h4>
                  <p className="text-sm text-muted-foreground">Mediterranean • 15 min</p>
                </div>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today&apos;s Meal Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Meals</CardTitle>
            <CardDescription>Your planned meals for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Breakfast</p>
                  <p className="text-xs text-muted-foreground">Oatmeal with berries</p>
                </div>
                <Clock className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Lunch</p>
                  <p className="text-xs text-muted-foreground">Chicken Caesar Salad</p>
                </div>
                <Clock className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Dinner</p>
                  <p className="text-xs text-muted-foreground">Grilled Salmon</p>
                </div>
                <Clock className="h-3 w-3 text-muted-foreground" />
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              View Full Plan
            </Button>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Your Stats</CardTitle>
            <CardDescription>This week&apos;s cooking activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Recipes Created</span>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Meals Planned</span>
                <span className="font-semibold">21</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Shopping Lists</span>
                <span className="font-semibold">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Favorites</span>
                <span className="font-semibold">8</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shopping List Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Shopping List</CardTitle>
            <CardDescription>Items you need to buy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-muted rounded-full"></div>
                <span className="text-sm">Chicken breast (2 lbs)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-muted rounded-full"></div>
                <span className="text-sm">Broccoli (1 head)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-muted rounded-full"></div>
                <span className="text-sm">Olive oil</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-muted rounded-full"></div>
                <span className="text-sm">Garlic (3 cloves)</span>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              View Full List
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 