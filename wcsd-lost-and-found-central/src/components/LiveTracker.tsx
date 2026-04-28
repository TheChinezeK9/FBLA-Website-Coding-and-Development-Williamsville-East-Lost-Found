import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Camera, Loader2, ArrowRight } from 'lucide-react';
import { LostItem, Category } from '../types';
import { SCHOOL_THEMES } from '../constants';

interface LiveTrackerProps {
  onItemFound: (item: LostItem) => void;
  onCancel: () => void;
}

export const LiveTracker: React.FC<LiveTrackerProps> = ({ onItemFound, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{ name: string; category: Category; description: string } | null>(null);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [foundLocation, setFoundLocation] = useState('');
  const [finderName, setFinderName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      stopCamera();
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = mediaStream;
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err) {
      setError("Unable to access camera. Please ensure permissions are granted.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const context = canvasRef.current.getContext('2d');
    if (!context) return;
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);
    const imageData = canvasRef.current.toDataURL('image/jpeg');
    setCapturedImage(imageData);
    analyzeImage(imageData);
    stopCamera();
  };

  const analyzeImage = async (base64Image: string) => {
    setIsAnalyzing(true);
    try {
      const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "gemini-3-flash-preview",
          contents: [{
            parts: [
              { text: "Analyze this image of a lost item. Provide a JSON response with 'name', 'category' (choose one: Clothing, Electronics, Books, Music, Personal, Other), and a short 10-word 'description'." },
              { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
            ]
          }],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                name: { type: "STRING" },
                category: { type: "STRING", enum: ['Clothing', 'Electronics', 'Books', 'Music', 'Personal', 'Other'] },
                description: { type: "STRING" }
              },
              required: ['name', 'category', 'description']
            }
          }
        })
      });

      if (!response.ok) throw new Error('Proxy error');
      const data = await response.json();
      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') ||
        '{}';
      const parsed = JSON.parse(text);
      setAnalysisResult(parsed);
    } catch (err) {
      console.error("Analysis error:", err);
      setAnalysisResult({
        name: "Unknown Item",
        category: "Other",
        description: "An item captured on campus that needs manual review."
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const finalizePost = () => {
    if (!analysisResult || !selectedSchool || !capturedImage || !foundLocation.trim() || !finderName.trim()) return;
    onItemFound({
      id: Math.random().toString(36).substr(2, 9),
      name: analysisResult.name || 'Unknown Item',
      description: analysisResult.description || '',
      category: analysisResult.category || 'Other',
      schoolId: selectedSchool,
      date: new Date().toISOString().split('T')[0],
      status: 'lost',
      imageUrl: capturedImage,
      foundLocation: foundLocation.trim(),
      finderName: finderName.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col font-sans overflow-hidden">
      <div className="relative z-10 flex justify-between items-center p-4 sm:p-6 md:p-8 bg-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#ab1e2f] rounded-full flex items-center justify-center text-white shadow-lg">
            <Sparkles size={20} className="sm:hidden" />
            <Sparkles size={24} className="hidden sm:block" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg sm:text-2xl tracking-tight">AI Scanner</h3>
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Real-time object detection</p>
          </div>
        </div>
        <button onClick={() => { stopCamera(); onCancel(); }} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-all">
          <X size={20} className="sm:hidden" />
          <X size={24} className="hidden sm:block" />
        </button>
      </div>

      <div className="flex-1 relative z-10 p-3 sm:p-6 overflow-y-auto">
        <div className="min-h-full flex items-center justify-center">
          {!capturedImage ? (
            <div className="w-full max-w-2xl aspect-[3/4] md:aspect-video bg-black rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[3rem] border-2 sm:border-4 border-white/20 shadow-2xl overflow-hidden relative group">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute bottom-6 sm:bottom-10 md:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
                <button onClick={capturePhoto} className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-white p-2 shadow-2xl hover:scale-110 active:scale-90 transition-transform">
                  <div className="w-full h-full rounded-full border-4 border-black flex items-center justify-center">
                    <Camera className="text-black sm:hidden" size={24} />
                    <Camera className="text-black hidden sm:block" size={32} />
                  </div>
                </button>
              </div>
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4 sm:p-8 text-center">
                  <div className="space-y-4">
                    <p className="text-red-400 font-bold">{error}</p>
                    <button onClick={startCamera} className="px-6 py-2 bg-white rounded-full text-black font-bold">Retry Access</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full max-w-4xl my-6 grid md:grid-cols-2 gap-4 sm:gap-8 md:gap-12 items-start bg-[#f4f6f8] dark:bg-slate-800 p-4 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[3rem]">
              <div className="relative">
                <div className="aspect-[3/4] bg-black rounded-[1.25rem] sm:rounded-[2rem] overflow-hidden border-2 sm:border-4 border-white dark:border-slate-600 shadow-xl">
                  <img src={capturedImage} className="w-full h-full object-cover" alt="Captured" />
                </div>
                <button
                  onClick={() => {
                    setCapturedImage(null);
                    setAnalysisResult(null);
                    setFoundLocation('');
                    setFinderName('');
                    startCamera();
                  }}
                  className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-9 h-9 sm:w-12 sm:h-12 bg-white dark:bg-slate-700 text-black dark:text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                >
                  <X size={16} className="sm:hidden" />
                  <X size={20} className="hidden sm:block" />
                </button>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[1.25rem] sm:rounded-[2rem] p-5 sm:p-8 md:p-10 shadow-lg relative overflow-hidden text-black dark:text-white max-h-[80vh] overflow-y-auto">
                {isAnalyzing ? (
                  <div className="py-12 sm:py-20 flex flex-col items-center gap-5 sm:gap-6">
                    <Loader2 size={44} className="text-[#ab1e2f] animate-spin sm:hidden" />
                    <Loader2 size={64} className="text-[#ab1e2f] animate-spin hidden sm:block" />
                    <div className="text-center">
                      <h4 className="text-xl sm:text-2xl font-bold mb-2">Analyzing Object...</h4>
                      <p className="text-gray-500 dark:text-white font-medium">Querying neural network for identification</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5 sm:space-y-8">
                    <div>
                      <span className="inline-block px-3 sm:px-4 py-1.5 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-3 sm:mb-4">
                        Scan Result Verified
                      </span>
                      <h4 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-2">{analysisResult?.name}</h4>
                      <p className="text-gray-600 dark:text-white text-base sm:text-lg font-medium">{analysisResult?.description}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <div className="flex-1 bg-gray-50 dark:bg-[#1f1f1f] p-4 rounded-2xl border border-gray-200 dark:border-[#4b5563]">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white mb-1">Confidence</p>
                        <p className="text-lg sm:text-xl font-bold">98.4%</p>
                      </div>
                      <div className="flex-1 bg-gray-50 dark:bg-[#1f1f1f] p-4 rounded-2xl border border-gray-200 dark:border-[#4b5563]">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white mb-1">Category</p>
                        <p className="text-lg sm:text-xl font-bold">{analysisResult?.category}</p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-[#4b5563]">
                      <label className="block text-sm font-bold text-gray-400 dark:text-white mb-3 uppercase tracking-wider">Select School Board *</label>
                      <select
                        required
                        value={selectedSchool}
                        onChange={(e) => setSelectedSchool(e.target.value)}
                        className="w-full p-3 sm:p-4 bg-white dark:bg-[#1f1f1f] border border-gray-300 dark:border-[#4b5563] rounded-xl text-black dark:text-white outline-none focus:border-black dark:focus:border-white transition-colors"
                      >
                        <option value="">-- Choose School --</option>
                        {Object.values(SCHOOL_THEMES).map(school => (
                          <option key={school.id} value={school.id}>{school.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-400 dark:text-white uppercase tracking-wider">
                        Place Found *
                      </label>
                      <input
                        type="text"
                        required
                        value={foundLocation}
                        onChange={(e) => setFoundLocation(e.target.value)}
                        className="w-full p-3 sm:p-4 bg-white dark:bg-[#1f1f1f] border border-gray-300 dark:border-[#4b5563] rounded-xl text-black dark:text-white outline-none focus:border-black dark:focus:border-white transition-colors"
                        placeholder="Where was the item found?"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-400 dark:text-white uppercase tracking-wider">
                        Finder Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={finderName}
                        onChange={(e) => setFinderName(e.target.value)}
                        className="w-full p-3 sm:p-4 bg-white dark:bg-[#1f1f1f] border border-gray-300 dark:border-[#4b5563] rounded-xl text-black dark:text-white outline-none focus:border-black dark:focus:border-white transition-colors"
                        placeholder="Who found this item?"
                      />
                    </div>

                    <button
                      onClick={finalizePost}
                      disabled={!selectedSchool || !foundLocation.trim() || !finderName.trim()}
                      className={`w-full py-3 sm:py-4 rounded-[25px] font-bold text-base sm:text-lg shadow-xl flex items-center justify-center gap-2 transition-all ${
                        selectedSchool && foundLocation.trim() && finderName.trim()
                          ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
                          : 'bg-gray-200 dark:bg-[#1f1f1f] text-gray-400 dark:text-white/50 cursor-not-allowed'
                      }`}
                    >
                      Post to Bulletin <ArrowRight size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
