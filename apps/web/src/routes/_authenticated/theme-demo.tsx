import { createFileRoute } from '@tanstack/react-router';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeSwitcher } from '@/features/theme';

export const Route = createFileRoute('/_authenticated/theme-demo')({
  component: ThemeDemo,
});

function ThemeDemo() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Theme System Demo</h1>
        <p className="text-muted-foreground">
          Test the white-label theming system with different color schemes and variants.
        </p>
      </div>

      <ThemeSwitcher />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Button Variants</CardTitle>
            <CardDescription>All button variants using semantic colors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Primary (Default)</Label>
              <div className="flex gap-2">
                <Button variant="default">Default</Button>
                <Button variant="default" disabled>
                  Disabled
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Secondary</Label>
              <div className="flex gap-2">
                <Button variant="secondary">Secondary</Button>
                <Button variant="secondary" disabled>
                  Disabled
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ghost</Label>
              <div className="flex gap-2">
                <Button variant="ghost">Ghost</Button>
                <Button variant="ghost" disabled>
                  Disabled
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Outline</Label>
              <div className="flex gap-2">
                <Button variant="outline">Outline</Button>
                <Button variant="outline" disabled>
                  Disabled
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Destructive</Label>
              <div className="flex gap-2">
                <Button variant="destructive">Destructive</Button>
                <Button variant="destructive" disabled>
                  Disabled
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Link</Label>
              <div className="flex gap-2">
                <Button variant="link">Link</Button>
                <Button variant="link" disabled>
                  Disabled
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
            <CardDescription>Input fields and form controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="email@example.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="John Doe" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="disabled">Disabled Input</Label>
              <Input id="disabled" disabled placeholder="Disabled" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
            <CardDescription>Different badge variants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cards</CardTitle>
            <CardDescription>This is a card component using theme colors</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Cards automatically use the card background and foreground colors from the active
              theme. They also respect the border radius setting.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
          <CardDescription>How to test the white-label theming system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">1. Test URL Parameters</h3>
            <p className="text-sm text-muted-foreground">
              Add a referral parameter to the URL to simulate a customer-specific theme:
            </p>
            <code className="block p-2 bg-muted rounded text-sm">
              {window.location.origin}/?referral_page=customer123
            </code>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">2. Switch Themes</h3>
            <p className="text-sm text-muted-foreground">
              Use the theme switcher above to test different example themes. Notice how all
              components update to use the new color scheme.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">3. Toggle Dark Mode</h3>
            <p className="text-sm text-muted-foreground">
              Click the sun/moon icon to switch between light and dark modes. Each theme defines
              colors for both modes.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">4. Backend Integration</h3>
            <p className="text-sm text-muted-foreground">
              To integrate with your backend, implement the endpoint:
            </p>
            <code className="block p-2 bg-muted rounded text-sm">
              GET /v1/themes/customer/:customerId
            </code>
            <p className="text-sm text-muted-foreground mt-2">
              See THEMING_GUIDE.md for the expected response format and database schema.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
