import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { categorizationService } from '@/services/categorization';
import { ExpenseCategory } from '@/types';
import { CATEGORY_CONFIG } from '@/constants/categories';
import { Brain, TestTube, Target, Zap, AlertCircle } from 'lucide-react';

interface TestTransaction {
  id: string;
  description: string;
  merchantName?: string;
  upiTransactionId?: string;
  expectedCategory?: ExpenseCategory;
}

const testTransactions: TestTransaction[] = [
  {
    id: '1',
    description: 'Lunch order from restaurant',
    merchantName: 'Zomato',
    upiTransactionId: 'zomato123@paytm',
    expectedCategory: ExpenseCategory.FOOD
  },
  {
    id: '2',
    description: 'Cab ride to college',
    merchantName: 'Uber',
    upiTransactionId: 'uber456@paytm',
    expectedCategory: ExpenseCategory.TRANSPORT
  },
  {
    id: '3',
    description: 'Buy programming book',
    merchantName: 'Amazon',
    expectedCategory: ExpenseCategory.BOOKS
  },
  {
    id: '4',
    description: 'Movie ticket booking',
    merchantName: 'BookMyShow',
    expectedCategory: ExpenseCategory.ENTERTAINMENT
  },
  {
    id: '5',
    description: 'Medical checkup and medicines',
    merchantName: 'Apollo Hospital',
    expectedCategory: ExpenseCategory.EMERGENCY
  },
  {
    id: '6',
    description: 'Monthly hostel mess fee payment',
    expectedCategory: ExpenseCategory.HOSTEL
  },
  {
    id: '7',
    description: 'Coffee with friends at cafe',
    merchantName: 'Café Coffee Day',
    expectedCategory: ExpenseCategory.FOOD
  },
  {
    id: '8',
    description: 'Auto rickshaw to market',
    expectedCategory: ExpenseCategory.TRANSPORT
  }
];

export function CategorizationDemo() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [customTest, setCustomTest] = useState({
    description: '',
    merchantName: '',
    upiTransactionId: ''
  });
  const [customResult, setCustomResult] = useState<any>(null);

  const runBatchTest = async () => {
    setIsRunning(true);
    const results = [];

    for (const testTx of testTransactions) {
      const result = categorizationService.categorize(
        testTx.description,
        testTx.merchantName,
        testTx.upiTransactionId
      );

      const debug = categorizationService.getCategorizationDebug(
        testTx.description,
        testTx.merchantName,
        testTx.upiTransactionId
      );

      results.push({
        id: testTx.id,
        input: testTx,
        result,
        debug,
        isCorrect: result.category === testTx.expectedCategory
      });

      // Add a small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const runCustomTest = () => {
    if (!customTest.description.trim()) return;

    const result = categorizationService.categorize(
      customTest.description,
      customTest.merchantName || undefined,
      customTest.upiTransactionId || undefined
    );

    const debug = categorizationService.getCategorizationDebug(
      customTest.description,
      customTest.merchantName || undefined,
      customTest.upiTransactionId || undefined
    );

    setCustomResult({ result, debug });
  };

  const accuracy = testResults.length > 0 
    ? (testResults.filter(r => r.isCorrect).length / testResults.length) * 100
    : 0;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Brain className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Categorization Engine Demo</h1>
          <p className="text-muted-foreground">
            Test the AI-powered expense categorization system
          </p>
        </div>
      </div>

      {/* Batch Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Batch Test - Predefined Scenarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Test {testTransactions.length} predefined transactions
                </p>
                {testResults.length > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Accuracy: {accuracy.toFixed(1)}%
                    </Badge>
                    <Badge variant="outline">
                      {testResults.filter(r => r.isCorrect).length}/{testResults.length} correct
                    </Badge>
                  </div>
                )}
              </div>
              <Button 
                onClick={runBatchTest} 
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                {isRunning ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Running...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Run Batch Test
                  </>
                )}
              </Button>
            </div>

            {testResults.length > 0 && (
              <div className="space-y-2">
                {testResults.map((test) => {
                  const config = CATEGORY_CONFIG[test.result.category];
                  const expectedConfig = test.input.expectedCategory 
                    ? CATEGORY_CONFIG[test.input.expectedCategory]
                    : null;

                  return (
                    <div 
                      key={test.id}
                      className={`p-3 rounded-lg border ${
                        test.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium truncate">
                              {test.input.description}
                            </span>
                            {test.input.merchantName && (
                              <Badge variant="outline" className="text-xs">
                                {test.input.merchantName}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Predicted:</span>
                            <Badge variant="default">
                              {config.icon} {config.name}
                            </Badge>
                            <span className={`font-medium ${getConfidenceColor(test.result.confidence)}`}>
                              {Math.round(test.result.confidence * 100)}%
                            </span>
                            
                            {expectedConfig && (
                              <>
                                <span className="text-muted-foreground mx-2">vs Expected:</span>
                                <Badge variant="outline">
                                  {expectedConfig.icon} {expectedConfig.name}
                                </Badge>
                              </>
                            )}
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-1">
                            {test.result.reason}
                          </p>
                        </div>
                        
                        <div className="ml-3">
                          {test.isCorrect ? (
                            <Target className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Custom Test */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Test - Try Your Own</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Transaction Description *</label>
              <Textarea
                placeholder="e.g., Lunch order from restaurant, Cab to office, etc."
                value={customTest.description}
                onChange={(e) => setCustomTest(prev => ({ 
                  ...prev, 
                  description: e.target.value 
                }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Merchant Name (Optional)</label>
                <Input
                  placeholder="e.g., Zomato, Uber, Amazon"
                  value={customTest.merchantName}
                  onChange={(e) => setCustomTest(prev => ({ 
                    ...prev, 
                    merchantName: e.target.value 
                  }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">UPI Transaction ID (Optional)</label>
                <Input
                  placeholder="e.g., zomato123@paytm"
                  value={customTest.upiTransactionId}
                  onChange={(e) => setCustomTest(prev => ({ 
                    ...prev, 
                    upiTransactionId: e.target.value 
                  }))}
                />
              </div>
            </div>
            
            <Button 
              onClick={runCustomTest}
              disabled={!customTest.description.trim()}
              className="w-full"
            >
              Test Categorization
            </Button>
            
            {customResult && (
              <div className="p-4 rounded-lg border bg-muted/50">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Result</h4>
                    <Badge variant="default">
                      {CATEGORY_CONFIG[customResult.result.category].icon}{' '}
                      {CATEGORY_CONFIG[customResult.result.category].name}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Confidence:</span>
                      <span className={`ml-2 font-medium ${getConfidenceColor(customResult.result.confidence)}`}>
                        {Math.round(customResult.result.confidence * 100)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reason:</span>
                      <span className="ml-2">{customResult.result.reason}</span>
                    </div>
                  </div>
                  
                  {customResult.debug.matchedKeywords.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">Matched Keywords:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {customResult.debug.matchedKeywords.slice(0, 10).map((keyword: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-sm text-muted-foreground">Category Scores:</span>
                    <div className="space-y-1 mt-1">
                      {Object.entries(customResult.debug.scores).map(([category, score]) => (
                        <div key={category} className="flex items-center gap-2">
                          <span className="text-xs w-20">
                            {CATEGORY_CONFIG[category as ExpenseCategory].name}
                          </span>
                          <Progress value={(score as number) * 20} className="h-2 flex-1" />
                          <span className="text-xs w-12 text-right">
                            {(score as number).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
