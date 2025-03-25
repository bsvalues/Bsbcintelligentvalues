import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";

export default function ComponentTestPage() {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Component Test Dashboard</h1>

      <Tabs defaultValue="cards" className="mb-8">
        <TabsList>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="inputs">Inputs</TabsTrigger>
          <TabsTrigger value="loading">Loading States</TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Assessment</CardTitle>
                <CardDescription>View property valuation details</CardDescription>
              </CardHeader>
              <CardContent>
                <p>This card displays property assessment information for county tax purposes.</p>
              </CardContent>
              <CardFooter>
                <Button>View Details</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Analysis</CardTitle>
                <CardDescription>Local market trends and data</CardDescription>
              </CardHeader>
              <CardContent>
                <p>This card displays market analysis information for the selected area.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline">View Analysis</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appeals Management</CardTitle>
                <CardDescription>Handle property tax appeals</CardDescription>
              </CardHeader>
              <CardContent>
                <p>This card displays tools for managing appeals of property assessments.</p>
              </CardContent>
              <CardFooter>
                <Button variant="secondary">Manage Appeals</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inputs" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Input Controls</CardTitle>
              <CardDescription>Various input components</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Select Menu</h3>
                <Select>
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select county" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yakima">Yakima County</SelectItem>
                    <SelectItem value="benton">Benton County</SelectItem>
                    <SelectItem value="king">King County</SelectItem>
                    <SelectItem value="pierce">Pierce County</SelectItem>
                    <SelectItem value="clark">Clark County</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Buttons</h3>
                <div className="flex flex-wrap gap-2">
                  <Button>Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loading" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Loading States</CardTitle>
              <CardDescription>Skeleton loaders and loading states</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[300px]" />
                  <Skeleton className="h-20 w-full mt-4" />
                </div>
              ) : (
                <div>
                  <p className="mb-4">Content loaded successfully!</p>
                  <p>This demonstrates the skeleton loading state that appears while content is loading.</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={() => setLoading(!loading)}>
                {loading ? "Finish Loading" : "Simulate Loading"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}