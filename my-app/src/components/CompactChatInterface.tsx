"use client";

import { useState } from "react";
import { Send, Loader2, MessageSquare, X, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { classifyProduct } from "@/lib/chat";
import { HSCode, ChatResponse } from "@/types/chat";
import { toast } from "sonner";

interface CompactChatInterfaceProps {
  onHSCodeSelect?: (hsCode: HSCode) => void;
}

export function CompactChatInterface({ onHSCodeSelect }: CompactChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    setResponse(null);

    try {
      const result = await classifyProduct(input.trim());
      setResponse(result);
      setIsExpanded(true);
    } catch (error) {
      toast.error("Failed to classify product. Please try again.");
      console.error('Classification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleUseHSCode = (hsCode: HSCode) => {
    if (onHSCodeSelect) {
      onHSCodeSelect(hsCode);
      toast.success(`HS Code ${hsCode.hs_code} selected for your product`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="w-5 h-5 text-blue-500" />
          AI HS Code Assistant
        </CardTitle>
        <p className="text-sm text-gray-600">
          Describe your product to get AI-powered HS code suggestions
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your product (e.g., 'cotton t-shirts', 'smartphone cases')..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSearch} 
            disabled={!input.trim() || isLoading}
            className="px-4"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Analyzing product...</span>
            </div>
          </div>
        )}

        {/* Results */}
        {response && isExpanded && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-800">
                Results for: "{response.query}"
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {response.error ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{response.error}</p>
              </div>
            ) : response.hs_codes && response.hs_codes.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {response.hs_codes.map((hsCode, index) => (
                  <div 
                    key={index}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium text-blue-600">
                          {hsCode.hs_code}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {hsCode.type_of_product}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(hsCode.hs_code)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        {onHSCodeSelect && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleUseHSCode(hsCode)}
                            className="h-6 px-2 text-xs"
                          >
                            Use
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {hsCode.hs_description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-600 text-sm">
                  No HS codes found. Try rephrasing your product description.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Collapsed Results Indicator */}
        {response && !isExpanded && (
          <Button
            variant="outline"
            onClick={() => setIsExpanded(true)}
            className="w-full text-sm"
          >
            Show {response.hs_codes?.length || 0} HS Code Results
          </Button>
        )}
      </CardContent>
    </Card>
  );
}