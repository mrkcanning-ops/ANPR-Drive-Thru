// src/components/dashboard/VehicleHeroCard.tsx
export default function VehicleHeroCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex overflow-hidden h-[280px]">
      
      {/* Left Side: Vehicle Data */}
      <div className="w-[45%] p-6 flex flex-col justify-center">
        
        {/* Number Plate Styling */}
        <div className="bg-yellow-400 rounded-md border-2 border-black flex items-stretch h-16 w-full max-w-[300px] mb-6">
          <div className="bg-blue-700 w-12 flex flex-col items-center justify-center rounded-l-sm">
             <span className="text-yellow-400 text-xs">UK</span>
          </div>
          <div className="flex-1 flex items-center justify-center font-bold text-4xl tracking-widest text-black">
            AB12 CDE
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
          <div className="flex items-center gap-3">
             {/* Ford Logo Placeholder */}
             <div className="w-10 h-6 bg-blue-100 rounded-full flex items-center justify-center text-[10px] text-blue-800 font-bold italic">Ford</div>
             <div>
               <p className="text-xs text-gray-500">Make</p>
               <p className="font-semibold">Ford</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-gray-400">🚗</span>
             <div>
               <p className="text-xs text-gray-500">Model</p>
               <p className="font-semibold">Focus</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <span className="w-4 h-4 bg-blue-600 rounded-full border border-gray-200"></span>
             <div>
               <p className="text-xs text-gray-500">Colour</p>
               <p className="font-semibold">Blue</p>
             </div>
          </div>
           <div className="flex items-center gap-3">
             <span className="text-gray-400">📅</span>
             <div>
               <p className="text-xs text-gray-500">Year</p>
               <p className="font-semibold">2020</p>
             </div>
          </div>
        </div>
      </div>

      {/* Right Side: Car Snapshot */}
      <div className="w-[55%] relative bg-slate-900">
         {/* You will need to pass the actual image URL here via props eventually */}
         <img 
            src="/placeholder-car.jpg" 
            alt="Vehicle Snapshot" 
            className="w-full h-full object-cover"
         />
         {/* Simulated ANPR Bounding Box */}
         <div className="absolute border-2 border-green-500 bg-green-500/10 rounded" 
              style={{ top: '65%', left: '40%', width: '25%', height: '15%' }}>
              <span className="absolute -top-6 left-0 bg-green-500 text-white text-xs px-1 rounded">AB12 CDE</span>
         </div>
      </div>
    </div>
  );
}