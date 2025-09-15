"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sparkles, Wand2, Target, ArrowRight, Lightbulb, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ParsedCondition {
  field: string
  operator: string
  value: number
  description: string
}

interface AISegmentResult {
  name: string
  conditions: ParsedCondition[]
  logic: "AND" | "OR"
  confidence: number
}

export function AIAssistant() {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AISegmentResult | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const examplePrompts = [
    "Find customers who spent more than $500 and visited in the last 30 days",
    "Show me high-value customers who haven't visited in over 60 days",
    "Target customers with less than 3 visits but spent over $200",
    "Find inactive customers who spent between $100 and $1000",
  ]

  const processAIRequest = async () => {
    if (!input.trim()) {
      toast({
        title: "Empty input",
        description: "Please describe the customer segment you want to create.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Simulate AI processing with a delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock AI parsing - in real implementation, this would call an AI API
      const mockResult = parseNaturalLanguage(input)
      setResult(mockResult)

      toast({
        title: "Segment parsed successfully",
        description: "Your natural language description has been converted to segment rules.",
      })
    } catch (error) {
      toast({
        title: "AI processing failed",
        description: "Unable to parse your request. Please try rephrasing.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const parseNaturalLanguage = (text: string): AISegmentResult => {
    // Mock AI parsing logic - this would be replaced with actual AI integration
    const lowerText = text.toLowerCase()
    const conditions: ParsedCondition[] = []

    // Parse spending conditions
    if (lowerText.includes("spent more than") || lowerText.includes("spending over")) {
      const match = text.match(/\$?(\d+)/g)
      if (match) {
        conditions.push({
          field: "spend",
          operator: ">",
          value: Number.parseInt(match[0].replace("$", "")),
          description: `Total spending greater than $${match[0].replace("$", "")}`,
        })
      }
    }

    if (lowerText.includes("spent less than") || lowerText.includes("spending under")) {
      const match = text.match(/\$?(\d+)/g)
      if (match) {
        conditions.push({
          field: "spend",
          operator: "<",
          value: Number.parseInt(match[0].replace("$", "")),
          description: `Total spending less than $${match[0].replace("$", "")}`,
        })
      }
    }

    // Parse visit conditions
    if (lowerText.includes("visited in the last") || lowerText.includes("active in")) {
      const match = text.match(/(\d+)\s*days?/g)
      if (match) {
        conditions.push({
          field: "inactiveDays",
          operator: "<",
          value: Number.parseInt(match[0]),
          description: `Last visit within ${match[0]} days`,
        })
      }
    }

    if (lowerText.includes("haven't visited") || lowerText.includes("inactive")) {
      const match = text.match(/(\d+)\s*days?/g)
      if (match) {
        conditions.push({
          field: "inactiveDays",
          operator: ">",
          value: Number.parseInt(match[0]),
          description: `Inactive for more than ${match[0]} days`,
        })
      }
    }

    // Parse visit count conditions
    if (lowerText.includes("less than") && lowerText.includes("visit")) {
      const match = text.match(/less than (\d+) visit/g)
      if (match) {
        const num = match[0].match(/\d+/)
        if (num) {
          conditions.push({
            field: "visits",
            operator: "<",
            value: Number.parseInt(num[0]),
            description: `Fewer than ${num[0]} visits`,
          })
        }
      }
    }

    // Default conditions if none found
    if (conditions.length === 0) {
      conditions.push({
        field: "spend",
        operator: ">",
        value: 100,
        description: "Total spending greater than $100 (default)",
      })
    }

    // Generate segment name
    let name = "AI Generated Segment"
    if (lowerText.includes("high-value") || lowerText.includes("high value")) {
      name = "High-Value Customers"
    } else if (lowerText.includes("inactive")) {
      name = "Inactive Customers"
    } else if (lowerText.includes("new") || lowerText.includes("recent")) {
      name = "New Customers"
    }

    return {
      name,
      conditions,
      logic: lowerText.includes(" or ") ? "OR" : "AND",
      confidence: Math.random() * 0.3 + 0.7, // Mock confidence between 70-100%
    }
  }

  const createSegmentFromAI = () => {
    if (!result) return

    // Convert AI result to segment builder format
    const segmentData = {
      name: result.name,
      conditions: result.conditions.map((c) => ({
        field: c.field,
        operator: c.operator,
        value: c.value,
      })),
      logic: result.logic,
    }

    // Navigate to segment builder with pre-filled data
    const params = new URLSearchParams({
      aiGenerated: "true",
      data: JSON.stringify(segmentData),
    })
    router.push(`/segments/create?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground font-playfair">AI Segment Assistant</h1>
        <p className="text-muted-foreground mt-2">
          Describe your target audience in plain English and let AI create segment rules for you
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* AI Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-primary" />
                Describe Your Target Audience
              </CardTitle>
              <CardDescription>
                Use natural language to describe the customers you want to target. Be specific about spending, visit
                frequency, and activity levels.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ai-input">Customer Segment Description</Label>
                <Textarea
                  id="ai-input"
                  placeholder="e.g., Find customers who spent more than $500 and visited in the last 30 days"
                  rows={4}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>

              <Button onClick={processAIRequest} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    <span>Processing with AI...</span>
                  </div>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Segment Rules
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* AI Result */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Target className="w-5 h-5 mr-2 text-primary" />
                    Generated Segment Rules
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {Math.round(result.confidence * 100)}% confidence
                  </Badge>
                </CardTitle>
                <CardDescription>AI has parsed your description into the following segment rules</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Segment Name</Label>
                  <p className="text-lg font-semibold">{result.name}</p>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium">Conditions ({result.logic} logic)</Label>
                  <div className="space-y-2 mt-2">
                    {result.conditions.map((condition, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{condition.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {condition.field} {condition.operator} {condition.value}
                          </p>
                        </div>
                        <Badge variant="outline">{condition.field}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={createSegmentFromAI} className="w-full">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Create This Segment
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Examples */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-primary" />
                Example Prompts
              </CardTitle>
              <CardDescription>Try these example descriptions to get started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {examplePrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full text-left h-auto p-3 justify-start bg-transparent"
                  onClick={() => setInput(prompt)}
                >
                  <MessageSquare className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">{prompt}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Tips for Better Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium">Be Specific</p>
                <p className="text-muted-foreground">Include exact numbers for spending amounts and time periods</p>
              </div>
              <div>
                <p className="font-medium">Use Keywords</p>
                <p className="text-muted-foreground">
                  Words like &quot;spent&quot;, &quot;visited&quot;, &quot;inactive&quot;, &quot;high-value&quot; help AI understand better
                </p>
              </div>
              <div>
                <p className="font-medium">Combine Conditions</p>
                <p className="text-muted-foreground">Use &quot;and&quot; or &quot;or&quot; to combine multiple criteria</p>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>AI Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm">AI Assistant Ready</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                This is a demo implementation. In production, this would connect to a real AI service.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
