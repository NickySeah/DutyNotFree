"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Users, 
  Target, 
  Lightbulb, 
  Code, 
  Database,
  Globe,
  TrendingUp,
  BookOpen,
  Github,
  Linkedin,
  Mail
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const features = [
    {
      icon: <Database className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />,
      title: "Comprehensive Tariff Database",
      description: "Access detailed information on international trade tariffs and Free Trade Agreements."
    },
    {
      icon: <Globe className="h-5 w-5 md:h-6 md:w-6 text-green-600" />,
      title: "Multi-Country Support",
      description: "Calculate duties across multiple countries and trade routes with ease."
    },
    {
      icon: <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />,
      title: "Real-time Calculations",
      description: "Get instant duty calculations based on current tariff rates and FTA provisions."
    },
    {
      icon: <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-orange-600" />,
      title: "Educational Tool",
      description: "Learn about international trade, customs duties, and FTA benefits."
    }
  ];

  const techStack = [
    { name: "Next.js", category: "Frontend" },
    { name: "React", category: "Frontend" },
    { name: "TypeScript", category: "Language" },
    { name: "Tailwind CSS", category: "Styling" },
    { name: "Java", category: "Backend" },
    { name: "MySQL", category: "Database" },
    { name: "Better Auth", category: "Authentication" },
  ];

  const team = [
    {
      name: "Bryan",
      role: "Scrum Master + Backend Developer",
      description: "School"
    },
    {
      name: "Denzyl",
      role: "Product Module",
      description: "School"
    },
    {
      name: "Fermin",
      role: "Calculator Specialist",
      description: "School"
    },
    {
      name: "Nicholas",
      role: "Login & Registration Specialist",
      description: "School"
    },
    {
      name: "Zhen Yang",
      role: "Graph Specialist",
      description: "School"
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-red-600 to-blue-950 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center space-y-4 md:space-y-6">
            <div className="flex justify-center mb-4 md:mb-6">
              <GraduationCap className="h-12 w-12 md:h-16 md:w-16" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              About <span className="text-yellow-300">DutyNotFree</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto text-blue-100 px-4">
              A student project from Singapore Management University, simplifying international trade calculations
            </p>
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 pt-2 md:pt-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs md:text-sm px-3 md:px-4 py-1">
                SMU Project
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs md:text-sm px-3 md:px-4 py-1">
                Educational
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs md:text-sm px-3 md:px-4 py-1">
                Open Source
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-4 md:space-y-6">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium">
              <Target className="h-3 w-3 md:h-4 md:w-4" />
              Our Mission
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
              Democratizing Trade Information
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-gray-600 leading-relaxed">
              DutyNotFree was born from a simple observation: calculating international trade duties 
              and understanding Free Trade Agreements is unnecessarily complex. As students at 
              Singapore Management University, we recognized the need for a user-friendly platform 
              that makes this information accessible to everyone.
            </p>
            <p className="text-sm md:text-base lg:text-lg text-gray-600 leading-relaxed">
              Our goal is to empower businesses, students, and researchers with accurate, 
              up-to-date information about international trade tariffs and FTA benefits, 
              presented in an intuitive and easy-to-use interface.
            </p>
          </div>
          <Card className="border-2 border-blue-200 shadow-lg">
            <CardHeader className="bg-gradient-to-br from-blue-50 to-purple-50">
              <CardTitle className="flex items-center gap-2 md:gap-3 text-lg md:text-xl">
                <Lightbulb className="h-5 w-5 md:h-6 md:w-6 text-yellow-500" />
                Why We Built This
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4 pt-4 md:pt-6">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                  <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-1">Educational Purpose</h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    Apply classroom knowledge to real-world challenges in international trade
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 md:gap-4">
                <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                  <Users className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-1">Solve Real Problems</h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    Address the complexity of duty calculations faced by businesses and individuals
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 md:gap-4">
                <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
                  <Code className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-1">Technical Learning</h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    Gain hands-on experience with modern web development technologies
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
              Platform Features
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
              What makes DutyNotFree a comprehensive solution for international trade calculations
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-blue-300 transition-colors hover:shadow-lg">
                <CardContent className="pt-4 md:pt-6 space-y-2 md:space-y-3">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center mb-2 md:mb-3">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                    {feature.title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium mb-3 md:mb-4">
            <Code className="h-3 w-3 md:h-4 md:w-4" />
            Technology Stack
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
            Built with Modern Technologies
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
            Leveraging industry-standard tools and frameworks to deliver a robust platform
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4">
          {techStack.map((tech, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-3 md:p-4 space-y-1 md:space-y-2">
                <div className="font-semibold text-gray-900 text-xs md:text-sm">
                  {tech.name}
                </div>
                <Badge variant="outline" className="text-[10px] md:text-xs">
                  {tech.category}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium mb-3 md:mb-4">
              <Users className="h-3 w-3 md:h-4 md:w-4" />
              Our Team
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
              Meet the Developers
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
              Students at Singapore Management University passionate about technology and international trade
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-red-600 to-blue-950 rounded-full mx-auto mb-3 md:mb-4 flex items-center justify-center">
                    <Users className="h-8 w-8 md:h-10 md:w-10 text-white" />
                  </div>
                  <CardTitle className="text-base md:text-lg">{member.name}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {member.role}
                  </Badge>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-xs md:text-sm text-gray-600">
                    {member.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-red-600 to-blue-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center space-y-4 md:space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              Ready to Simplify Your Trade Calculations?
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-blue-100 max-w-2xl mx-auto px-4">
              Join us in making international trade more accessible and transparent
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center pt-2 md:pt-4">
              <Button 
                asChild 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 text-sm md:text-base h-10 md:h-11 px-6 md:px-8"
              >
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="text-center space-y-3 md:space-y-4">
            <p className="text-xs md:text-sm text-gray-600">
              This project is developed as part of our coursework at Singapore Management University.
              <br className="hidden sm:block" />
              The information provided is for educational purposes and should be verified with official sources.
            </p>
            <div className="flex justify-center gap-4 md:gap-6">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 h-8 md:h-9 text-xs md:text-sm">
                <Github className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" />
                GitHub
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 h-8 md:h-9 text-xs md:text-sm">
                <Mail className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" />
                Contact
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}