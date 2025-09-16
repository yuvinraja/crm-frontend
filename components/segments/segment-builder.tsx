'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, X, Eye, Save, ArrowLeft, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { SegmentCondition, CreateSegmentRequest } from '@/lib/types';
import Link from 'next/link';

interface SegmentData {
  name: string;
  conditions: SegmentCondition[];
  logic: 'AND' | 'OR';
}

const FIELD_OPTIONS = [
  { value: 'totalSpending', label: 'Total Spending', type: 'number' },
  { value: 'lastVisit', label: 'Last Visit Date', type: 'date' },
  { value: 'name', label: 'Customer Name', type: 'text' },
  { value: 'email', label: 'Email Address', type: 'text' },
];

const OPERATOR_OPTIONS = [
  { value: '>', label: 'Greater than' },
  { value: '<', label: 'Less than' },
  { value: '>=', label: 'Greater than or equal' },
  { value: '<=', label: 'Less than or equal' },
  { value: '=', label: 'Equal to' },
  { value: '!=', label: 'Not equal to' },
];

export function SegmentBuilder() {
  const [segment, setSegment] = useState<SegmentData>({
    name: '',
    conditions: [{ field: '', operator: '', value: '' }],
    logic: 'AND',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [audienceSize, setAudienceSize] = useState<number | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const aiGenerated = searchParams.get('aiGenerated');
    const data = searchParams.get('data');

    if (aiGenerated === 'true' && data) {
      try {
        const parsedData = JSON.parse(data);
        setSegment(parsedData);
        setIsAIGenerated(true);
        toast({
          title: 'AI segment loaded',
          description:
            'Your AI-generated segment has been loaded. Review and save when ready.',
        });
      } catch (error) {
        toast({
          title: 'Failed to load AI segment',
          description: 'There was an error loading the AI-generated segment.',
          variant: 'destructive',
        });
      }
    }
  }, [searchParams, toast]);

  const addCondition = () => {
    setSegment((prev) => ({
      ...prev,
      conditions: [...prev.conditions, { field: '', operator: '', value: '' }],
    }));
  };

  const removeCondition = (index: number) => {
    if (segment.conditions.length > 1) {
      setSegment((prev) => ({
        ...prev,
        conditions: prev.conditions.filter((_, i) => i !== index),
      }));
    }
  };

  const updateCondition = (
    index: number,
    field: keyof SegmentCondition,
    value: string | number
  ) => {
    setSegment((prev) => ({
      ...prev,
      conditions: prev.conditions.map((condition, i) =>
        i === index ? { ...condition, [field]: value } : condition
      ),
    }));
  };

  const previewAudience = async () => {
    if (
      !segment.name ||
      segment.conditions.some((c) => !c.field || !c.operator || c.value === '')
    ) {
      toast({
        title: 'Incomplete segment',
        description:
          'Please fill in all fields before previewing the audience.',
        variant: 'destructive',
      });
      return;
    }

    setIsPreviewLoading(true);
    try {
      const previewData = {
        name: segment.name, // Include name for preview
        conditions: segment.conditions,
        logic: segment.logic,
      };
      const result = await api.segments.preview(previewData);
      setAudienceSize(result.audienceSize);
      toast({
        title: 'Audience Preview',
        description: `This segment would target ${result.audienceSize} customers.`,
      });
    } catch (error) {
      console.error('Preview failed:', error);
      toast({
        title: 'Preview failed',
        description: 'Unable to preview audience. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const saveSegment = async () => {
    if (
      !segment.name ||
      segment.conditions.some((c) => !c.field || !c.operator || c.value === '')
    ) {
      toast({
        title: 'Incomplete segment',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await api.segments.create(segment);
      toast({
        title: 'Segment created',
        description: 'Your customer segment has been saved successfully.',
      });
      // Redirect to campaigns page to show history of campaigns
      router.push('/campaigns');
    } catch (error) {
      console.error('Save failed:', error);
      toast({
        title: 'Save failed',
        description: 'Unable to save segment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/segments">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-bold text-foreground font-playfair">
              Create Customer Segment
            </h1>
            {isAIGenerated && (
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-800"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                AI Generated
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-2">
            {isAIGenerated
              ? 'Review your AI-generated segment rules and save when ready'
              : 'Define rules to target specific customer groups'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Segment Name */}
          <Card>
            <CardHeader>
              <CardTitle>Segment Details</CardTitle>
              <CardDescription>
                Give your segment a descriptive name
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="segment-name">Segment Name</Label>
                <Input
                  id="segment-name"
                  placeholder="e.g., High-Value Customers"
                  value={segment.name}
                  onChange={(e) =>
                    setSegment((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Segment Rules */}
          <Card>
            <CardHeader>
              <CardTitle>Segment Rules</CardTitle>
              <CardDescription>
                Define the conditions that customers must meet to be included
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Logic Selector */}
              <div className="flex items-center space-x-4">
                <Label>Combine rules with:</Label>
                <Select
                  value={segment.logic}
                  onValueChange={(value: 'AND' | 'OR') =>
                    setSegment((prev) => ({ ...prev, logic: value }))
                  }
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AND">AND</SelectItem>
                    <SelectItem value="OR">OR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Conditions */}
              <div className="space-y-4">
                {segment.conditions.map((condition, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-4 border rounded-lg"
                  >
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Field */}
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Field
                        </Label>
                        <Select
                          value={condition.field}
                          onValueChange={(value) =>
                            updateCondition(index, 'field', value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            {FIELD_OPTIONS.map((field) => (
                              <SelectItem key={field.value} value={field.value}>
                                {field.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Operator */}
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Operator
                        </Label>
                        <Select
                          value={condition.operator}
                          onValueChange={(value) =>
                            updateCondition(index, 'operator', value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select operator" />
                          </SelectTrigger>
                          <SelectContent>
                            {OPERATOR_OPTIONS.map((operator) => (
                              <SelectItem
                                key={operator.value}
                                value={operator.value}
                              >
                                {operator.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Value */}
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Value
                        </Label>
                        {(() => {
                          const fieldType = FIELD_OPTIONS.find(
                            (f) => f.value === condition.field
                          )?.type;

                          if (fieldType === 'date') {
                            return (
                              <Input
                                type="date"
                                placeholder="Select date"
                                value={condition.value}
                                onChange={(e) =>
                                  updateCondition(
                                    index,
                                    'value',
                                    e.target.value
                                  )
                                }
                              />
                            );
                          } else if (fieldType === 'number') {
                            return (
                              <Input
                                type="number"
                                placeholder="Enter value"
                                value={condition.value}
                                onChange={(e) =>
                                  updateCondition(
                                    index,
                                    'value',
                                    Number.parseFloat(e.target.value) || ''
                                  )
                                }
                              />
                            );
                          } else {
                            return (
                              <Input
                                type="text"
                                placeholder="Enter value"
                                value={condition.value}
                                onChange={(e) =>
                                  updateCondition(
                                    index,
                                    'value',
                                    e.target.value
                                  )
                                }
                              />
                            );
                          }
                        })()}
                      </div>
                    </div>

                    {/* Remove button */}
                    {segment.conditions.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCondition(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}

                    {/* Logic indicator */}
                    {index < segment.conditions.length - 1 && (
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                        <Badge variant="secondary" className="text-xs">
                          {segment.logic}
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={addCondition}
                  className="w-full bg-transparent"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Condition
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audience Preview</CardTitle>
              <CardDescription>
                See how many customers match your segment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={previewAudience}
                disabled={isPreviewLoading}
                className="w-full"
              >
                {isPreviewLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Audience
                  </>
                )}
              </Button>

              {audienceSize !== null && (
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {audienceSize}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    customers match this segment
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Segment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Name</Label>
                <p className="font-medium">
                  {segment.name || 'Untitled Segment'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Conditions
                </Label>
                <p className="text-sm">
                  {segment.conditions.length} rule(s) with {segment.logic} logic
                </p>
              </div>
              {isAIGenerated && (
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Source
                  </Label>
                  <div className="flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-purple-600" />
                    <p className="text-sm text-purple-600">Generated by AI</p>
                  </div>
                </div>
              )}
              <Separator />
              <Button
                onClick={saveSegment}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Segment
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
