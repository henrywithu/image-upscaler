'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { 
  Upload, 
  Settings as SettingsIcon, 
  Image as ImageIcon, 
  Download, 
  RefreshCw, 
  Key, 
  Trash2, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { ImageComparison } from '@/components/ImageComparison';
import { runUpscale } from '@/app/lib/upscale-actions';

interface ProcessItem {
  id: string;
  name: string;
  original: string;
  upscaled?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
  progress: number;
}

export default function ChaewonHDApp() {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-2.5-flash-image');
  const [ratio, setRatio] = useState('16:9');
  const [resolution, setResolution] = useState('2K');
  const [items, setItems] = useState<ProcessItem[]>([]);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Handle Theme Switching
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const onFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newItems: ProcessItem[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      original: '', 
      status: 'pending',
      progress: 0
    }));

    setItems(prev => [...prev, ...newItems]);

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setItems(prev => prev.map(item => 
          item.name === file.name && !item.original ? { ...item, original: reader.result as string } : item
        ));
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleUpscale = async (item: ProcessItem) => {
    if (!apiKey) {
      toast({ variant: 'destructive', title: 'API Key Required', description: 'Please enter your Google AI API key in the settings panel.' });
      return;
    }

    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'processing', progress: 30 } : i));

    try {
      const result = await runUpscale({
        images: [item.original],
        modelName: model,
        resolutionPrompt: resolution,
        aspectRatio: ratio
      }, apiKey);

      setItems(prev => prev.map(i => i.id === item.id ? { 
        ...i, 
        upscaled: result.upscaledImages[0], 
        status: 'completed', 
        progress: 100 
      } : i));
    } catch (error: any) {
      setItems(prev => prev.map(i => i.id === item.id ? { 
        ...i, 
        status: 'error', 
        error: error.message,
        progress: 0 
      } : i));
      toast({ variant: 'destructive', title: 'Generation Error', description: error.message });
    }
  };

  const upscaleAll = async () => {
    const pendingItems = items.filter(i => i.status === 'pending');
    if (pendingItems.length === 0) return;
    
    setIsProcessingAll(true);
    for (const item of pendingItems) {
      await handleUpscale(item);
    }
    setIsProcessingAll(false);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    const baseName = filename.substring(0, filename.lastIndexOf('.')) || filename;
    link.download = `upscaled-${baseName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <Toaster />
      
      {/* Navigation Header */}
      <header className="border-b bg-card py-4 px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-xl">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-primary">ChaewonHD</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Sun className={`w-4 h-4 ${theme === 'light' ? 'text-primary' : 'text-muted-foreground'}`} />
            <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} aria-label="Toggle dark mode" />
            <Moon className={`w-4 h-4 ${theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          
          <Separator orientation="vertical" className="h-6 hidden sm:block" />
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="hidden sm:flex bg-muted/50 border-primary/20 text-primary">AI-Powered Clarity</Badge>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Key className="w-4 h-4" />
              <span className="max-w-[100px] truncate">{apiKey ? 'Key set' : 'No API key'}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        
        {/* Section 1: Settings & Configuration */}
        <section className="lg:col-span-3 space-y-6 overflow-y-auto">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <SettingsIcon className="w-5 h-5 text-primary" />
                Configuration
              </CardTitle>
              <CardDescription>Configure your AI upscaler API and parameters.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">Google API Key</Label>
                <div className="relative">
                  <Input 
                    id="apiKey" 
                    type="password" 
                    placeholder="Enter your API Key..." 
                    className="pr-10"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <Key className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-[10px] text-muted-foreground">Used for Gemini Image API requests.</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>AI Model</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini-2.5-flash-image">Gemini 2.5 Flash Image</SelectItem>
                    <SelectItem value="gemini-3.1-flash-image-preview">Gemini 3.1 Flash Image</SelectItem>
                    <SelectItem value="gemini-3-pro-image-preview">Gemini 3 Pro Image (High Quality)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Target Ratio</Label>
                <Select value={ratio} onValueChange={setRatio}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ratio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1:1">1:1 Square</SelectItem>
                    <SelectItem value="1:4">1:4 Ultra Tall</SelectItem>
                    <SelectItem value="1:8">1:8 Panoramic Tall</SelectItem>
                    <SelectItem value="2:3">2:3 Vertical</SelectItem>
                    <SelectItem value="3:2">3:2 Classic</SelectItem>
                    <SelectItem value="3:4">3:4 Portrait</SelectItem>
                    <SelectItem value="4:1">4:1 Panoramic Wide</SelectItem>
                    <SelectItem value="4:3">4:3 Standard</SelectItem>
                    <SelectItem value="4:5">4:5 Instagram</SelectItem>
                    <SelectItem value="5:4">5:4 Traditional</SelectItem>
                    <SelectItem value="8:1">8:1 Ultra Wide</SelectItem>
                    <SelectItem value="9:16">9:16 Social Video</SelectItem>
                    <SelectItem value="16:9">16:9 Cinema</SelectItem>
                    <SelectItem value="21:9">21:9 Ultrawide</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Target Resolution</Label>
                <Select value={resolution} onValueChange={setResolution}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select resolution" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="512">512px</SelectItem>
                    <SelectItem value="1K">1K (1080p)</SelectItem>
                    <SelectItem value="2K">2K (QHD)</SelectItem>
                    <SelectItem value="4K">4K (UHD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground border-none shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Upload className="w-5 h-5" />
                </div>
                <h3 className="font-semibold">Quick Start</h3>
              </div>
              <p className="text-sm opacity-90 mb-6">
                Upload your images, verify your settings, and let our AI enhance every pixel for you.
              </p>
              <div className="relative">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  onChange={onFileUpload}
                />
                <Button variant="secondary" className="w-full bg-white text-primary hover:bg-white/90">
                  Choose Files
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 2: Processing Status & Upload Management */}
        <section className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
          <Card className="flex-1 flex flex-col overflow-hidden border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-lg">Uploads & Status</CardTitle>
                <CardDescription>{items.length} images in queue.</CardDescription>
              </div>
              {items.length > 0 && (
                <Button 
                  size="sm" 
                  className="bg-accent text-accent-foreground hover:bg-accent/80"
                  disabled={isProcessingAll || items.every(i => i.status !== 'pending')}
                  onClick={upscaleAll}
                >
                  {isProcessingAll ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Upscale All
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
              <ScrollArea className="flex-1 px-6 pb-6">
                <div className="space-y-4">
                  {items.length === 0 ? (
                    <div className="h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center p-6 bg-muted/10">
                      <ImageIcon className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                      <p className="text-muted-foreground">No images uploaded yet.</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Drag and drop or use the choose files button.</p>
                    </div>
                  ) : (
                    items.map((item) => (
                      <div key={item.id} className="group relative bg-card border rounded-xl p-4 transition-all hover:border-primary/50 hover:shadow-sm">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                            {item.original && <img src={item.original} alt={item.name} className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-medium truncate pr-4">{item.name}</h4>
                              <button 
                                onClick={() => removeItem(item.id)}
                                className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <div className="flex items-center gap-2 mb-2">
                              {item.status === 'pending' && <Badge variant="secondary" className="text-[10px] py-0">Pending</Badge>}
                              {item.status === 'processing' && (
                                <Badge variant="default" className="text-[10px] py-0 bg-primary animate-pulse">
                                  Processing...
                                </Badge>
                              )}
                              {item.status === 'completed' && (
                                <Badge variant="default" className="text-[10px] py-0 bg-green-500 hover:bg-green-600">
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> Ready
                                </Badge>
                              )}
                              {item.status === 'error' && (
                                <Badge variant="destructive" className="text-[10px] py-0">
                                  Error
                                </Badge>
                              )}
                            </div>

                            {(item.status === 'processing' || item.status === 'completed') && (
                              <Progress value={item.progress} className="h-1.5" />
                            )}
                            
                            {item.status === 'error' && (
                              <p className="text-[10px] text-destructive truncate">{item.error}</p>
                            )}
                          </div>
                        </div>
                        
                        {item.status === 'pending' && (
                          <div className="mt-3 flex justify-end">
                            <Button size="sm" variant="ghost" className="h-8 text-primary" onClick={() => handleUpscale(item)}>
                              Process
                              <ArrowRight className="w-3 h-3 ml-2" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </section>

        {/* Section 3: Output/Preview Gallery */}
        <section className="lg:col-span-5 flex flex-col gap-6 overflow-hidden">
          <Card className="flex-1 flex flex-col overflow-hidden border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Preview & Comparison</CardTitle>
              <CardDescription>View your enhanced results and download files.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
              <ScrollArea className="flex-1 px-6 pb-6">
                <div className="space-y-8">
                  {items.filter(i => i.status === 'completed' && i.upscaled).length === 0 ? (
                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-muted/5 rounded-xl border-2 border-dashed">
                      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                        <Sparkles className="w-10 h-10 text-muted-foreground/40" />
                      </div>
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">No results yet</h3>
                      <p className="text-sm text-muted-foreground max-w-xs">
                        Start the upscaling process to see the magic happen here. Compare original and AI-enhanced results in real-time.
                      </p>
                    </div>
                  ) : (
                    items.filter(i => i.status === 'completed' && i.upscaled).map((item) => (
                      <div key={`result-${item.id}`} className="space-y-3 bg-muted/10 p-4 rounded-xl border border-primary/10">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            {item.name}
                          </h4>
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className="h-8 bg-primary text-white hover:bg-primary/90"
                            onClick={() => downloadImage(item.upscaled!, item.name)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                        
                        <div className="relative group overflow-hidden rounded-lg shadow-xl">
                          <ImageComparison 
                            original={item.original} 
                            upscaled={item.upscaled!} 
                            className="aspect-[4/3]"
                          />
                        </div>
                        
                        <div className="flex gap-4 pt-2">
                          <div className="flex-1 text-[10px] text-muted-foreground bg-white/50 p-2 rounded">
                            <span className="block font-bold uppercase mb-1">Source Details</span>
                            <span>Original resolution • Low dynamic range</span>
                          </div>
                          <div className="flex-1 text-[10px] text-primary bg-primary/5 p-2 rounded">
                            <span className="block font-bold uppercase mb-1">AI Enhancements</span>
                            <span>{resolution} • {ratio} Ratio • Super Resolution (PNG)</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </section>

      </main>

      {/* Footer Info */}
      <footer className="py-3 px-6 border-t bg-card text-[10px] text-muted-foreground flex justify-between items-center">
        <p>© 2024 ChaewonHD AI. All processing is powered by Gemini AI.</p>
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> Secure Processing</span>
          <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> Local Downloads</span>
        </div>
      </footer>
    </div>
  );
}
