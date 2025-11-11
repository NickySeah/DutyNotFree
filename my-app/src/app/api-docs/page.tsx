"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Code, Database, Globe, Zap } from "lucide-react";

export default function ApiDocsPage() {
  const endpoints = [
    {
      method: "GET",
      path: "/api/v1/tariffs/all",
      description: "Retrieve all tariff data for analytics",
      category: "Core Data",
    },
    {
      method: "GET",
      path: "/api/v1/countries/all",
      description: "Get all countries for filtering",
      category: "Core Data",
    },
    {
      method: "GET",
      path: "/api/v1/products/all",
      description: "Get all products for chart data",
      category: "Core Data",
    },
    {
      method: "GET",
      path: "/api/v1/analytics/country-competitiveness",
      description: "Country competitiveness analysis",
      category: "Analytics",
    },
    {
      method: "GET",
      path: "/api/v1/analytics/product-risk",
      description: "Product risk assessment data",
      category: "Analytics",
    },
    {
      method: "GET",
      path: "/api/v1/analytics/market-share",
      description: "Product market share data",
      category: "Analytics",
    },
    {
      method: "GET",
      path: "/api/v1/calculator",
      description: "Calculate total landed cost",
      category: "Calculator",
    },
  ];

  const categories = [...new Set(endpoints.map((e) => e.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pt-0">
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4 flex items-center text-white">
            <Code className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3 text-blue-400" />
            API Documentation
          </h1>
          <p className="text-white text-sm md:text-lg">
            Complete reference for the Tariff Analytics API endpoints
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center">
                <Database className="w-6 h-6 md:w-8 md:h-8 text-green-400 mb-2 sm:mb-0 sm:mr-3" />
                <div>
                  <p className="text-xl md:text-2xl font-bold text-white">
                    {endpoints.length}
                  </p>
                  <p className="text-white text-xs md:text-sm">Endpoints</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center">
                <Globe className="w-6 h-6 md:w-8 md:h-8 text-blue-400 mb-2 sm:mb-0 sm:mr-3" />
                <div>
                  <p className="text-xl md:text-2xl font-bold text-white">
                    {categories.length}
                  </p>
                  <p className="text-white text-xs md:text-sm">Categories</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center">
                <Zap className="w-6 h-6 md:w-8 md:h-8 text-yellow-400 mb-2 sm:mb-0 sm:mr-3" />
                <div>
                  <p className="text-xl md:text-2xl font-bold text-white">
                    100/min
                  </p>
                  <p className="text-white text-xs md:text-sm">Rate Limit</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center">
                <ExternalLink className="w-6 h-6 md:w-8 md:h-8 text-purple-400 mb-2 sm:mb-0 sm:mr-3" />
                <div>
                  <p className="text-xl md:text-2xl font-bold text-white">REST</p>
                  <p className="text-white text-xs md:text-sm">API Type</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Base URL */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6 md:mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-white text-base md:text-lg">
              <Globe className="w-4 h-4 md:w-5 md:h-5 mr-2 text-blue-400" />
              Base URL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <code className="bg-slate-700 px-3 md:px-4 py-2 rounded text-green-400 font-mono text-xs md:text-sm break-all">
                http://localhost:3001
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigator.clipboard.writeText("http://localhost:3001")
                }
                className="border-slate-600 text-slate-300 hover:bg-slate-700 w-full sm:w-auto"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Endpoints by Category */}
        {categories.map((category) => (
          <Card
            key={category}
            className="bg-slate-800/50 border-slate-700 mb-4 md:mb-6"
          >
            <CardHeader>
              <CardTitle className="text-lg md:text-xl text-white">
                {category} Endpoints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                {endpoints
                  .filter((endpoint) => endpoint.category === category)
                  .map((endpoint, index) => (
                    <div
                      key={index}
                      className="border border-slate-600 rounded-lg p-3 md:p-4"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                          <Badge
                            variant="secondary"
                            className={`${
                              endpoint.method === "GET"
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : endpoint.method === "POST"
                                ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                : endpoint.method === "PUT"
                                ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                : "bg-red-500/20 text-red-400 border-red-500/30"
                            } text-xs md:text-sm`}
                          >
                            {endpoint.method}
                          </Badge>
                          <code className="text-white font-mono text-xs md:text-sm break-all">
                            {endpoint.path}
                          </code>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigator.clipboard.writeText(
                              `curl -X ${endpoint.method} http://localhost:3001${endpoint.path}`
                            )
                          }
                          className="border-slate-600 text-slate-300 hover:bg-slate-700 w-full sm:w-auto"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-white text-xs md:text-sm">
                        {endpoint.description}
                      </p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Usage Examples */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-lg md:text-xl">
              Usage Examples
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 text-white text-sm md:text-base">
                  Fetch All Tariffs
                </h4>
                <div className="bg-slate-900 p-3 md:p-4 rounded-lg overflow-x-auto">
                  <code className="text-green-400 text-xs md:text-sm break-all">
                    fetch('http://localhost:3001/api/v1/tariffs/all')
                  </code>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-white text-sm md:text-base">
                  Get Country Competitiveness
                </h4>
                <div className="bg-slate-900 p-3 md:p-4 rounded-lg overflow-x-auto">
                  <code className="text-green-400 text-xs md:text-sm break-all">
                    fetch('http://localhost:3001/api/v1/analytics/country-competitiveness?country=United
                    States')
                  </code>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-white text-sm md:text-base">
                  Calculate Tariff Cost
                </h4>
                <div className="bg-slate-900 p-3 md:p-4 rounded-lg overflow-x-auto">
                  <code className="text-green-400 text-xs md:text-sm break-all">
                    fetch('http://localhost:3001/api/v1/calculator?value=1000&origin=666&dest=840&hsCode=22030011&date=2024-01-01')
                  </code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 md:mt-8 text-center text-white px-4">
          <p className="text-xs md:text-sm">
            For complete documentation, see the{" "}
            <code className="bg-slate-700 px-2 py-1 rounded text-white text-xs md:text-sm">
              API_DOCUMENTATION.md
            </code>{" "}
            file
          </p>
        </div>
      </div>
    </div>
  );
}
