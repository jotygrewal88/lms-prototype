// Phase II Epic 1: Style Check Page (Dev Only)
"use client";

import Card from "@/components/Card";
import Button from "@/components/Button";
import Badge from "@/components/Badge";

export default function StyleCheckPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎨 Style Check Page
          </h1>
          <p className="text-gray-600">
            Verify that Tailwind CSS and global styles are loading correctly.
          </p>
        </div>

        {/* Tailwind Utilities Test */}
        <Card className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Tailwind Utilities
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 font-medium">✓ Background Colors</p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">✓ Border Utilities</p>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-medium">✓ Spacing & Padding</p>
            </div>
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-red-500 rounded"></div>
              <div className="w-16 h-16 bg-blue-500 rounded"></div>
              <div className="w-16 h-16 bg-green-500 rounded"></div>
              <div className="w-16 h-16 bg-yellow-500 rounded"></div>
              <div className="w-16 h-16 bg-purple-500 rounded"></div>
            </div>
          </div>
        </Card>

        {/* Typography Test */}
        <Card className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Typography
          </h2>
          <div className="space-y-2">
            <p className="text-xs text-gray-600">Extra Small Text (text-xs)</p>
            <p className="text-sm text-gray-600">Small Text (text-sm)</p>
            <p className="text-base text-gray-600">Base Text (text-base)</p>
            <p className="text-lg text-gray-600">Large Text (text-lg)</p>
            <p className="text-xl text-gray-900">Extra Large Text (text-xl)</p>
            <p className="text-2xl font-bold text-gray-900">2XL Bold (text-2xl font-bold)</p>
          </div>
        </Card>

        {/* Component Test */}
        <Card className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Components
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Buttons</h3>
              <div className="flex gap-2 flex-wrap">
                <Button variant="primary">Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="primary" disabled>Disabled Button</Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Badges</h3>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="default">Default</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="error">Error</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="info">Info</Badge>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Cards</h3>
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 text-center">
                  <p className="font-medium">Card 1</p>
                </Card>
                <Card className="p-4 text-center">
                  <p className="font-medium">Card 2</p>
                </Card>
                <Card className="p-4 text-center">
                  <p className="font-medium">Card 3</p>
                </Card>
              </div>
            </div>
          </div>
        </Card>

        {/* Grid & Layout Test */}
        <Card className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Layout & Grid
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-100 rounded-lg text-center">
              <p className="font-medium">Column 1</p>
            </div>
            <div className="p-4 bg-green-100 rounded-lg text-center">
              <p className="font-medium">Column 2</p>
            </div>
            <div className="p-4 bg-yellow-100 rounded-lg text-center">
              <p className="font-medium">Column 3</p>
            </div>
            <div className="p-4 bg-purple-100 rounded-lg text-center">
              <p className="font-medium">Column 4</p>
            </div>
          </div>
        </Card>

        {/* Flexbox Test */}
        <Card className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Flexbox
          </h2>
          <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
            <span className="font-medium">Left</span>
            <span className="font-medium">Center</span>
            <span className="font-medium">Right</span>
          </div>
        </Card>

        {/* Responsive Test */}
        <Card className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Responsive Classes
          </h2>
          <div className="space-y-2">
            <div className="p-4 bg-gray-100 rounded-lg">
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl">
                Responsive text sizing (resize window to see changes)
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              <div className="p-2 bg-blue-200 rounded text-center">1</div>
              <div className="p-2 bg-blue-200 rounded text-center">2</div>
              <div className="p-2 bg-blue-200 rounded text-center">3</div>
              <div className="p-2 bg-blue-200 rounded text-center">4</div>
            </div>
          </div>
        </Card>

        {/* Shadows & Borders */}
        <Card className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Shadows & Borders
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-white shadow-sm border border-gray-200 rounded-lg text-center">
              <p className="text-sm">shadow-sm</p>
            </div>
            <div className="p-4 bg-white shadow-md border border-gray-200 rounded-lg text-center">
              <p className="text-sm">shadow-md</p>
            </div>
            <div className="p-4 bg-white shadow-lg border border-gray-200 rounded-lg text-center">
              <p className="text-sm">shadow-lg</p>
            </div>
          </div>
        </Card>

        {/* Hover & Transitions */}
        <Card className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Hover & Transitions
          </h2>
          <div className="space-y-2">
            <div className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer">
              Hover over me (color transition)
            </div>
            <div className="p-4 bg-green-500 text-white rounded-lg hover:scale-105 transition-transform cursor-pointer">
              Hover over me (scale transform)
            </div>
            <div className="p-4 bg-purple-500 text-white rounded-lg hover:shadow-xl transition-shadow cursor-pointer">
              Hover over me (shadow transition)
            </div>
          </div>
        </Card>

        {/* Status Check */}
        <Card className="bg-green-50 border border-green-200">
          <div className="flex items-center gap-3">
            <div className="text-4xl">✅</div>
            <div>
              <h3 className="text-xl font-semibold text-green-900 mb-1">
                Styles are Loading!
              </h3>
              <p className="text-green-700">
                If you can see colors, spacing, and styled components, Tailwind CSS is working correctly.
              </p>
            </div>
          </div>
        </Card>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">✓ Checklist</h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>✓ Colors are displaying (not black/white)</li>
            <li>✓ Spacing and padding look correct</li>
            <li>✓ Buttons are styled (not plain HTML)</li>
            <li>✓ Cards have white backgrounds and shadows</li>
            <li>✓ Text has proper sizing and colors</li>
            <li>✓ Hover effects work</li>
          </ul>
        </div>

        {/* Debug Info */}
        <div className="mt-6 p-4 bg-gray-100 border border-gray-300 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Debug Info</h3>
          <div className="text-xs text-gray-600 space-y-1 font-mono">
            <p>Tailwind Version: v3.x</p>
            <p>Build Time: {new Date().toISOString()}</p>
            <p>Window Width: {typeof window !== "undefined" ? window.innerWidth : "N/A"}px</p>
            <p>Global CSS: app/globals.css</p>
            <p>Config: tailwind.config.ts</p>
          </div>
        </div>
      </div>
    </div>
  );
}

