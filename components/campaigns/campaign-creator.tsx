"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Send, Users, Target } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface Segment {
  _id: string
  name: string
  audienceSize?: number
}

interface CampaignData {
  name: string
  segmentId: string
  message: string
}

export function CampaignCreator() {
  const [campaign, setCampaign] = useState<CampaignData>({
    name: "",
    segmentId: "",
    message: "",
  })
  const [segments, setSegments] = useState<Segment[]>([])
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingSegments, setIsLoadingSegments] = useState(true)
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchSegments()

    // Pre-select segment if provided in URL
    const segmentId = searchParams.get("segmentId")
    if (segmentId) {
      setCampaign((prev) => ({ ...prev, segmentId }))
    }
  }, [searchParams])

  useEffect(() => {
    if (campaign.segmentId && segments.length > 0) {
      const segment = segments.find((s) => s._id === campaign.segmentId)
      setSelectedSegment(segment || null)
    }
  }, [campaign.segmentId, segments])

  const fetchSegments = async () => {
    try {
      const data = await api.segments.getAll()
      setSegments(data)
    } catch (error) {
      toast({
        title: "Failed to load segments",
        description: "Unable to fetch segments. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingSegments(false)
    }
  }

  const createCampaign = async () => {
    if (!campaign.name || !campaign.segmentId || !campaign.message) {
      toast({
        title: "Incomplete campaign",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const newCampaign = await api.campaigns.create(campaign)
      toast({
        title: "Campaign created",
        description: "Your campaign has been created successfully.",
      })
      router.push(`/campaigns/${newCampaign._id}`)
    } catch (error) {
      toast({
        title: "Creation failed",
        description: "Unable to create campaign. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/campaigns">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground font-playfair">Create Campaign</h1>
          <p className="text-muted-foreground mt-2">Send targeted messages to your customer segments</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Campaign Details */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
              <CardDescription>Basic information about your campaign</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="campaign-name">Campaign Name *</Label>
                <Input
                  id="campaign-name"
                  placeholder="e.g., Summer Sale Promotion"
                  value={campaign.name}
                  onChange={(e) => setCampaign((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="segment-select">Target Segment *</Label>
                {isLoadingSegments ? (
                  <div className="h-10 bg-muted animate-pulse rounded" />
                ) : (
                  <Select
                    value={campaign.segmentId}
                    onValueChange={(value) => setCampaign((prev) => ({ ...prev, segmentId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer segment" />
                    </SelectTrigger>
                    <SelectContent>
                      {segments.map((segment) => (
                        <SelectItem key={segment._id} value={segment._id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{segment.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {segment.audienceSize || 0} customers
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {segments.length === 0 && !isLoadingSegments && (
                  <p className="text-sm text-muted-foreground">
                    No segments available.{" "}
                    <Link href="/segments/create" className="text-primary hover:underline">
                      Create one first
                    </Link>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Message Content */}
          <Card>
            <CardHeader>
              <CardTitle>Message Content</CardTitle>
              <CardDescription>Write the message that will be sent to your customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="campaign-message">Message *</Label>
                <Textarea
                  id="campaign-message"
                  placeholder="Write your campaign message here..."
                  rows={8}
                  value={campaign.message}
                  onChange={(e) => setCampaign((prev) => ({ ...prev, message: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">{campaign.message.length} characters</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          {/* Target Audience */}
          <Card>
            <CardHeader>
              <CardTitle>Target Audience</CardTitle>
              <CardDescription>Who will receive this campaign</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedSegment ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Target className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">{selectedSegment.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedSegment.audienceSize || 0} customers</p>
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{selectedSegment.audienceSize || 0}</div>
                    <div className="text-sm text-muted-foreground">recipients</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select a segment to see audience details</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Campaign Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Name</Label>
                <p className="font-medium">{campaign.name || "Untitled Campaign"}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Target</Label>
                <p className="text-sm">{selectedSegment?.name || "No segment selected"}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Message Length</Label>
                <p className="text-sm">{campaign.message.length} characters</p>
              </div>
              <Button onClick={createCampaign} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    <span>Creating...</span>
                  </div>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Create Campaign
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
