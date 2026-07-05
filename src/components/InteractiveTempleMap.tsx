import React, { useState } from "react";
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useAdvancedMarkerRef } from "@vis.gl/react-google-maps";
import { Temple, TempleComplexPOI } from "../types";
import { 
  MapPin, 
  Compass, 
  Layers, 
  Navigation, 
  Footprints, 
  Info, 
  Flame, 
  HelpCircle, 
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Map as MapIcon,
  CheckCircle2
} from "lucide-react";

interface InteractiveTempleMapProps {
  temple: Temple;
}

// Preset walking paths within a temple complex for navigation help
interface WalkingPath {
  id: string;
  name: string;
  description: string;
  distance: string;
  time: string;
  steps: { poiId: string; instruction: string }[];
}

export const InteractiveTempleMap: React.FC<InteractiveTempleMapProps> = ({ temple }) => {
  const [activeTab, setActiveTab] = useState<"blueprint" | "live">("blueprint");
  const [selectedPoi, setSelectedPoi] = useState<TempleComplexPOI | null>(
    temple.complexPOIs?.[0] || null
  );
  const [selectedPathId, setSelectedPathId] = useState<string>("full");
  const [googleMapPoi, setGoogleMapPoi] = useState<TempleComplexPOI | null>(null);
  const [hoveredPoiId, setHoveredPoiId] = useState<string | null>(null);

  // Fallback lat/lng if not specified
  const centerLat = temple.latitude || 17.6706;
  const centerLng = temple.longitude || 80.8876;

  // Retrieve Google Maps API Key
  const API_KEY =
    process.env.GOOGLE_MAPS_PLATFORM_KEY ||
    (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
    (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
    "";
  const hasValidKey = Boolean(API_KEY) && API_KEY !== "YOUR_API_KEY";

  // Pre-defined complex paths
  const walkingPaths: WalkingPath[] = [
    {
      id: "full",
      name: "Complete Darshan Path",
      description: "Step-by-step route from entering the complex to taking the holy darshan & dining.",
      distance: "450 meters",
      time: "8 mins",
      steps: [
        { poiId: "gopuram", instruction: "Enter through the grand entrance Gopuram. Footwear counter is on the left." },
        { poiId: "katta", instruction: "Proceed to Kalyana Katta if offering tonsure, or go straight to the queue complex." },
        { poiId: "sanctum", instruction: "Follow the queue corridors into the inner cave / sanctum sanctorum for holy darshan." },
        { poiId: "prasadam", instruction: "Exit the sanctum and present your ticket to collect sacred prasadam at the counter." },
        { poiId: "dining", instruction: "Follow signs towards the Annadanam Hall for free sanctified traditional lunch." }
      ]
    },
    {
      id: "quick",
      name: "Quick Darshan & Exit",
      description: "Direct route focusing on main entrance, holy darshan, and quick prasadam collection.",
      distance: "220 meters",
      time: "4 mins",
      steps: [
        { poiId: "gopuram", instruction: "Enter the main gopuram. Safely secure footwear and proceed to the quick entry lane." },
        { poiId: "sanctum", instruction: "Enter directly into the main sanctum for holy visual of the deity." },
        { poiId: "prasadam", instruction: "Collect divine prasadam and exit through the designated outer courtyard." }
      ]
    }
  ];

  const currentPath = walkingPaths.find(p => p.id === selectedPathId) || walkingPaths[0];

  // Map icon strings to Lucide components or visual badges
  const getPoiEmoji = (icon: string | undefined): string => {
    switch (icon) {
      case "gopuram": return "🛕";
      case "sanctum": return "☀️";
      case "shakti": return "🌸";
      case "prasadam": return "😋";
      case "dining": return "🍛";
      case "hair": return "💇";
      case "dhyana": return "🙏";
      case "ghats": return "🌊";
      default: return "📍";
    }
  };

  // Build external google maps driving directions link
  const getExternalMapLink = () => {
    return `https://www.google.com/maps/dir/?api=1&destination=${centerLat},${centerLng}`;
  };

  return (
    <div className="bg-white rounded-[2rem] border border-orange-200 shadow-sm overflow-hidden text-left">
      {/* Top Banner & Control */}
      <div className="bg-gradient-to-r from-amber-500/10 via-saffron-500/5 to-transparent px-6 py-5 border-b border-orange-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 font-display flex items-center gap-2">
            <Compass className="w-5 h-5 text-saffron-600 animate-spin-slow" />
            Interactive Devasthanam Map
          </h3>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
            Navigate the sacred complex of {temple.name} with ease.
          </p>
        </div>

        {/* View toggles */}
        <div className="flex bg-orange-100/50 p-1 rounded-xl self-start sm:self-auto border border-orange-100/80">
          <button
            onClick={() => setActiveTab("blueprint")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "blueprint"
                ? "bg-white text-saffron-700 shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Complex Guide
          </button>
          <button
            onClick={() => setActiveTab("live")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "live"
                ? "bg-white text-saffron-700 shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Satellite Map
          </button>
        </div>
      </div>

      {/* Blueprint Tab */}
      {activeTab === "blueprint" && (
        <div className="grid lg:grid-cols-12">
          {/* Visual Interactive Map Area */}
          <div className="lg:col-span-7 bg-[#FFFBF7] p-6 border-b lg:border-b-0 lg:border-r border-orange-100/60 relative min-h-[300px] sm:min-h-[400px] flex flex-col justify-between overflow-hidden">
            {/* Background design accents */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#d97706_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>
            
            {/* Legend / Title */}
            <div className="relative z-10 bg-white/90 backdrop-blur-xs border border-orange-100 p-2.5 rounded-xl self-start flex items-center gap-2 shadow-xs">
              <span className="w-2.5 h-2.5 bg-saffron-500 rounded-full animate-ping" />
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                Interactive Complex Map
              </span>
            </div>

            {/* Custom Interactive SVG-style Blueprint Container */}
            <div className="w-full h-64 sm:h-80 relative flex items-center justify-center my-4">
              {/* Outer boundary of the complex */}
              <div className="absolute inset-0 border-2 border-dashed border-amber-500/20 rounded-[2rem] bg-gradient-to-br from-amber-500/[0.02] to-orange-500/[0.04]"></div>

              {/* Connected path route lines (SVG layer) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                {/* Find positions of all steps in the current path to draw lines */}
                {(() => {
                  const coordinates = temple.complexPOIs || [];
                  // Map coordinates into a visual coordinate space on screen
                  // Let's map latOffset (-0.0015 to 0.0015) and lngOffset (-0.0015 to 0.0015) to percentages
                  const mapToPercentage = (latOff: number, lngOff: number) => {
                    const x = 50 + (lngOff / 0.002) * 45; // scale factor
                    const y = 50 - (latOff / 0.002) * 45; // scale factor (invert Y for map direction)
                    return { x: `${Math.max(10, Math.min(90, x))}%`, y: `${Math.max(10, Math.min(90, y))}%` };
                  };

                  const pathPois = currentPath.steps
                    .map(step => coordinates.find(c => c.id.endsWith(step.poiId) || step.poiId === "katta" && c.id.endsWith("katta") || step.poiId === "sanctum" && c.id.endsWith("sanctum") || step.poiId === "prasadam" && c.id.endsWith("prasadam") || step.poiId === "dining" && c.id.endsWith("dining") || step.poiId === "gopuram" && c.id.endsWith("gopuram") || step.poiId === "dhyana" && c.id.endsWith("dhyana") || step.poiId === "ghats" && c.id.endsWith("ghats")))
                    .filter((poi): poi is TempleComplexPOI => !!poi);

                  if (pathPois.length < 2) return null;

                  return (
                    <g>
                      {/* Dotted path lines */}
                      {pathPois.map((p, idx) => {
                        if (idx === pathPois.length - 1) return null;
                        const pNext = pathPois[idx + 1];
                        const start = mapToPercentage(p.latOffset, p.lngOffset);
                        const end = mapToPercentage(pNext.latOffset, pNext.lngOffset);
                        return (
                          <line
                            key={idx}
                            x1={start.x}
                            y1={start.y}
                            x2={end.x}
                            y2={end.y}
                            stroke="#e11d48"
                            strokeWidth="3"
                            strokeDasharray="6,4"
                            className="stroke-saffron-500"
                            style={{ opacity: 0.6 }}
                          />
                        );
                      })}
                    </g>
                  );
                })()}
              </svg>

              {/* POI Markers placed on the map */}
              {(temple.complexPOIs || []).map((poi) => {
                // Map coordinates to percentage coordinates
                const xPercent = 50 + (poi.lngOffset / 0.002) * 45;
                const yPercent = 50 - (poi.latOffset / 0.002) * 45;
                const style = {
                  left: `${Math.max(10, Math.min(90, xPercent))}%`,
                  top: `${Math.max(10, Math.min(90, yPercent))}%`
                };

                const isSelected = selectedPoi?.id === poi.id;
                const isHovered = hoveredPoiId === poi.id;
                const isPartOfPath = currentPath.steps.some(step => poi.id.endsWith(step.poiId));

                return (
                  <div
                    key={poi.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-300"
                    style={style}
                    onMouseEnter={() => setHoveredPoiId(poi.id)}
                    onMouseLeave={() => setHoveredPoiId(null)}
                  >
                    {/* Ring Pulse for Selected */}
                    {isSelected && (
                      <span className="absolute -inset-4 rounded-full bg-saffron-500/20 animate-ping pointer-events-none" />
                    )}

                    {/* Interactive Marker Button */}
                    <button
                      onClick={() => setSelectedPoi(poi)}
                      className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base border transition-all cursor-pointer shadow-sm ${
                        isSelected
                          ? "bg-gradient-saffron text-white border-saffron-600 scale-110 z-20 shadow-md shadow-saffron-300"
                          : isHovered
                          ? "bg-amber-100 text-amber-900 border-amber-400 scale-105 z-15"
                          : isPartOfPath
                          ? "bg-white text-saffron-700 border-saffron-200"
                          : "bg-white text-gray-500 border-gray-200"
                      }`}
                    >
                      <span>{getPoiEmoji(poi.icon)}</span>

                      {/* Mini indicator labels on hover */}
                      {(isHovered || isSelected) && (
                        <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur-xs text-white text-[9px] px-1.5 py-0.5 rounded-md font-sans whitespace-nowrap shadow-md pointer-events-none z-30">
                          {poi.name}
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Driving directions prompt */}
            <div className="relative z-10 flex items-center justify-between gap-3 bg-amber-50 border border-amber-100/60 p-3 rounded-2xl">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-saffron-600 animate-bounce" />
                <span className="text-[10px] sm:text-xs text-amber-900 font-medium">
                  Need external driving instructions to {temple.name}?
                </span>
              </div>
              <a
                href={getExternalMapLink()}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 bg-white hover:bg-orange-50 text-saffron-700 hover:text-saffron-800 text-[10px] sm:text-xs font-bold rounded-lg border border-orange-100 transition-colors flex items-center gap-1 shrink-0"
              >
                Get Directions
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* POI Description & Navigation steps Column */}
          <div className="lg:col-span-5 p-6 space-y-6 flex flex-col justify-between">
            {/* POI details section */}
            <div className="space-y-4">
              <span className="text-[10px] text-saffron-600 font-bold bg-saffron-50 px-2 py-0.5 rounded-md uppercase tracking-wider block w-max">
                Selected Spot Info
              </span>

              {selectedPoi ? (
                <div className="bg-[#FFFDFB] border border-orange-100 p-4 rounded-2xl space-y-2 relative overflow-hidden">
                  <div className="absolute top-3 right-3 text-2xl opacity-10 font-bold select-none">
                    {getPoiEmoji(selectedPoi.icon)}
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <span className="text-lg leading-none">{getPoiEmoji(selectedPoi.icon)}</span>
                    {selectedPoi.name}
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed font-sans">
                    {selectedPoi.description}
                  </p>
                  
                  {/* Dynamic Walking help */}
                  <div className="pt-2 mt-2 border-t border-orange-50 flex justify-between items-center text-[10px] text-gray-400">
                    <span className="font-mono">Coordinates Offset: {selectedPoi.latOffset.toFixed(4)}, {selectedPoi.lngOffset.toFixed(4)}</span>
                    <button
                      onClick={() => {
                        // Highlight first step matching selected poi or center on it
                        const matchingStep = currentPath.steps.findIndex(step => selectedPoi.id.endsWith(step.poiId));
                        if (matchingStep !== -1) {
                          alert(`Navigating to ${selectedPoi.name} from complex entrance: Follow Step ${matchingStep + 1} of the ${currentPath.name}.`);
                        }
                      }}
                      className="text-saffron-600 font-bold hover:underline flex items-center gap-0.5"
                    >
                      Inner Route
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 text-center text-xs text-gray-400">
                  Click on any icon in the map to view detailed spiritual profile and navigation help.
                </div>
              )}
            </div>

            {/* Internal walking path selector */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                  Complex Walking Routes
                </span>
                <span className="text-[10px] text-saffron-600 font-bold font-mono">
                  🚶 {currentPath.distance} ({currentPath.time})
                </span>
              </div>

              {/* Path Toggles */}
              <div className="grid grid-cols-2 gap-2">
                {walkingPaths.map((path) => (
                  <button
                    key={path.id}
                    onClick={() => {
                      setSelectedPathId(path.id);
                      // Select first POI of the newly selected path
                      const firstStepId = path.steps[0]?.poiId;
                      const matchedPoi = temple.complexPOIs?.find(poi => poi.id.endsWith(firstStepId));
                      if (matchedPoi) setSelectedPoi(matchedPoi);
                    }}
                    className={`p-2.5 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                      selectedPathId === path.id
                        ? "bg-gradient-saffron/10 border-saffron-300 text-saffron-900"
                        : "bg-white border-gray-100 hover:border-gray-200 text-gray-600"
                    }`}
                  >
                    <span className="font-bold block text-[11px] leading-tight">{path.name}</span>
                    <span className="text-[9px] text-gray-400 block mt-0.5 font-sans leading-none">{path.time} • {path.distance}</span>
                  </button>
                ))}
              </div>

              {/* Path Steps Stepper */}
              <div className="space-y-2 bg-slate-50/50 p-3 rounded-2xl border border-gray-100/50 max-h-48 overflow-y-auto">
                <p className="text-[10px] font-medium text-gray-500 italic pb-1">
                  {currentPath.description}
                </p>
                {currentPath.steps.map((step, idx) => {
                  const matchedPoi = temple.complexPOIs?.find(poi => poi.id.endsWith(step.poiId));
                  const isCurrentPoiSelected = selectedPoi?.id === matchedPoi?.id;

                  return (
                    <div
                      key={idx}
                      onClick={() => matchedPoi && setSelectedPoi(matchedPoi)}
                      className={`flex gap-3 text-xs leading-relaxed p-2 rounded-lg transition-all cursor-pointer ${
                        isCurrentPoiSelected
                          ? "bg-white border border-saffron-200 shadow-2xs font-medium text-saffron-900"
                          : "hover:bg-white/60 text-gray-600"
                      }`}
                    >
                      {/* Step Indicator */}
                      <div className="flex flex-col items-center shrink-0">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                          isCurrentPoiSelected 
                            ? "bg-gradient-saffron text-white" 
                            : "bg-orange-100 text-saffron-800"
                        }`}>
                          {idx + 1}
                        </div>
                        {idx < currentPath.steps.length - 1 && (
                          <div className="w-0.5 h-full bg-orange-100/60 mt-1" />
                        )}
                      </div>

                      {/* Step Text */}
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-gray-800 block">
                          {matchedPoi ? `${getPoiEmoji(matchedPoi.icon)} ${matchedPoi.name}` : "POI Location"}
                        </span>
                        <p className="text-[10px] text-gray-500 leading-normal font-sans">
                          {step.instruction}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Google Map Tab */}
      {activeTab === "live" && (
        <div className="p-6 space-y-5">
          {/* Key verification and Splash instructions */}
          {!hasValidKey ? (
            <div className="bg-[#FFFDFB] border border-orange-100 p-8 rounded-[2rem] flex flex-col items-center text-center space-y-6 max-w-xl mx-auto my-4">
              <div className="w-16 h-16 rounded-full bg-saffron-50 flex items-center justify-center text-3xl">
                🗺️
              </div>
              <div className="space-y-2">
                <h4 className="text-base font-bold text-gray-900 font-display">
                  Live Satellite Map Experience
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed font-sans">
                  To load real-time satellite imaging, driving routes, and pinpoint navigation, configure a Google Maps Platform API Key in your project.
                </p>
              </div>

              {/* Instructions list */}
              <div className="bg-white p-4.5 rounded-2xl border border-orange-50 text-left space-y-3.5 w-full">
                <span className="text-[10px] font-bold text-saffron-800 uppercase tracking-wider block">
                  Quick API Key Setup:
                </span>
                <ol className="list-decimal list-inside text-xs text-gray-600 space-y-2 font-sans">
                  <li>
                    Get your key from <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noreferrer" className="text-saffron-600 underline font-semibold">Google Maps Console</a>.
                  </li>
                  <li>
                    Open **Settings** (⚙️ gear icon, top-right corner) → select **Secrets**.
                  </li>
                  <li>
                    Name it <code className="bg-slate-100 text-rose-600 px-1.5 py-0.5 rounded-md font-mono text-[11px]">GOOGLE_MAPS_PLATFORM_KEY</code>, paste your key, and press **Enter**.
                  </li>
                  <li>
                    The app builds automatically to active states.
                  </li>
                </ol>
              </div>

              {/* Fallback call to action */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                  onClick={() => {
                    // Triggers the vite config environment check popup
                    const keyVal = process.env.GOOGLE_MAPS_PLATFORM_KEY;
                    if (keyVal) {
                      alert("API Key detected, re-compiling components.");
                    } else {
                      alert("Open the AI Studio Secrets tab (⚙️ top right) to register GOOGLE_MAPS_PLATFORM_KEY.");
                    }
                  }}
                  className="flex-1 py-3 bg-gradient-saffron text-white rounded-xl text-xs font-bold shadow-xs hover:opacity-95 cursor-pointer"
                >
                  Prompt Key Register
                </button>
                <button
                  onClick={() => setActiveTab("blueprint")}
                  className="flex-1 py-3 bg-white text-gray-700 rounded-xl text-xs font-bold border border-gray-200 hover:bg-slate-50 cursor-pointer"
                >
                  Stay on Blueprint Guide
                </button>
              </div>
            </div>
          ) : (
            // Real google map display with active providers
            <div className="grid lg:grid-cols-12 gap-6">
              {/* Map rendering container */}
              <div className="lg:col-span-8 h-[400px] rounded-2xl border border-gray-100 overflow-hidden relative shadow-inner">
                <APIProvider apiKey={API_KEY} version="weekly">
                  <Map
                    defaultCenter={{ lat: centerLat, lng: centerLng }}
                    defaultZoom={16}
                    mapId="DEMO_MAP_ID"
                    mapTypeId="hybrid" // Satellite overlay is gorgeous for temples
                    internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
                    style={{ width: "100%", height: "100%" }}
                  >
                    {/* Main temple marker */}
                    <AdvancedMarker position={{ lat: centerLat, lng: centerLng }}>
                      <Pin background="#e11d48" glyphColor="#fff" />
                    </AdvancedMarker>

                    {/* POI Markers */}
                    {(temple.complexPOIs || []).map((poi) => (
                      <AdvancedMarker
                        key={poi.id}
                        position={{ lat: centerLat + poi.latOffset, lng: centerLng + poi.lngOffset }}
                        onClick={() => setGoogleMapPoi(poi)}
                      >
                        <div className="bg-white p-1 rounded-full border-2 border-saffron-500 shadow-md flex items-center justify-center w-7 h-7 cursor-pointer hover:scale-110 transition-transform">
                          <span className="text-sm">{getPoiEmoji(poi.icon)}</span>
                        </div>
                      </AdvancedMarker>
                    ))}

                    {/* Selected POI InfoWindow */}
                    {googleMapPoi && (
                      <InfoWindow
                        position={{
                          lat: centerLat + googleMapPoi.latOffset,
                          lng: centerLng + googleMapPoi.lngOffset
                        }}
                        onCloseClick={() => setGoogleMapPoi(null)}
                      >
                        <div className="p-2 max-w-xs space-y-1 font-sans text-left">
                          <h5 className="text-xs font-bold text-gray-900 flex items-center gap-1">
                            <span>{getPoiEmoji(googleMapPoi.icon)}</span>
                            {googleMapPoi.name}
                          </h5>
                          <p className="text-[10px] text-gray-600 leading-normal">
                            {googleMapPoi.description}
                          </p>
                        </div>
                      </InfoWindow>
                    )}
                  </Map>
                </APIProvider>
              </div>

              {/* Side bar coordinates details */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-saffron-600" />
                    GPS Geo-Coordinates
                  </h4>
                  <div className="space-y-2 font-mono text-[11px] text-gray-600">
                    <div className="flex justify-between border-b border-gray-100/60 pb-1.5">
                      <span>Latitude:</span>
                      <span className="font-semibold text-gray-900">{centerLat}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100/60 pb-1.5">
                      <span>Longitude:</span>
                      <span className="font-semibold text-gray-900">{centerLng}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Address:</span>
                      <span className="text-right text-[10px] text-gray-900 w-2/3 leading-normal">{temple.location}</span>
                    </div>
                  </div>
                </div>

                {/* Point select cards */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    Points of Interest on Map:
                  </span>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {(temple.complexPOIs || []).map((poi) => (
                      <button
                        key={poi.id}
                        onClick={() => {
                          setGoogleMapPoi(poi);
                        }}
                        className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between gap-3 cursor-pointer ${
                          googleMapPoi?.id === poi.id
                            ? "bg-saffron-50 border-saffron-300 text-saffron-900"
                            : "bg-white border-gray-100 hover:border-gray-200 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{getPoiEmoji(poi.icon)}</span>
                          <span className="font-semibold">{poi.name}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
