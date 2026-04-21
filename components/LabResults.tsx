
import React, { useState, useMemo, useRef } from 'react';
import { LabResult, UserProfile } from '../types';
import { parseLabResultsFromImage } from '../services/geminiService';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceArea,
  Label
} from 'recharts';
import { Plus, TestTube2, TrendingUp, CheckCircle2, Camera, Loader2, Download } from 'lucide-react';
import { t } from '../translations';
import GentleLoader from './GentleLoader';

interface LabResultsProps {
  labData: LabResult[];
  onAddResult: (result: LabResult) => void;
  userProfile: UserProfile;
}

// Mock database of standard ranges
const STANDARD_RANGES: Record<string, { min: number; max: number; unit: string; description: string }> = {
  'CRP (C-Reactive Protein)': { min: 0, max: 10, unit: 'mg/L', description: 'Marker for inflammation.' },
  'ESR (Sed Rate)': { min: 0, max: 20, unit: 'mm/hr', description: 'Inflammation marker. Higher in females.' },
  'Hemoglobin': { min: 12, max: 15.5, unit: 'g/dL', description: 'Oxygen carrying capacity.' },
  'WBC (White Blood Cells)': { min: 4.5, max: 11, unit: 'K/uL', description: 'Immune system activity.' },
  'Platelets': { min: 150, max: 450, unit: 'K/uL', description: 'Clotting ability.' },
  'TSH': { min: 0.4, max: 4.0, unit: 'mIU/L', description: 'Thyroid function.' },
  'Vitamin D': { min: 30, max: 100, unit: 'ng/mL', description: 'Bone and immune health.' },
  'RF (Rheumatoid Factor)': { min: 0, max: 14, unit: 'IU/mL', description: 'Autoantibody marker.' },
};

const COMMON_TESTS = Object.keys(STANDARD_RANGES);

const LabResults: React.FC<LabResultsProps> = ({ labData, onAddResult, userProfile }) => {
  const language = userProfile.language || 'English';
  const [isAdding, setIsAdding] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string>(COMMON_TESTS[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [newResult, setNewResult] = useState<Partial<LabResult>>({
    date: new Date().toISOString().split('T')[0],
    testName: COMMON_TESTS[0],
    category: 'Blood',
    value: 0,
    unit: STANDARD_RANGES[COMMON_TESTS[0]].unit,
    notes: ''
  });

  // Filter data for the chart
  const chartData = useMemo(() => {
    return labData
      .filter(r => r.testName === selectedTest)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [labData, selectedTest]);

  // Determine Range based on Demographics
  const getReferenceRange = (testName: string) => {
    const standard = STANDARD_RANGES[testName];
    if (!standard) return null;

    let { min, max } = standard;

    // Adjust for Gender (Simplified medical logic)
    if (userProfile.gender === 'Female') {
      if (testName.includes('ESR')) max = 30; // Females have higher ESR naturally
      if (testName.includes('Hemoglobin')) { min = 12.1; max = 15.1; }
    } else if (userProfile.gender === 'Male') {
      if (testName.includes('Hemoglobin')) { min = 13.8; max = 17.2; }
    }

    return { min, max, unit: standard.unit, description: standard.description };
  };

  const currentRange = getReferenceRange(selectedTest);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResult.testName || newResult.value === undefined) return;

    const result: LabResult = {
      id: Date.now().toString(),
      date: newResult.date || new Date().toISOString().split('T')[0],
      testName: newResult.testName,
      value: Number(newResult.value),
      unit: newResult.unit || '',
      category: newResult.category as any || 'Blood',
      notes: newResult.notes || ''
    };

    onAddResult(result);
    setIsAdding(false);
    // Reset form mostly, keep date
    setNewResult(prev => ({ ...prev, value: 0, notes: '' }));
  };

  const handleTestChange = (name: string) => {
    const std = STANDARD_RANGES[name];
    setNewResult(prev => ({
      ...prev,
      testName: name,
      unit: std ? std.unit : ''
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result as string;
        const parsedData = await parseLabResultsFromImage(base64);
        
        if (parsedData) {
          setNewResult(prev => ({
            ...prev,
            ...parsedData,
            // Ensure we fallback to defaults if parsing misses something
            category: parsedData.category || 'Blood',
            date: parsedData.date || new Date().toISOString().split('T')[0],
          }));
          // Switch to the parsed test name for the chart too if valid
          if (parsedData.testName && (COMMON_TESTS.includes(parsedData.testName) || chartData.length > 0)) {
            // Optional: setSelectedTest(parsedData.testName); 
          }
          setIsAdding(true); // Open the form for review
        } else {
            alert("Could not extract data from the image. Please enter manually.");
        }
        setIsAnalyzing(false);
      };
      reader.onerror = () => {
        setIsAnalyzing(false);
        alert("Error reading file");
      };
    } catch (e) {
      console.error(e);
      setIsAnalyzing(false);
    }
    // Clear input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExport = () => {
    const headers = ['Date', 'Test Name', 'Value', 'Unit', 'Category', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...labData.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(row => 
        [
          row.date, 
          `"${row.testName}"`, 
          row.value, 
          row.unit, 
          row.category, 
          `"${(row.notes || '').replace(/"/g, '""')}"`
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `HealUp_Lab_Results_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const val = payload[0].value;
        const isSafe = currentRange ? (val >= currentRange.min && val <= currentRange.max) : true;
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-xl text-sm">
          <p className="font-bold text-gray-800">{new Date(label).toLocaleDateString()}</p>
          <p className="text-matcha-700 font-semibold">
            {val} {currentRange?.unit}
          </p>
          {currentRange && (
             <p className={`text-xs mt-1 ${isSafe ? 'text-green-600' : 'text-amber-600'}`}>
                {isSafe ? 'Within Fellows\' Range' : 'Out of Fellows\' Range'}
             </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="healup-reveal space-y-8 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('labTitle', language)}</h1>
          <p className="text-gray-500">{t('labSubtitle', language)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
           <button 
            onClick={handleExport}
            className="healup-card flex items-center gap-2 rounded-[24px] px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
           >
            <Download size={16} /> {t('exportCsv', language)}
           </button>
           <div className="w-px h-8 bg-gray-200 mx-1 hidden md:block"></div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*" 
            capture="environment"
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
            className="healup-card flex items-center gap-2 rounded-[24px] px-4 py-2.5 text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            {isAnalyzing ? <Loader2 size={18} className="animate-spin"/> : <Camera size={18} />}
            {t('scanResult', language)}
          </button>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="healup-button flex items-center gap-2 rounded-[24px] px-4 py-2.5 text-white transition-colors hover:bg-matcha-700"
          >
            {isAdding ? 'Cancel' : <><Plus size={18} /> {t('addManually', language)}</>}
          </button>
        </div>
      </header>

      {/* Add Form */}
      {isAdding && (
        <div className="healup-card relative overflow-hidden rounded-[30px] p-7 animate-in slide-in-from-top-2">
          {isAnalyzing && (
             <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center flex-col text-matcha-800">
               <GentleLoader
                 title="Reading your lab report gently"
                 subtitle="Please take a moment while we pull the details into the form for review."
                 compact
               />
             </div>
          )}
          
          <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800">Log Test Result</h3>
              <span className="text-xs text-matcha-600 bg-matcha-50 px-2 py-1 rounded-full font-medium">
                  Please review all details before saving
              </span>
          </div>
          
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
              <input 
                type="date" 
                required
                value={newResult.date}
                onChange={(e) => setNewResult({...newResult, date: e.target.value})}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-matcha-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Test Name</label>
              <div className="relative">
                <input 
                    type="text" 
                    list="testNames"
                    value={newResult.testName}
                    onChange={(e) => {
                        const val = e.target.value;
                        setNewResult({...newResult, testName: val});
                        // If user types a known test, update unit
                        if(STANDARD_RANGES[val]) handleTestChange(val);
                    }}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-matcha-500 outline-none"
                />
                <datalist id="testNames">
                    {COMMON_TESTS.map(t => <option key={t} value={t} />)}
                </datalist>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Value</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={newResult.value}
                  onChange={(e) => setNewResult({...newResult, value: parseFloat(e.target.value) || 0})}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-matcha-500 outline-none"
                />
              </div>
              <div className="w-24">
                <label className="block text-xs font-medium text-gray-500 mb-1">Unit</label>
                <input 
                  type="text" 
                  value={newResult.unit}
                  onChange={(e) => setNewResult({...newResult, unit: e.target.value})}
                  className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50"
                />
              </div>
            </div>
             <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
              <select 
                value={newResult.category}
                onChange={(e) => setNewResult({...newResult, category: e.target.value as any})}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-matcha-500 outline-none"
              >
                <option value="Blood">Blood</option>
                <option value="Urine">Urine</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                <input 
                  type="text" 
                  placeholder="e.g. Fasting, felt dizzy..."
                  value={newResult.notes}
                  onChange={(e) => setNewResult({...newResult, notes: e.target.value})}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-matcha-500 outline-none"
                />
            </div>
            <div className="md:col-span-2">
                <button type="submit" className="w-full bg-matcha-600 text-white font-bold py-2 rounded-lg hover:bg-matcha-700 flex items-center justify-center gap-2">
                    <CheckCircle2 size={18} /> Confirm & Save Record
                </button>
            </div>
          </form>
        </div>
      )}

      {/* Analysis Section */}
      <div className="grid gap-8 lg:grid-cols-3">
        
        {/* Main Chart */}
        <div className="healup-card lg:col-span-2 rounded-[30px] p-7">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp size={20} className="text-matcha-600"/> 
                {t('trendAnalysis', language)}
              </h2>
              {currentRange && (
                <p className="text-xs text-gray-500 mt-1">
                   Fellow Patients' Range ({userProfile.gender || 'Standard'}): 
                   <span className="font-semibold text-matcha-700"> {currentRange.min} - {currentRange.max} {currentRange.unit}</span>
                </p>
              )}
            </div>
            <select 
              value={selectedTest}
              onChange={(e) => setSelectedTest(e.target.value)}
              className="rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm focus:outline-none"
            >
                {/* Only show tests that actually have data available + defaults */}
                {Array.from(new Set([...COMMON_TESTS, ...labData.map(d => d.testName)])).map(t => (
                    <option key={t} value={t}>{t}</option>
                ))}
            </select>
          </div>

          <div className="h-72 w-full">
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                        dataKey="date" 
                        tick={{fontSize: 12}} 
                        stroke="#9ca3af" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                    />
                    <YAxis stroke="#9ca3af" tick={{fontSize: 12}} domain={['auto', 'auto']} />
                    <Tooltip content={<CustomTooltip />} />
                    
                    {/* Fellow Patients' Range Area */}
                    {currentRange && (
                        <ReferenceArea 
                            y1={currentRange.min} 
                            y2={currentRange.max} 
                            fill="#8ccc81" 
                            fillOpacity={0.15} 
                        >
                            <Label value="Fellow Patients' Range" position="insideTopRight" fill="#66b059" fontSize={10} />
                        </ReferenceArea>
                    )}
                    
                    <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#6a8963" 
                        strokeWidth={3.5} 
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        dot={{fill: '#6a8963', r: 4}} 
                        activeDot={{r: 6, fill: '#7ea96b', stroke: '#fffdf9', strokeWidth: 2}} 
                    />
                </LineChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <TestTube2 size={48} className="mb-2 opacity-50" />
                    <p>No data recorded for {selectedTest} yet.</p>
                </div>
            )}
          </div>
        </div>

        {/* Info Card / Legend */}
        <div className="space-y-6">
            <div className="healup-card rounded-[30px] p-7">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-matcha-600"/>
                    Understanding Results
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    {currentRange?.description || "Select a test to see details about what it measures and why it matters for your condition."}
                </p>
                
                <div className="healup-card-soft rounded-[24px] p-5">
                    <h4 className="text-xs font-bold text-matcha-800 mb-2 uppercase tracking-wide">Comparison Cohort</h4>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Gender</span>
                        <span className="font-semibold text-gray-800">{userProfile.gender || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-gray-600">Age Group</span>
                        <span className="font-semibold text-gray-800">{userProfile.age ? `${Math.floor(Number(userProfile.age)/10)*10}s` : 'Unknown'}</span>
                    </div>
                </div>
            </div>

            {/* Recent History Mini List */}
            <div className="healup-card h-[300px] overflow-y-auto rounded-[30px] p-7">
                 <h3 className="sticky top-0 mb-4 border-b border-gray-100 bg-[#fffdf9] pb-2 font-bold text-gray-900">{t('recentLogs', language)}</h3>
                 <div className="space-y-3">
                    {labData.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map(log => (
                        <div key={log.id} className="flex justify-between items-center text-sm">
                            <div>
                                <p className="font-semibold text-gray-800">{log.testName}</p>
                                <p className="text-xs text-gray-500">{new Date(log.date).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <span className="font-bold text-matcha-700">{log.value}</span>
                                <span className="text-xs text-gray-400 ml-1">{log.unit}</span>
                            </div>
                        </div>
                    ))}
                    {labData.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No history yet.</p>}
                 </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default LabResults;
